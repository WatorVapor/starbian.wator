const execSync = require("child_process").execSync; 

const redis = require("redis");
const sub = redis.createClient();
const subChannel = 'door.camera.face';
const pub = redis.createClient();
const pubChannel = 'door.camera.person.detected';
const aliveChannel = 'door.camera.alive';

sub.subscribe(subChannel);
sub.on("message", (channel, message) =>{
  //console.log('message channel=<' , channel , '>');
  //console.log('message message=<' , message , '>');
  try {
    let detected = parseInt(message);
    console.log('message detected=<' , detected , '>');
    if(detected > 0) {
      onFaceDetected();
    }
  } catch(e) {
    console.error('message e=<' , e , '>');
  }  
});


const PLAYLIST = [
  {text:'こんにちは、呼び出します。',sound:'audio/33.wav'},
  {text:'毎度お疲れ様です。呼び出します',sound:'audio/44.wav'},
  {text:'少々お待ちください。',sound:'audio/22.wav'},
  {text:'主人は、不在と思います。',sound:'audio/11.wav'},
]
onSay = (text,volume) => {
  try {
    console.log('onSay text=<' , text , '>');
    console.log('onSay volume=<' , volume , '>');
    for(let i = 0 ;i < PLAYLIST.length;i++) {
      let playPair = PLAYLIST[i];
      if(playPair.text === text) {
        let playSheel = 'play ' + playPair.sound;
        execSync(playSheel);
      }
    }
  } catch(e) {
    console.error('onSay e=<' , e , '>');
  }
};


const FaceDetectNotifyIntervalMS = 1000 * 3;
const FaceDetectNotifyCounter = 1;
let faceDectectedCounter = 0;
let prevFaceDetectTime = new Date();
let sayByebyeTimeout = false;
let ForbiddenTalking = false;
const FaceDetectSayByeIntervalMS = 1000 * 100;
const FaceDetectForbiddenIntervalMS= 1000 * 100;

onFaceDetected = () => {
  try {
    let now = new Date();
    let diff = now - prevFaceDetectTime;
    faceDectectedCounter++;
    if(diff < FaceDetectNotifyIntervalMS) {
      return;
    }
    prevFaceDetectTime = now;
    console.log('onFaceDectect faceDectectedCounter=<',faceDectectedCounter,'>');
    console.log('onFaceDectect ForbiddenTalking=<',ForbiddenTalking,'>');
    if(!ForbiddenTalking && faceDectectedCounter > FaceDetectNotifyCounter) {
      sayHello();
      pub.publish(pubChannel,'1');
    }
    faceDectectedCounter = 0;
    if(!sayByebyeTimeout) {
      sayByebyeTimeout = setTimeout(onSayByeBye,FaceDetectSayByeIntervalMS);
    }
  } catch (err) {
    console.error('onFaceDectect err=<',err,'>');
  }
};

onSayByeBye = () => {
  sayByeBye();
  ForbiddenTalking = true;
  setTimeout(() => {
    ForbiddenTalking = false;
  },FaceDetectForbiddenIntervalMS)
}

const STAIBIAN_CAMERA_HELLO_CAST_TEXT = [
  'こんにちは、呼び出します。',
  '毎度お疲れ様です。呼び出します',
  '少々お待ちください。'
];

sayHello = () => {
  sayTTS(STAIBIAN_CAMERA_HELLO_CAST_TEXT);
}
const STAIBIAN_CAMERA_BYE_CAST_TEXT = [
  '主人は、不在と思います',
];
sayByeBye = () => {
  sayTTS(STAIBIAN_CAMERA_BYE_CAST_TEXT);
}


sayTTS = (text_array) => {
  let maxRandom = text_array.length;
  let index = Math.floor(Math.random()*(maxRandom));
  let txt = text_array[index];
  onSay(txt,0.5);
}




