const { app, BrowserWindow, ipcMain } = require('electron')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const proxy = require("node-tcp-proxy");
const util = require("util");

const fs = require('fs');
var myData = JSON.parse(fs.readFileSync('dataWarp.json'));
var newProxy = proxy.createProxy(6414, "103.48.192.145", 6414,{
  upstream: function(context, data) {
    //console.log(data)
    return data;
},

downstream: function(context, data) {
  if(newProxy.warp=="start"){
    context.serviceSocket.write(Buffer.from(newProxy.textMove,"hex"));
    context.serviceSocket.write(Buffer.from(newProxy.textWarp,"hex"));
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
ipcMain.on("start-warp",function (event, arg) {
  newProxy.warp="start";
  newProxy.textMove=data[0];
  newProxy.textWarp=data[1];
  event.reply('finish-warp', arg)
});
ipcMain.on("addListWarp",function (event, arg) {
  newProxy.warp="start";
  newProxy.textMove=arg[0];
  newProxy.textWarp=arg[1];
  
  event.reply('sendListWarp', arg)
});


