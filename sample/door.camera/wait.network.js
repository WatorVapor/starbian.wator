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

onTryWebSocket = () => {
  const client = net.createConnection({ host:'127.0.0.1',port: 18080 });
  client.on('connect', function(){
    console.log('websocket is good');
    process.exit(0);
  });
  client.on('error', function(error){
    console.log('client:error=<',error,'>');
    setTimeout(onTryWebSocket,5000)
  });
}
onTryWebSocket();
