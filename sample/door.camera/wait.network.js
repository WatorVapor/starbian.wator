const execSync = require("child_process").execSync;
while(true) {
  try {
    let log = execSync('ping -c 1 www.wator.xyz');
    //console.log('log=<',log,'>');
    break;
  } catch(e) {
    //console.error('e=<',e,'>');
  }
}
console.log('ok network is good');

while(true) {
  try {
    let log = execSync('netstat -l | grep "localhost:18080"');
    console.log('log.length=<',log.length,'>');
    console.log('log=<',log.toString('utf8'),'>');
    break;
  } catch(e) {
    //console.error('e=<',e,'>');
  }
}
console.log('ok websocket is good');
