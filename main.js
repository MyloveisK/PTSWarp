const { app, BrowserWindow, ipcMain } = require('electron')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const proxy = require("node-tcp-proxy");
const util = require("util");
const fs = require('fs');

//write to logWarp.txt
var dataWarp="";
var myClear=0;

// some packet sever send
var packetEnd=Buffer.from("59e9afadb9ab","hex");
var packetSelectOk=Buffer.from("59e9aeadb9a4b3","hex");
var packetCompare=Buffer.from("59e9afadb9a5","hex");

// variable for goCastle
var myChoose="";
var stepGoCastle=50;
var doStep=0;

//some function
function logData(myData){
  
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
function mySelection(context,select){
  switch(select){
    case "1": context.serviceSocket.write(Buffer.from("59e9abadbdacacadadad","hex")); break;
    case "2": context.serviceSocket.write(Buffer.from("59e9abadbdacafadadad","hex")); break;
    case "3": context.serviceSocket.write(Buffer.from("59e9abadbdacaeadadad","hex")); break;
    case "4": context.serviceSocket.write(Buffer.from("59e9abadbdaca9adadad","hex")); break;
  }
}

function sendPacket(context,packet){
  context.serviceSocket.write(Buffer.from(packet,"hex"));
}
function selectAndSendPacket(context,coor,myPacket){
  // myPacket có thể là id door hoặc có thể là id npc
  sendPacket(context,coor);
  sendPacket(context,myPacket);
}

// main
var newProxy = proxy.createProxy(6414, "103.48.192.145", 6414,{
  upstream: function(context, data) {
    logData(data);
    //console.log("up")
    //console.log(data)
    return data;
},

downstream: function(context, data) {
  //go Castle
  if(newProxy.warp=="goCastle"){
    
    if(stepGoCastle<=0){
      sendPacket(context,packetEnd);
      sendPacket(context,packetEnd);
      sendPacket(context,Buffer.from("59e9afada1ac","hex"));
      newProxy.warp="end";
      doStep=0;
      stepGoCastle=50;
    }else{
      
      if(doStep==1){
        selectAndSendPacket(context,newProxy.textMove,newProxy.textWarp);
        stepGoCastle--;
        doStep++;
      }
      if(Buffer.compare(data,packetCompare)==0){
        if(doStep==2){
          let sang=doStep-2;
          mySelection(context,myChoose[sang])
          stepGoCastle--;
          doStep++;
        }
        if(doStep==3){
          let sang=doStep-2;
          mySelection(context,myChoose[sang])
          stepGoCastle--;
          doStep++;
        }
        if((doStep==4)&&(stepGoCastle>0)){
          let sang=doStep-2;
          mySelection(context,myChoose[sang])
          stepGoCastle--;
          doStep++;
        }
        if((doStep==5)&&(stepGoCastle>0)){
          let sang=doStep-2;
          mySelection(context,myChoose[sang])
          stepGoCastle--;
          doStep++;
        }
        if((doStep==6)&&(stepGoCastle>0)){
          let sang=doStep-2;
          mySelection(context,myChoose[sang])
          stepGoCastle--;
          doStep++;
        }
      }

      
    }
    
  }

  //go Warp
  if(newProxy.warp=="warp"){
    selectAndSendPacket(context,newProxy.textMove,newProxy.textWarp)
    newProxy.warp="end";
  }

  //go Talk
  if(newProxy.warp=="talk"){
    selectAndSendPacket(context,newProxy.textMove,newProxy.textWarp)
    newProxy.warp="continuesTalk";
  }
  if(newProxy.warp=="continuesTalk"){
    //sendend dialog
    if(Buffer.compare(data,Buffer.from("59e9afadabaf","hex"))==0){
      sendPacket(context,packetEnd);
    }
    //sendend choose
    if(data.length==21){
        sendPacket(context,packetSelectOk);
        sendPacket(context,packetEnd);
     // select 2:59 e9 ae ad b9 a4 b2  
     // select tat/bat:59 e9 ae ad b9 a4 85
    }
    if(Buffer.compare(data,Buffer.from("59e9afadb9a5","hex"))==0){
      sendPacket(context,packetEnd);
      newProxy.warp="end"
    }
    if(Buffer.compare(data,Buffer.from("59e9bcadb9acadadadaeabaeafadadadadadadacad","hex"))==0){
      context.serviceSocket.write(Buffer.from("59e9aeadb9a4b3","hex"));
      newProxy.warp="end"
    }
    if(Buffer.compare(data,Buffer.from("59e9a8ada6acaeafad","hex"))==0){
      //context.serviceSocket.write(Buffer.from("59e9afadb9ab","hex"));
      context.serviceSocket.write(Buffer.from("59e9aeadafafcc","hex"));
      newProxy.warp="end"
    }
    if(data.length>22){
      sendPacket(context,packetEnd);
    }
   
  }
  
  if(data.length<35){
   // console.log("dow")
   //console.log(data)
  }
  
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
})
ipcMain.on("addListWarp",function (event, arg) {
  let selectionPacket=arg[0].slice(0,4)
  switch(selectionPacket){
    case "Talk": {
      newProxy.warp="talk";
      newProxy.textMove=arg[1][0];
      newProxy.textWarp=arg[1][1];
    } break;
    case "BGH-": {
      newProxy.warp="goCastle";
      newProxy.textMove=arg[1][0];
      newProxy.textWarp=arg[1][1];
      myChoose=arg[0].slice(arg[0].indexOf("-")+1,arg[0].lastIndexOf("-"))
      stepGoCastle=myChoose.length+1;
      doStep=1;
      event.reply('sendListWarp',arg[0].slice(arg[0].lastIndexOf("-")+1))
    } break;
    default:{
      newProxy.warp="warp";
      newProxy.textMove=arg[1][0];
      newProxy.textWarp=arg[1][1];
      event.reply('sendListWarp', arg[0])
    }break;
  }
  
});



