const fs = require('fs');

const data = fs.readFileSync('correctWarp.txt', {encoding:'utf8', flag:'r'}); 
let lim=data.length;
let fix=[]
let text=""
var line=1;
for(let i=0;i<lim;i=i+46){
    fix.push([data.slice(i,i+26),data.slice(i+28,i+44)]);
}
for(let j=0;j<fix.length;j++){
    text+=line + "."+fix[j][0]+ "SANG"+fix[j][1]+"."+"\r"
    line=line+1
}
fs.writeFile('dataOK.txt', text, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  var my="Talk3:dsdsds"
  console.log(my[4])