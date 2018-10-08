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
};

onSettingMyKey = (key) => {
  console.log('onSettingMyKey::key=<' , key , '>');    
  let channels = {};
  try {
    channels = require('./channels.json');
  } catch(e) {
    console.log('e=<' , e , '>');    
  }
  console.log('channels=<' , channels , '>');
};
