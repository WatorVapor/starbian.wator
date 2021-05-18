const mqtt = require('mqtt')
const crypto = require('crypto');

const options = {
  connectTimeout: 4000,
  // Authentication
  clientId: `wator_node_@${crypto.randomBytes(16).toString('base64')}`,
  keepalive: 60,
  clean: true,
  rejectUnauthorized: false
}

const client  = mqtt.connect('wss://emqx0.wator.xyz/mqtt');
//const client  = mqtt.connect('ws://emqx0.wator.xyz:8083/mqtt');

client.on('connect', function () {
  client.subscribe('presence', function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt')
    } else {
      console.log('subscribe::err:=<',err,'>');
    }
  })
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
