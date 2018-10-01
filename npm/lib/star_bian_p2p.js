const Room = require('ipfs-pubsub-room');
const IPFS = require('ipfs');
const crypto = require("crypto");
const bs58 = require('bs58')

let nowTag = new Date();

let dNowTag = crypto.createHash('sha224');
dNowTag.update(nowTag.toISOString());
const pubsubRepos = bs58.encode(dNowTag.digest('hex'));
//console.log('pubsubRepos=<',pubsubRepos,'>');

const WELCOME_MESSAGE = '小兔子乖乖，把门儿打开。'

const IPFS_CONF = {
  repo: '.ipfs_pubsub_room_data',
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        //'/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  }
};

let ipfsUniq = false;

module.exports = class StarBianP2p {
  constructor() {
    let d = new crypto.createHash('sha224');
    d.update(WELCOME_MESSAGE);
    let number = d.digest('hex');
    this.number = bs58.encode(number);
    //console.log('this.number=<',this.number,'>');
    try {
      if(ipfsUniq) {
        this.ipfs = ipfsUniq;
      } else {
        this.ipfs = new IPFS(IPFS_CONF);
        ipfsUniq = this.ipfs;
      }
    } catch(e) {
      console.error('e=<',e,'>');
    }
    let self = this;
    this.ipfs.on('ready', () => {
      self._onInit();
    });
    this._cb = {};
  }
  out(channel,msgObj,to) {
    msgObj.channel = channel;
    if(to) {
      this.room.sendTo(to,JSON.stringify(msgObj));
    } else {
      this.room.broadcast(JSON.stringify(msgObj));
    }
  }
  in(channel,cb) {
    this._cb[channel] = cb;
  }
  
  _onInit() {
    let self = this;
    this.ipfs.id( (err,identity)=>{
      if (err) {
        throw err
      }
      console.log('identity=<',identity,'>');
      self.peer = identity.id;
    });
    this.room = Room(this.ipfs, 'wai-' + this.number);
    this.room.on('peer joined', (peer) => {
      //console.log('Peer joined the room', peer);
      if(typeof self.onJoint === 'function') {
        self.onJoint(peer);
      }
    });
    this.room.on('peer left', (peer) => {
      //console.log('Peer left...', peer);
    });
    // now started to listen to room
    this.room.on('subscribed', () => {
      //console.log('Now connected!');
      if(typeof self.onReady === 'function') {
        self.onReady();
      }
    });
    this.room.on('message', (msg)=>{
      self._onRoomMessage(msg);
    });
  }
  _onRoomMessage(msg) {
    //console.log('onRoomMessage::this.peer=<',this.peer,'>');
    //console.log('onRoomMessage::msg=<',msg,'>');
    let jsonData = JSON.parse(msg.data.toString('utf8'));
    //console.log('onRoomMessage::jsonData=<',jsonData,'>');
    if(jsonData && jsonData.channel) {
      if(jsonData.channel === 'broadcast') {
        let cbKeys = Object.keys(this._cb);
        for(let i = 0;i < cbKeys.length;i++) {
          let key = cbKeys[i]
          let cb = this._cb[key];
          if(typeof(cb) === 'function') {
            let channel = jsonData.channel;
            //console.log('onRoomMessage::channel=<',channel,'>');
            cb(jsonData,channel,msg.from);
          } else {
            //console.log('onRoomMessage::jsonData=<',jsonData,'>');
          }
        }
        return;
      }
      let cb = this._cb[jsonData.channel];
      if(typeof(cb) === 'function') {
        let channel = jsonData.channel;
        cb(jsonData,channel,msg.from);
      } else {
        //console.log('onRoomMessage::jsonData=<',jsonData,'>');
      }
    }
  }
};
