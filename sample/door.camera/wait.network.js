const execSync = require("child_process").execSync;
while(true) {
  try {
    let log = execSync('ping -c 1 www.wator.xyz');
    console.log('log=<',log,'>');
    break;
  } catch(e) {
    //console.error('e=<',e,'>');
  }
}
console.log('ok network is good');
