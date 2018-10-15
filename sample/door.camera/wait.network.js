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

/*
while(true) {
  try {
    let log = execSync('netstat -l | grep "localhost:18080" && echo hello');
    console.log('log.length=<',log.length,'>');
    console.log('log=<',log.toString('utf8'),'>');
    break;
  } catch(e) {
    //console.error('e=<',e,'>');
  }
}
console.log('ok websocket is good');
*/
const net = require('net');

onTryWebSocket = () => {
  const client = net.createConnection({ host:'127.0.0.1',port: 18081 });
  client.on('connect', function(){
    console.log('client:connected');
    process.exit(0);
  });
  client.on('error', function(error){
    console.log('client:error=<',error,'>');
    setTimeout(onTryWebSocket,5000)
  });
}
onTryWebSocket();
