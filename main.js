const { app, BrowserWindow, ipcMain } = require('electron')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const proxy = require("node-tcp-proxy");
const util = require("util");
const fs = require('fs');
var dataWarp="";
var myClear=0;
var countSendEnd=0;
function textext(myData){
  
  if(myData.length==13||myData.length==8){
    myClear++
    dataWarp+=myData.toString("hex")+"\n";
    fs.writeFile('logWarp.txt', dataWarp, function (err) {});
   }

if(myClear>50){
  dataWarp="";
    fs.writeFile('logWarp.txt', dataWarp, function (err) {});
    myClear=0;
}
}

var newProxy = proxy.createProxy(6414, "103.48.192.145", 6414,{
  upstream: function(context, data) {
    textext(data);
   // console.log("up")
   // console.log(data)
    return data;
},

downstream: function(context, data) {
  
  if(newProxy.warp=="start"){
    context.serviceSocket.write(Buffer.from(newProxy.textMove,"hex"));
    context.serviceSocket.write(Buffer.from(newProxy.textWarp,"hex"));
    newProxy.warp="end";
  }
  if((newProxy.warp=="talk")&&(countSendEnd!=0)){
    context.serviceSocket.write(Buffer.from(newProxy.textMove,"hex"));
    context.serviceSocket.write(Buffer.from(newProxy.textWarp,"hex"));
    for(let k=0;k<countSendEnd;k++){
      context.serviceSocket.write(Buffer.from("59e9afadb9ab","hex"));
    }
    newProxy.warp="end";
  }
    return data;
}
});
//
function createWindow () {
  const win = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })
  
  win.loadFile('index.html');
}
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
  
})
ipcMain.on("addListWarp",function (event, arg) {
  //console.log(arg)
  if(arg[0].slice(0,4)=="Talk"){
    countSendEnd=parseInt(arg[0][4]);
    newProxy.warp="talk";
    newProxy.textMove=arg[1][0];
    newProxy.textWarp=arg[1][1];
  }else{
    newProxy.warp="start";
    newProxy.textMove=arg[1][0];
    newProxy.textWarp=arg[1][1];
  }
  event.reply('sendListWarp', arg[0])
});


