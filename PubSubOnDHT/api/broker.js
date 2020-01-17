const TransferUDP = require('../src/transferUDP.js');
const DHTPeer = require('../src/peer.js');
class Broker {
  constructor(config) {
    this.config_ = config;
    this.createGateway_();
    this.peer_ = new DHTPeer(this.config_.masterKey,this.config_.repos);
  }
  createGateway_() {
    const self = this;
    if(this.config_.cluster.ipv4) {
      let host = this.config_.cluster.ipv4.address;
      if(!host) {
        host = '0.0.0.0';
      }
      const port = this.config_.cluster.ipv4.port;
      this.server4_ = new TransferUDP(host,port,true);
      this.server4_.onBindReady = ()=> {
        self.onListenClusterReady_(4);
      }
      this.server4_.onMsg = (msg,rinfo)=> {
        self.onMsgCluster_(msg,rinfo);
      }
    }
    if(this.config_.cluster.ipv6) {
      let host = this.config_.cluster.ipv6.address;
      if(!host) {
        host = '::';
      }
      const port = this.config_.cluster.ipv6.port;
      this.server6_ = new TransferUDP(host,port,true);
      this.server6_.onBindReady = ()=> {
        self.onListenClusterReady_(6);
      }
      this.server6_.onMsg = (msg,rinfo)=> {
        self.onMsgCluster_(msg,rinfo);
      }
    }    
  }
  
  onListenClusterReady_(family) {
    console.log('Broker::onListenClusterReady_::family:=',family,'>');
    if(family === 4) {
      this.v4Ready_ = true;
      if(!this.server6_) {
        this.v6Ready_ = true;
      }
    }
    if(family === 6) {
      this.v6Ready_ = true;
      if(!this.server4_) {
        this.v4Ready_ = true;
      }
    }
    if(this.v6Ready_ === true && this.v4Ready_ === true) {
      this.enterWorld_();
    }
  }

  
  enterWorld_() {
    console.log('Broker::enterWorld_::this.config_:=',this.config_,'>');
    this.doors_ = [];
    const self = this;
    for(const gate of this.config_.bootstrap) {
      console.log('Broker::enterWorld_::gate:=',gate,'>');
      const door = new TransferUDP(gate.host,gate.port);
      door.onSocketReady = ()=> {
        const enterObj = {enter:{role:'broker'}};
        const message = Buffer.from(JSON.stringify(enterObj));
        door.send(message);
      }
      door.onMsg = (msg,rinfo)=> {
        self.onMsgDoor_(msg,rinfo,door);
      }
      this.doors_.push(door);      
    }
  }
  onMsgDoor_(msg,rinfo,door) {
    console.log('Broker::onMsgDoor_::msg:=',msg,'>');    
    console.log('Broker::onMsgDoor_::rinfo:=',rinfo,'>');    
    console.log('Broker::onMsgDoor_::door:=',door,'>');    
  }
  onMsgCluster_(msg,rinfo) {
    console.log('Broker::onMsgCluster_::msg:=',msg,'>');
    console.log('Broker::onMsgCluster_::rinfo:=',rinfo,'>');
  }

};
module.exports = Broker;

