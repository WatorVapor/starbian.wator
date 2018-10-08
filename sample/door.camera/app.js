const WebSocket = require('ws');

const wss = new WebSocket.Server({ host:'127.0.0.1',port: 18080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('message=<' , message , '>');
    let msgJson = JSON.parse(message);
    console.log('msgJson=<' , msgJson , '>');
  });
  //ws.send('something');
});
