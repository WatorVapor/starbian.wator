const dgram = require('dgram');
const dns = require('dns');
class TransferUDP {
  constructor(host,port,bind) {
    //console.log('TransferUDP::constructor::host:=<',host,'>');
    //console.log('TransferUDP::constructor::port:=<',port,'>');
    //console.log('TransferUDP::constructor::bind:=<',bind,'>');
    this.host_ = host;
    this.port_ = port;
    this.autoBind_ = bind;
    const self = this;
    dns.lookup(host,(err,address,family)=>{
      //console.log('TransferUDP::constructor::err:=<',err,'>');
      //console.log('TransferUDP::constructor::address:=<',address,'>');
      //console.log('TransferUDP::constructor::family:=<',family,'>');
      //console.log('TransferUDP::constructor::self.host_:=<',self.host_,'>');
      if(err) {
        throw err;
      }
      if(family === 4) {
        self.v4_ = true;
      }
      if(family === 6) {
        self.v6_ = true;
      }
      self.createNetwork_();
      
    })
  }
  
  send(message) {
    try {
      const self = this;
      console.log('TransferUDP::constructor::this.port_:=<',this.port_,'>');
      console.log('TransferUDP::constructor::this.host_:=<',this.host_,'>');
      this.socket_.send(message, 0, message.length, this.port_, this.host_, (err, bytes) =>{
        self.onSentMsg_(err, bytes);
      });    
    } catch(e) {
      console.log('TransferUDP::send::e:=<',e,'>');
    }
  }

  sendTo(message,host,port) {
    try {
      const self = this;
      this.socket_.send(message, 0, message.length, port, host, (err, bytes) =>{
        self.onSentMsg_(err, bytes);
      });    
    } catch(e) {
      console.log('TransferUDP::send::e:=<',e,'>');
    }
  }
  
  
  createNetwork_() {
    if(this.v6_) {
      this.socket_ = dgram.createSocket('udp6');
    } else {
      this.socket_ = dgram.createSocket('udp4');
    }
    const self = this;
    this.socket_.on('listening', () =>{
      self.onListening_();
    });
    this.socket_.on('message', (msg, rinfo) =>{
      self.onMsg_(msg, rinfo);
    });
    this.socket_.on('err', (err) =>{
      self.onError_(msg, rinfo);
    });
    this.socket_.on('close', (err) =>{
      self.onClose_(msg, rinfo);
    });
    if(this.autoBind_) {
      this.bind_();
    }
    if(typeof this.onSocketReady === 'function') {
      this.onSocketReady();
    }    
  }

  bind_() {
    try {
      if(this.host_) {
        this.socket_.bind({address:this.host_,port:this.port_});
      } else {
        this.socket_.bind(this.port_);
      }
    } catch(e) {
      console.log('TransferUDP::bind::e:=<',e,'>');
    }
    
  }
  
  onListening_(){
    //console.log('TransferUDP::onListening_::this.socket_.address():=<',this.socket_.address(),'>');
    if(typeof this.onBindReady === 'function') {
      this.onBindReady();
    }
  }

  onMsg_(msg, rinfo){
    //console.log('TransferUDP::onMsg_::msg:=<',msg.toString('utf-8'),'>');
    //console.log('TransferUDP::onMsg_::rinfo:=<',rinfo,'>');
    if(typeof this.onMsg === 'function') {
      this.onMsg(msg.toString('utf-8'),rinfo);
    }
  };
  onError_(err){
    console.log('TransferUDP::onError_::err:=<',err,'>');
  };
  onClose_(evt){
    console.log('TransferUDP::onClose_::evt:=<',evt,'>');
  };

  onSentMsg_(err, bytes){
    //console.log('TransferUDP::onSentMsg_::err:=<',err,'>');
    //console.log('TransferUDP::onSentMsg_::bytes:=<',bytes,'>');
  }

};

module.exports = TransferUDP;