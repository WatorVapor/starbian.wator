const EventEmitter = require("events").EventEmitter;
const TransferUDP = require('../src/transferUDP.js');
const DHTPeer = require('../src/peer.js');
const net = require('net');

class PubSub extends EventEmitter {
  constructor(config) {
    super();
    this.config_ = config;
    this.enterWorld_();
    this.peer_ = new DHTPeer(this.config_.masterKey,this.config_.repos);
  }
  publish(topic,msg) {
    
  }
  subscribe(topic) {
    
  }
  
  enterWorld_() {
    console.log('PubSub::enterWorld_::this.config_:=<',this.config_,'>');
    this.doors_ = [];
    const self = this;
    for(const gate of this.config_.bootstrap) {
      console.log('PubSub::enterWorld_::gate:=<',gate,'>');
      const door = new TransferUDP(gate.host,gate.port);
      door.onSocketReady = () => {
        const enterObj = {enter:{role:'pubsub'}};
        const enterObjSign = self.peer_.sign(enterObj);
        const message = Buffer.from(JSON.stringify(enterObjSign));
        door.send(message);
        door.onMsg = (msg,rinfo)=> {
          self.onMsgPubSub_(msg,rinfo);
        }
      }
      this.doors_.push(door);
    }
  }

  onMsgPubSub_(msg,rinfo) {
    //console.log('PubSub::onMsgPubSub_::msg:=<',msg,'>');
    //console.log('PubSub::onMsgPubSub_::rinfo:=<',rinfo,'>');
    try {
      const msgJson = JSON.parse(msg);
      const isGood = this.peer_.verify(msgJson);
      //console.log('PubSub::onMsgPubSub_::isGood:=<',isGood,'>');
      if(isGood) {
        this.onGoodMsgPubSub_(msgJson,rinfo);
      }
    } catch(e) {
      console.log('PubSub::onMsgPubSub_::e:=<',e,'>');
    }
  }
  onGoodMsgPubSub_(msgJson,rinfo) {
    const rPeer = this.peer_.calcID(msgJson);
    //console.log('PubSub::onGoodMsgPubSub_::rPeer:=<',rPeer,'>');
    //console.log('PubSub::onGoodMsgPubSub_::msgJson:=<',msgJson,'>');
    if(msgJson.welcome) {
      this.onWelcomePubSubMsg_(msgJson.welcome,rinfo,rPeer);
    } else {
      console.log('PubSub::onGoodMsgPubSub_::msgJson:=<',msgJson,'>');
    }
  }
  onWelcomePubSubMsg_(welcome,rinfo,rPeer) {
    console.log('PubSub::onWelcomePubSubMsg_::welcome:=<',welcome,'>');
    console.log('PubSub::onWelcomePubSubMsg_::rPeer:=<',rPeer,'>');
    console.log('PubSub::onWelcomePubSubMsg_::rinfo:=<',rinfo,'>');
    if(welcome.role === 'pubsub') {
    }
  }

};
module.exports = PubSub;
