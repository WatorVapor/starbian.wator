const mqtt = require('mqtt')
const crypto = require('crypto');

const config = require('./cloudServer.json');
console.log('::config:=<',config,'>');

const options = {
  connectTimeout: 4000,
  // Authentication
  clientId: `wator_node_@${crypto.randomBytes(16).toString('base64')}`,
  username: config.mqtt.username,
  password: config.mqtt.password,
  keepalive: 60,
  clean: true,
  rejectUnauthorized: false
}

const client  = mqtt.connect(config.mqtt.WSS_URL,options);

client.on('connect',  () =>{
  setTimeout(()=>{
    client.publish('test/1111', "1111");
    client.publish('test/222', "222");
    client.publish('test/1ddsdas', "1ddsdas");
    client.publish('test/11121212111', "11121212111");
    client.publish('test/112211', "112211");    
  },10);
})


client.on('close',  (evt) => {
  console.log('close::evt:=<',evt,'>');
});

client.on('disconnect',  (evt) => {
  console.log('disconnect::evt:=<',evt,'>');
});

client.on('offline',  (evt) => {
  console.log('offline::evt:=<',evt,'>');
});

client.on('error',  (evt) => {
  console.log('error::evt:=<',evt,'>');
});

client.on('end',  (evt) => {
  console.log('end::evt:=<',evt,'>');
});

client.on('packetsend',  (evt) => {
  //console.log('packetsend::evt:=<',evt,'>');
});

client.on('packetreceive',  (evt) => {
  //console.log('packetreceive::evt:=<',evt,'>');
});

client.on('message', function (topic, message) {
  // message is Buffer
  console.log('message::topic:=<',topic,'>');
  console.log('message::message:=<',message.toString(),'>');
})
