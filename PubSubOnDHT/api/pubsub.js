const EventEmitter = require("events").EventEmitter;
const TransferUDP = require('../src/transferUDP.js');
const DHTPeer = require('../src/peer.js');
const isIp = require('is-ip');

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
      }
      this.doors_.push(door);
    }
  }
};
module.exports = PubSub;
