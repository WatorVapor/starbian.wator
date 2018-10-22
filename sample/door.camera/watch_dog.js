const execSync = require("child_process").execSync;
const kCheckInterval = 100 * 60;
let badCounter = 0;

onCheckPing = () => {
  try {
    let log = execSync('ping -c 1 www.wator.xyz');
    console.log('onCheckPing:log=<',log.toString('utf-8'),'>');
  } catch(e) {
    console.error('e=<',e,'>');
    badCounter++;
  }
}

const net = require('net');

onCheckWS = () => {
  const client = net.createConnection({ host:'127.0.0.1',port: 18080 });
  client.on('connect', function(){
    console.log('websocket is good');
  });
  client.on('error', function(error){
    console.log('onCheckWS:error=<',error,'>');
    badCounter++;
  });
}

setInterval(onCheckPing,kCheckInterval);

setInterval(onCheckWS,kCheckInterval);

onErrorCheck = () => {
  console.log('onErrorCheck:badCounter=<',badCounter,'>');
  if(badCounter > 2) {
    execSync('sync;reboot');
  }
}
