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

const net = require('net');
const client = new net.Socket();
while(true) {
  try {
    client.connect(18080, '127.0.0.1', () => {
      console.log('ok websocket is good');
      process.exit(0);
    });
    client.on('error', (e) => {
      console.error('e=<',e,'>');
    });
  } catch(e) {
    console.error('e=<',e,'>');
  }
}
