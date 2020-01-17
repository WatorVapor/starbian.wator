const TransferUDP = require('../src/transferUDP.js');
const DHTPeer = require('../src/peer.js');
const isIp = require('is-ip');
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
      this.sock4_ = new TransferUDP(host,port,true);
      this.sock4_.onBindReady = ()=> {
        self.onListenClusterReady_(4);
      }
      this.sock4_.onMsg = (msg,rinfo)=> {
        self.onMsgCluster_(msg,rinfo);
      }
    }
    if(this.config_.cluster.ipv6) {
      let host = this.config_.cluster.ipv6.address;
      if(!host) {
        host = '::';
      }
      const port = this.config_.cluster.ipv6.port;
      this.sock6_ = new TransferUDP(host,port,true);
      this.sock6_.onBindReady = ()=> {
        self.onListenClusterReady_(6);
      }
      this.sock6_.onMsg = (msg,rinfo)=> {
        self.onMsgCluster_(msg,rinfo);
      }
    }    
  }
  
  onListenClusterReady_(family) {
    console.log('Broker::onListenClusterReady_::family:=',family,'>');
    if(family === 4) {
      this.v4Ready_ = true;
      if(!this.sock6_) {
        this.v6Ready_ = true;
      }
    }
    if(family === 6) {
      this.v6Ready_ = true;
      if(!this.sock4_) {
        this.v4Ready_ = true;
      }
    }
    if(this.v6Ready_ === true && this.v4Ready_ === true) {
      this.enterWorld_();
    }
  }

  
  enterWorld_() {
    console.log('Broker::enterWorld_::this.config_:=',this.config_,'>');
    for(const gate of this.config_.bootstrap) {
      console.log('Broker::enterWorld_::gate:=',gate,'>');
      const enterObj = {enter:{role:'broker'}};
      const message = Buffer.from(JSON.stringify(enterObj));
      if(this.sock6_ && isIp.v6(gate.host)) {
        this.sock6_.send(message,gate.host,gate.port);
      }
      if(this.sock4_ && isIp.v4(gate.host)) {
        this.sock4_.send(message,gate.host,gate.port);
      }
    }
  }
  onMsgCluster_(msg,rinfo) {
    console.log('Broker::onMsgCluster_::msg:=',msg,'>');
    console.log('Broker::onMsgCluster_::rinfo:=',rinfo,'>');
  }

};
module.exports = Broker;

