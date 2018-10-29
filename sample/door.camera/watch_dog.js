const execSync = require("child_process").execSync;
const kCheckInterval = 1000 * 60 *2;
let badCounterPing = 0;
let badCounterChromium = 0;
let badCounterWS = 0;

onCheckPing = () => {
  try {
    let ping = execSync('ping -c 1 www.wator.xyz');
    console.log('onCheckPing:ping=<',ping.toString('utf-8'),'>');
    badCounterPing = 0;
  } catch(e) {
    console.error('e=<',e,'>');
    badCounterPing++;
  }
}

onCheckChromium = () => {
  try {
    let chromium = execSync('ps ax | grep chromium-browser | wc -l');
    console.log('onCheckChromium:chromium=<',chromium.toString('utf-8'),'>');
    let counterChromium = parseInt(chromium.toString('utf-8'));
    console.log('onCheckChromium:counterChromium=<',counterChromium,'>');
    if(counterChromium < 3) {
      badCounterChromium++;
    } else {
      badCounterChromium = 0;
    }
  } catch(e) {
    console.error('e=<',e,'>');
    badCounterChromium++;
  }
}


const net = require('net');

onCheckWS = () => {
  const client = net.createConnection({ host:'127.0.0.1',port: 18080 });
  client.on('connect', function(){
    console.log('websocket is good');
    badCounterWS = 0;
  });
  client.on('error', function(error){
    console.log('onCheckWS:error=<',error,'>');
    badCounterWS++;
  });
}

let badCounterCapture = 0;
onCheckCapture = () => {
  badCounterCapture++;
}

onErrorCheck = () => {
  console.log('onErrorCheck:badCounterPing=<',badCounterPing,'>');
  console.log('onErrorCheck:badCounterChromium=<',badCounterChromium,'>');
  console.log('onErrorCheck:badCounterWS=<',badCounterWS,'>');
  console.log('onErrorCheck:badCounterCapture=<',badCounterCapture,'>');
  if(badCounterPing > 3 || badCounterChromium > 3 || badCounterWS > 3 || badCounterCapture > 5) {
    execSync('sync;reboot');
  }
}



setTimeout(onCheckPing,1000);
setTimeout(onCheckChromium,1000);
setTimeout(onCheckWS,1000);
setTimeout(onCheckCapture,1000);
setTimeout(onErrorCheck,1000);

setInterval(onCheckPing,kCheckInterval);
setInterval(onCheckChromium,kCheckInterval);
setInterval(onCheckWS,kCheckInterval);
setInterval(onCheckCapture,kCheckInterval);
setInterval(onErrorCheck,kCheckInterval);

const redis = require("redis");
const sub = redis.createClient();
const subChannel = 'door.camera.image';
sub.subscribe(subChannel);
sub.on("message", (channel, message) =>{
  badCounterCapture = 0;
});


