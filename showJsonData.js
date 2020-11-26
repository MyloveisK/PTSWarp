const fs = require('fs');
let myData = JSON.parse(fs.readFileSync('dataWarp.json'));

let h=Object.keys(myData["Dự Châu"])[0];
console.log(myData["Dự Châu"][h][0]);