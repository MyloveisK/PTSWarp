const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
var proxy = require("node-tcp-proxy");
var util = require("util");
var myData="";
var myClear=0;
var fs = require('fs');
var newProxy = proxy.createProxy(6414, "103.48.192.145", 6414,{
  upstream: function(context, data) {
    if(data.length==13||data.length==8){
        myClear++
        myData+=data.toString("hex")+"\n";
        fs.writeFile('logWarp.txt', myData, function (err) {});
    }
    if(myClear>20){
        myData="";
        fs.writeFile('logWarp.txt', myData, function (err) {});
        myClear=0;
    }
    return data;
},
downstream: function(context, data) {
   // log(context.serviceSocket, data);
   //console.log(data)
    return data;
}
});

