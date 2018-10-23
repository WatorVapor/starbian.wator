const execSync = require("child_process").execSync;
const kCheckInterval = 100 * 60;
let badCounter = 0;

onCheckPing = () => {
  try {
    let ping = execSync('ping -c 1 www.wator.xyz');
    console.log('onCheckPing:ping=<',ping.toString('utf-8'),'>');
  } catch(e) {
    console.error('e=<',e,'>');
    badCounter++;
  }
}

onCheckChromium = () => {
  try {
    let chromium = execSync('ps ax | grep chromium-browser | wc -l');
    console.log('onCheckChromium:chromium=<',chromium.toString('utf-8'),'>');
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

onErrorCheck = () => {
  console.log('onErrorCheck:badCounter=<',badCounter,'>');
  if(badCounter > 3 {
    execSync('sync;reboot');
  }
}



setInterval(onCheckPing,kCheckInterval);
setInterval(onCheckChromium,kCheckInterval);
setInterval(onCheckWS,kCheckInterval);
setInterval(onErrorCheck,kCheckInterval);

