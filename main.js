const { app, BrowserWindow, ipcMain } = require('electron')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const proxy = require("node-tcp-proxy");
const util = require("util");
const fs = require('fs');

//write to logWarp.txt
var dataWarp="";
var myClear=0;

// some packet sever send
var ClientSendEnd=Buffer.from("59e9afadb9ab","hex");
var ClientSendEndAction=Buffer.from("59e9afada1ac","hex");
var SeverSendEndDialog=Buffer.from("59e9afadabaf","hex");

var SeverSendEndTalk=Buffer.from("59e9afadb9a5","hex");
var SeverSendEndTalk1=Buffer.from("59e9afada8a959e9afada2a7","hex");



var reSendWarp=Buffer.from("59e9aeadafafcc>","hex");
var StopAutoQuest=Buffer.from("59e9aeadafafcf>","hex");
var packetSelectOk=Buffer.from("59e9aeadb9a4b3","hex");

// variable for goCastle
var myChoose="";
var stepGoCastle=50;
var doingStep=0;
var doingStepOld=0;

// variable for goTalk
var stepTalk=0;

//variable autoQuest
var listAuto=[];
var stepAutoQuest=0;
var goNextWarp=0;
var canSendWarp=0;

//some function
function data2txt(myData){
  
  if(myData.length==13||myData.length<=9){
    myClear++
    dataWarp+=myData.toString("hex")+"\n";
    fs.writeFile('logWarp.txt', dataWarp, function (err) {});
   }

if(myClear>100){
  dataWarp="";
    fs.writeFile('logWarp.txt', dataWarp, function (err) {});
    myClear=0;
}
}
function goCastle(context,data){
  if(stepGoCastle>0){
    if((doingStep==1)&&(doingStep>doingStepOld)){
      context.serviceSocket.write(Buffer.from(newProxy.doWhere,"hex"));
      context.serviceSocket.write(Buffer.from(newProxy.doHow,"hex"));
      doingStepOld=doingStep;
      console.log("khoi dau go castle")
    }
    if((doingStep>1)&&(doingStep>doingStepOld)){
      let index=doingStep-2;
      switch(myChoose[index]){
        case "1": context.serviceSocket.write(Buffer.from("59e9abadbdacacadadad","hex")); break;
        case "2": context.serviceSocket.write(Buffer.from("59e9abadbdacafadadad","hex")); break;
        case "3": context.serviceSocket.write(Buffer.from("59e9abadbdacaeadadad","hex")); break;
        case "4": context.serviceSocket.write(Buffer.from("59e9abadbdaca9adadad","hex")); break;
      }
      doingStepOld=doingStep;
      console.log("thuc hien lua chon   " + myChoose[index])
      if(doingStep==myChoose.length+1){
        if(canSendWarp==4){
          stepAutoQuest--;
          goNextWarp++;
          canSendWarp=1;
          newProxy.doWhat="autoQuest";
        }else{
          newProxy.doWhat="end";
        }
        
        //console.log(doingStep);console.log(stepGoCastle)
        //console.log("ket thuc go castle")
      }
    }
    if(data.length>25){
      doingStep++;
      stepGoCastle--;
      console.log("tang step len 1")
    }
  }
}
function goTalk(context,data){
  if(stepTalk==1){
    sendPacket(context,newProxy.doWhere,newProxy.doHow);
    stepTalk=2;
    console.log("bat dau noi chuyen voi npc")
  }
  if(stepTalk==2){
    //sendend dialog
    if(Buffer.compare(data,SeverSendEndDialog)==0){
      context.serviceSocket.write(ClientSendEnd);
      console.log("ket thuc hoi thoai")
    }
    //sendend choose
    if(data.length>30){
      context.serviceSocket.write(packetSelectOk);
      //context.serviceSocket.write(ClientSendEnd);
     console.log("goi lua chon 1 len sever")
    // select 2:59 e9 ae ad b9 a4 b2  
    // select tat/bat:59 e9 ae ad b9 a4 85
    }
    if(data.length>22){
      context.serviceSocket.write(ClientSendEnd);
      console.log("start battle")
    }
    if((Buffer.compare(data,SeverSendEndTalk)==0)||(Buffer.compare(data,SeverSendEndTalk1)==0)){
      //context.serviceSocket.write(ClientSendEnd);
      if(canSendWarp==3){
        console.log("ket thuc noi chuyen voi npc");
        stepTalk=0;
        stepAutoQuest--;
        goNextWarp++;
        canSendWarp=0;
        newProxy.doWhat="autoQuest";
      }else{
        console.log("ket thuc noi chuyen voi npc")
        stepTalk=0;
        newProxy.doWhat="end";
      }
      
    }
  }
}
function sendPacket(context,packet1,packet2){
  context.serviceSocket.write(Buffer.from(packet1,"hex"));
  context.serviceSocket.write(Buffer.from(packet2,"hex"));
}
function autoQuest(context){
  if(stepAutoQuest==0){
    console.log("ket thuc auto Quest")
    newProxy.doWhat="end";
  }
  if((canSendWarp==1)&&(stepAutoQuest>0)){
    switch(listAuto[goNextWarp][0].slice(0,4)){
      case "Talk":{
        newProxy.doWhat="talk";
        newProxy.doWhere=listAuto[goNextWarp][1];
        newProxy.doHow=listAuto[goNextWarp][2];
        canSendWarp=3;
        stepTalk=1;
        console.log("noi chuyen voi npc trong chuoi Q")
      }break;
      case "BGH-":{
        newProxy.doWhat="goCastle";
        newProxy.doWhere=listAuto[goNextWarp][1];
        newProxy.doHow=listAuto[goNextWarp][2];
        canSendWarp=4;
        myChoose=listAuto[goNextWarp][0].slice(listAuto[goNextWarp][0].indexOf("-")+1,listAuto[goNextWarp][0].lastIndexOf("-"))
        stepGoCastle=myChoose.length+1;
        doingStep=1;
        doingStepOld=0;
        console.log("noi chuyen voi npc BGH")
      }break;
      default:{
        sendPacket(context,listAuto[goNextWarp][1],listAuto[goNextWarp][2]);
        stepAutoQuest--;
        goNextWarp++;
        canSendWarp=2;
        console.log("thuc hien warp map")
      }break;
    }
  }
}
// main

var newProxy = proxy.createProxy(6414, "103.48.192.145", 6414,{
  upstream: function(context, data) {
    //data2txt(data);
    console.log("up")
    console.log(data)
    if((Buffer.compare(data,ClientSendEndAction)==0)&&(stepAutoQuest>0)){
        canSendWarp=1;
        console.log("cho phep warp lan tiep theo")
    }
    if((Buffer.compare(data,reSendWarp)==0)&&(canSendWarp==2)){
      sendPacket(context,listAuto[goNextWarp-1][1],listAuto[goNextWarp-1][2]);
    }
    if((Buffer.compare(data,StopAutoQuest)==0)&&(canSendWarp==2)){
      stepAutoQuest=0;
      newProxy.doWhat=="end"
    }
    
    return data;
},

downstream: function(context, data) {
  
  if(newProxy.doWhat=="autoQuest"){
    autoQuest(context,data);
  }
  if(newProxy.doWhat=="goCastle"){
    goCastle(context,data);
  }
  if(newProxy.doWhat=="warp"){
    sendPacket(context,newProxy.doWhere,newProxy.doHow);
    newProxy.doWhat="end";
  }
  if(newProxy.doWhat=="talk"){
    goTalk(context,data);
  }
  
    
   // if(data.length!=17){
     // console.log("dow")
     // console.log(data)
   // }
   
  
  
    return data;
}
});
//
function createWindow () {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  
  win.loadFile('index.html');
}
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {app.quit()}
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {createWindow();}
});
ipcMain.on("action",function (event, arg) {
  let selectionAction=arg[0].slice(0,4)
  switch(selectionAction){
    case "Talk": {
      newProxy.doWhat="talk";
      newProxy.doWhere=arg[1][0];
      newProxy.doHow=arg[1][1];
      stepTalk=1;
    } break;
    case "BGH-": {
      newProxy.doWhat="goCastle";
      newProxy.doWhere=arg[1][0];
      newProxy.doHow=arg[1][1];
      myChoose=arg[0].slice(arg[0].indexOf("-")+1,arg[0].lastIndexOf("-"))
      stepGoCastle=myChoose.length+1;
      doingStep=1;
      doingStepOld=0;
      event.reply('sendListWarp',arg[0].slice(arg[0].lastIndexOf("-")+1))
    } break;
    default:{
      newProxy.doWhat="warp";
      newProxy.doWhere=arg[1][0];
      newProxy.doHow=arg[1][1];
      event.reply('sendListWarp', arg[0])
    }break;
  }
});
ipcMain.on("autoQuest",function (event, arg) {
  //console.log(arg)
  listAuto.length=0;
  for(let i=0;i<arg.length;i++){
    listAuto.push(arg[i])
  }
  stepAutoQuest=listAuto.length;
  goNextWarp=0;
  canSendWarp=1;
  newProxy.doWhat="autoQuest";
});
ipcMain.on("autoQuest1",function (event, arg) {
 
  event.reply('turnOnQuest', arg)
});



