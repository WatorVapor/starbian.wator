const WebSocket = require('ws');

const wss = new WebSocket.Server({ host:'127.0.0.1',port: 18080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('message=<' , message , '>');
    let msgJson = JSON.parse(message);
    console.log('msgJson=<' , msgJson , '>');
    if(msgJson && msgJson.cmd === 'readall') {
      let setting = onReadAllSetting();
      ws.send(JSON.stringify(setting));
    }
    if(msgJson && msgJson.cmd === 'set',msgJson.myKey) {
      onSettingMyKey(msgJson.myKey);
    }
    if(msgJson && msgJson.cmd === 'tts' && msgJson.text) {
      onSay(msgJson.text,msgJson.volume);
    }
  });
  //ws.send('something');
});

onReadAllSetting = () => {
  let channels = {};
  try {
    channels = require('./channels.json');
  } catch(e) {
    console.log('e=<' , e , '>');    
  }
  console.log('channels=<' , channels , '>');
  let setting = [];
  if(channels.authed) {
    setting.push({key:'wator-starbian-ecdsa-remote-keys',value:channels.authed})
  }
  let media = {};
  try {
    media = require('./media.json');
  } catch(e) {
    console.log('e=<' , e , '>');    
  }
  console.log('media=<' , media , '>');
  setting.push({key:'wator-starbian-rtc-media-setting',value:media})
  return setting;
};

const fs = require('fs');

onSettingMyKey = (key) => {
  console.log('onSettingMyKey::key=<' , key , '>');    
  let keys = {};
  try {
    channels = require('./keys.json');
  } catch(e) {
    console.log('e=<' , e , '>');    
  }
  console.log('keys=<' , keys , '>');
  keys.myself = key;
  fs.writeFileSync('./keys.json', JSON.stringify(keys,undefined,2), 'utf8');
};

const process = require('child_process');

onSay = (text,volume) => {
  console.log('onSay text=<' , text , '>');
  console.log('onSay volume=<' , volume , '>');
  let play = 'ffplay ./'
}

