const execSync = require("child_process").execSync;
const kCheckInterval = 1000 * 60 *5;
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
    let counterChromium = parseInt(chromium.toString('utf-8'));
    console.log('onCheckChromium:counterChromium=<',counterChromium,'>');
    if(counterChromium < 3) {
      badCounter++;
    }
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
  if(badCounter > 6) {
    execSync('sync;reboot');
  }
}

setTimeout(onCheckPing,1000);
setTimeout(onCheckChromium,1000);
setTimeout(onCheckWS,1000);
setTimeout(onErrorCheck,1000);

setInterval(onCheckPing,kCheckInterval);
setInterval(onCheckChromium,kCheckInterval);
setInterval(onCheckWS,kCheckInterval);
setInterval(onErrorCheck,kCheckInterval);

