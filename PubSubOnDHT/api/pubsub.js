const EventEmitter = require("events").EventEmitter;
const TransferUDP = require('../src/transferUDP.js');

class PubSub extends EventEmitter {
  constructor(config) {
    super();
    this.config_ = config;
    this.enterWorld_();
  }
  publish(topic,msg) {
    
  }
  subscribe(topic) {
    
  }
  
  enterWorld_() {
    console.log('PubSub::enterWorld_::this.config_:=',this.config_,'>');
    this.doors_ = [];
    for(const gate of this.config_.bootstrap) {
      console.log('PubSub::enterWorld_::gate:=',gate,'>');
      const door = new TransferUDP(gate.host,gate.port);
      const enterObj = {enter:{role:'client'}};
      const message = Buffer.from(JSON.stringify(enterObj));
      door.send(message);
      this.doors_.push(door);
    }
  }
};
module.exports = PubSub;
