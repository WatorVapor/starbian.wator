const TransferUDP = require('../src/transferUDP.js');
const DHTPeer = require('../src/peer.js');
const net = require('net');
class BrokerCluster {
  constructor(config) {
    this.config_ = config;
    this.enterCluster_();
    this.peer_ = new DHTPeer(this.config_.masterKey,this.config_.repos);
    this.clusterPeers_ = {};
  }
  enterCluster_() {
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
    console.log('BrokerCluster::onListenClusterReady_::family:=<',family,'>');
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
    console.log('BrokerCluster::enterWorld_::this.config_:=<',this.config_,'>');
    for(const gate of this.config_.bootstrap) {
      console.log('BrokerCluster::enterWorld_::gate:=<',gate,'>');
      const enterObj = {enter:{role:'broker'}};
      const enterObjSign = this.peer_.sign(enterObj);
      const message = Buffer.from(JSON.stringify(enterObjSign));
      if(this.sock6_ && net.isIPv6(gate.host)) {
        this.sock6_.sendTo(message,gate.host,gate.port);
      }
      if(this.sock4_ && net.isIPv4(gate.host)) {
        this.sock4_.sendTo(message,gate.host,gate.port);
      }
    }
  }
  onMsgCluster_(msg,rinfo) {
    //console.log('BrokerCluster::onMsgCluster_::msg:=<',msg,'>');
    //console.log('BrokerCluster::onMsgCluster_::rinfo:=<',rinfo,'>');
    try {
      const msgJson = JSON.parse(msg);
      const isGood = this.peer_.verify(msgJson);
      //console.log('BrokerCluster::onMsgCluster_::isGood:=<',isGood,'>');
      if(isGood) {
        this.onGoodMsgCluster_(msgJson,rinfo);
      }
    } catch(e) {
      console.log('BrokerCluster::onMsgCluster_::e:=<',e,'>');
    }
  }
  onGoodMsgCluster_(msgJson,rinfo) {
    const rPeer = this.peer_.calcID(msgJson);
    //console.log('BrokerCluster::onGoodMsgCluster_::rPeer:=<',rPeer,'>');
    //console.log('BrokerCluster::onGoodMsgCluster_::msgJson:=<',msgJson,'>');
    if(msgJson.enter) {
      this.onEnterClusterMsg_(msgJson.enter,rinfo,rPeer);
    } else {
      console.log('BrokerCluster::onGoodMsgCluster_::msgJson:=<',msgJson,'>');
    }
  }
  onEnterClusterMsg_(enter,rinfo,rPeer) {
    //console.log('BrokerCluster::onEnterClusterMsg_::enter:=<',enter,'>');
    //console.log('BrokerCluster::onEnterClusterMsg_::rPeer:=<',rPeer,'>');
    //console.log('BrokerCluster::onEnterClusterMsg_::rinfo:=<',rinfo,'>');
    const rinfoSlim = Object.assign({}, rinfo);
    delete rinfoSlim.size;
    if(enter.role === 'broker') {
      if(net.isIPv6(rinfo.address)) {
        this.clusterPeers_['v6_' + rPeer] = rinfoSlim;
      }
      if(net.isIPv4(rinfo.address)) {
        this.clusterPeers_['v4_' + rPeer] = rinfoSlim;
      }
      console.log('BrokerCluster::onEnterClusterMsg_::this.clusterPeers_:=<',this.clusterPeers_,'>');
    }
  }

};
module.exports = BrokerCluster;

