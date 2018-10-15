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
const option = { 
  host:'127.0.0.1',
  port: 18080
};
console.log('client=<',client,'>');
while(true) {
  try {
    client.connect(option, () => {
      console.log('ok websocket is good');
      process.exit(0);
    });
    client.on('error', function(err) {
      console.error('e=<',e,'>');
    });
  } catch(e) {
    console.error('e=<',e,'>');
  }
}
console.log('client=<',client,'>');
