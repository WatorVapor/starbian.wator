const dgram = require('dgram');
const RS = require('jsrsasign');
const fs = require('fs');
const execSync = require('child_process').execSync;
const bs58 = require('bs58');
const crypto = require("crypto");


const udpCtrl = dgram.createSocket('udp6');
const sConstMiningDiffculty = 'H';


const iConstWorldNodeSizeMax = 1024 * 1024;
const iConstOutNodeSizeMax = 16;

let config = false;
module.exports = class HexNode {
  constructor (conf) {
    config = require('./Config.js');
    if(conf) {
      config = require(conf);
    }
    this._tryLoadKey();
    this._startUDP();
    this._worldNode = {};
    this._outNode = {};
  }



  _tryLoadKey() {
    if(!fs.existsSync(config.keyPath)) {
      this._createKey();
    }
    this._loadKey();
  }
  _createKey() {
    let ecKeypair = RS.KEYUTIL.generateKeypair('EC', 'P-256');
    console.log('_createKey ecKeypair=<',ecKeypair,'>');
    let masterKey = RS.KEYUTIL.getJWKFromKey(ecKeypair.prvKeyObj);
    console.log('_createKey masterKey=<',masterKey,'>');
    execSync('mkdir -p ./.key/');
    fs.writeFileSync(config.keyPath,JSON.stringify(masterKey,undefined,2));
  }
  _loadKey() {
    let keyJwk = require('./' + config.keyPath);
    //console.log('_loadKey keyJwk=<',keyJwk,'>');
    this.prvKey = RS.KEYUTIL.getKey(keyJwk);
    //console.log('_loadKey this.prvKey=<',this.prvKey,'>');
    const bytes = Buffer.from(this.prvKey.pubKeyHex, 'hex');
    this.pubKey = bs58.encode(bytes);
    console.log('_loadKey this.pubKey=<',this.pubKey,'>');
  }
  
  _startUDP() {
    //console.log('HexNode config=<',config,'>');
    udpCtrl.bind(config.swarm.ctrl.port, config.swarm.ctrl.host);
    let self = this;
    
    udpCtrl.on('listening', () => {
      const address = udpCtrl.address();
      console.log('listening on address=<',address,'>');
      setTimeout( ()=> {
        self._runUdpCtrlReady();
      },1);  
    });
    
    udpCtrl.on('message', (message, remote) => {
      //console.log('udpCtrl message on remote=<',remote,'>');
      //console.log('udpCtrl message on message=<',message,'>');
      const utf8Msg = message.toString('utf-8');
      //console.log('udpCtrl message on utf8Msg=<',utf8Msg,'>');
      try {
        const jsonMsg = JSON.parse(utf8Msg);
        this._onCtrlMsg(jsonMsg,remote);
      } catch (e) {
        console.error('udpCtrl message on remote=<',remote,'>');
        console.error('udpCtrl message on message=<',message,'>');
      }
    });    
  }
  _runUdpCtrlReady() {
    let ep = {
      address:config.swarm.ctrl.host,
      port:config.swarm.ctrl.port
    }
    this._worldNode[this.pubKey] = ep;
    this._entryWorld();
  }
  _entryWorld(){
    const entryMsg = { entry:true };
    let seedEP = { 
      address:config.seed.ctrl.host,
      port:config.seed.ctrl.port
    };
    this._sendCtrlMsg(entryMsg,seedEP);
  }
  

  _sendCtrlMsg (msg,endpoint){
    const sign = this._miningSign();
    msg.sign = sign;
    const message = new Buffer.from(JSON.stringify(msg));
    //console.log('_sendCtrlMsg config=<',config,'>');
    udpCtrl.send(message, 0, message.length, endpoint.port, endpoint.address, (err, bytes) =>{
      if (err) {
        throw err;
      }
      console.log('_sendCtrlMsg sent bytes=<',bytes,'>');
    });  
  }


  _onCtrlMsg(msg,remote){
    //console.log('_onCtrlMsg remote=<',remote,'>');
    //console.log('_onCtrlMsg msg=<',msg,'>');
    if(msg && msg.sign) {
      let good = this._verify(msg.sign);
      //console.log('_onCtrlMsg good=<',good,'>');
      if(!good) {
        return ;
      }      
    } else {
      return;
    }
    if(msg && msg.entry && msg.sign.p) {
      this._onEntryPeer(remote,msg.sign.p);
      return;
    }
    if(msg && msg.allow ) {
      this._onAllowList(msg.allow);
      return;
    }
    //console.log('_onCtrlMsg msg=<',msg,'>');
    if(msg && msg.ping && msg.sign.p && msg.sign.o) {
      this._onPingPeer(remote,msg.sign.p,msg.sign.o);
      return;
    }
    //console.log('_onCtrlMsg msg=<',msg,'>');
    if(msg && msg.pong && msg.sign.p && msg.sign.o) {
      this._onPongPeer(remote,msg.sign.p,msg.sign.o,msg.pong);
      return;
    }
    console.log('_onCtrlMsg msg=<',msg,'>');
  }
  
  
  _onEntryPeer(remote,peer) {
    //console.log('_onEntryPeer remote=<',remote,'>');
    //console.log('_onEntryPeer peer=<',peer,'>');
    /*
    if(peer === this.pubKey) {
      return;
    }
    */
    let endpoint = JSON.parse(JSON.stringify(remote));
    delete endpoint.size;
    delete endpoint.family;
    this._savePeer(peer,endpoint);
    const allowMsg = { allow:this._worldNode };
    this._sendCtrlMsg(allowMsg,endpoint);
  }
  
  _savePeer(peer,endpoint) {
    if(this._worldNode[peer]) {
      this._worldNode[peer] = endpoint;
    }
    //console.log('_savePeer endpoint=<',endpoint,'>');
    let netSize = Object.keys(this._worldNode);
    //console.log('_savePeer netSize=<',netSize,'>');
    if(netSize.length < iConstWorldNodeSizeMax) {
      this._worldNode[peer] = endpoint;
    }
    console.log('_savePeer this._worldNode=<',this._worldNode,'>');    
  }
  
  _onAllowList (allow) {
    //console.log('_onAllowList allow=<',allow,'>');
    for (let peer in allow) {
      //console.log('_onAllowList peer=<',peer,'>');
      if(peer !== this.pubKey) {
        this._onAllow(allow[peer],peer);
      }
    }
  }
  _onAllow(endpoint,peer) {
    //console.log('_onAllow endpoint=<',endpoint,'>');
    //console.log('_onAllow peer=<',peer,'>');
    this._savePeer(peer,endpoint)
    this._ping(endpoint);
  }
  _ping(endpoint) {
    const pingMsg = { ping:true };
    this._sendCtrlMsg(pingMsg,endpoint);    
  }
  _onPingPeer(endpoint,peer,timestamp) {
    //console.log('_onPingPeer endpoint=<',endpoint,'>');
    //console.log('_onPingPeer peer=<',peer,'>');
    //console.log('_onPingPeer timestamp=<',timestamp,'>');
    this._pong(endpoint,timestamp);
  }

  _pong(endpoint,timestamp) {
    let now = new Date();
    let pingTS = this._toDate(timestamp);
    let pingTTS = now - pingTS;
    console.log('_pong pingTTS=<',pingTTS,'>');
    const pongMsg = { pong:{timestamp:timestamp,tts:pingTTS}};
    this._sendCtrlMsg(pongMsg,endpoint);    
  }
  _onPongPeer(endpoint,peer,timestamp,pong) {
    //console.log('_onPongPeer endpoint=<',endpoint,'>');
    //console.log('_onPongPeer peer=<',peer,'>');
    //console.log('_onPongPeer timestamp=<',timestamp,'>');
    //console.log('_onPongPeer pong=<',pong,'>');
    let pongTS_Start = this._toDate(timestamp);
    //console.log('_onPongPeer pongTS_Start=<',pongTS_Start,'>');
    let pingTS_Start = this._toDate(pong.timestamp);
    //console.log('_onPongPeer pingTS_Start=<',pingTS_Start,'>');
    let pingTTL = pongTS_Start - pingTS_Start;
    //console.log('_onPongPeer pingTTL=<',pingTTL,'>');
    let now = new Date();
    let ttsPong = now - pongTS_Start;
    //console.log('_onPongPeer ttsPong=<',ttsPong,'>');
    //console.log('_onPongPeer pong.tts=<',pong.tts,'>');
    let ttsNet = (ttsPong + pong.tts)/2;
    console.log('_onPongPeer ttsNet=<',ttsNet,'>');
  }
  
  _toDate(ts) {
    let date = new Date(ts);
    //console.log('_toDate date=<',date,'>');
    let ts_array = ts.split(';')
    //console.log('_toDate ts_array=<',ts_array,'>');
    if(ts_array.length > 1) {
      let milisec = parseInt(ts_array[1]);
      date.setMilliseconds(milisec);
    }
    return date;
  }


  _miningSign() {
    while(true) {
      let sign = this._sign();
      //console.log('_miningSign sign=<',sign,'>');
      const sha256 = crypto.createHash('sha256');
      sha256.update(sign.s);
      const hash = sha256.digest('base64');
      if(hash.startsWith(sConstMiningDiffculty)) {
        //console.log('_miningSign hash=<',hash,'>');
        sign.h = hash;
        return sign;
      }
    }
  }

  
  _sign() {
    const now = new Date();
    const orig = now.toUTCString() + ';' + now.getMilliseconds();
    const signEngine = new RS.KJUR.crypto.Signature({alg: 'SHA1withRSA'});
    //console.log('_sign signEngine=<',signEngine,'>');
    signEngine.init({d: this.prvKey.prvKeyHex, curve: 'P-256'});
    signEngine.updateString(orig);
    let sigValueHex = signEngine.sign();
    //console.log('_sign sigValueHex=<',sigValueHex,'>');
    const bytes = Buffer.from(sigValueHex, 'hex');
    let sigValueB64 = bytes.toString('base64');
    //console.log('_sign sigValueB64=<',sigValueB64,'>');
    return {o:orig,p:this.pubKey,s:sigValueB64};
  }
  
  
  _verify(sign) {
    //console.log('_verify sign=<',sign,'>');
    if(!sign.h.startsWith(sConstMiningDiffculty)) {
      return false;
    }
    const sha256 = crypto.createHash('sha256');
    sha256.update(sign.s);
    const hash = sha256.digest('base64');
    //console.log('_verify hash=<',hash,'>');
    if(hash !== sign.h) {
      return false;
    }
    let keyBuffer = bs58.decode(sign.p);
    //console.log('_verify keyBuffer=<',keyBuffer,'>');
    let keyHex = keyBuffer.toString('hex');
    //console.log('_verify keyHex=<',keyHex,'>');
    let sigValueBuffer = Buffer.from(sign.s,'base64');
    //console.log('_verify sigValueBuffer=<',sigValueBuffer,'>');
    let sigValueHex = sigValueBuffer.toString('hex');
    //console.log('_verify sigValueHex=<',sigValueHex,'>');
    const signEngine = new RS.KJUR.crypto.Signature({alg: 'SHA1withRSA'});
    signEngine.init({xy: keyHex, curve: 'P-256'});
    signEngine.updateString(sign.o);
    //console.log('_verify signEngine=<',signEngine,'>');
    let result = signEngine.verify(sigValueHex);
    //console.log('_verify result=<',result,'>');
    return result;
  }


}






