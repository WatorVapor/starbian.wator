const execSync = require("child_process").execSync;

onCheckPing = () => {
  try {
    let log = execSync('ping -c 1 www.wator.xyz');
  } catch(e) {
    console.error('e=<',e,'>');
  }
}

const net = require('net');

onTryWebSocket = () => {
  const client = net.createConnection({ host:'127.0.0.1',port: 18080 });
  client.on('connect', function(){
    console.log('websocket is good');
  });
  client.on('error', function(error){
    console.log('client:error=<',error,'>');
  });
}

setInterval(onCheckPing,1000*60);

setInterval(onTryWebSocket,1000*60);
