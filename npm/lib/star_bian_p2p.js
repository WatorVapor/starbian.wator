const Room = require('ipfs-pubsub-room');
const IPFS = require('ipfs');
const SHA3  = require('sha3');
const bs58 = require('bs58')

let nowTag = new Date();

let dNowTag = new SHA3.SHA3Hash(224);
dNowTag.update(nowTag.toISOString());
const pubsubRepos = bs58.encode(dNowTag.digest('hex'));
console.log('pubsubRepos=<',pubsubRepos,'>');

const IPFS_CONF = {
  repo: '.ipfs_pubsub_room_data',
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  }
};

const IPFS_CONF_EXT = {
  repo: '.ipfs_pubsub_room_data_' + pubsubRepos,
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  }
};


module.exports = class StarBianP2p {
  constructor() {
    let d = new SHA3.SHA3Hash(224);
    d.update('!!欢迎来到StarBian!!');
    let number = d.digest('hex');
    this.number = bs58.encode(number);
    console.log('this.number=<',this.number,'>');
    try {
      this.ipfs = new IPFS(IPFS_CONF);
    } catch(e) {
      console.error('e=<',e,'>');
      this.ipfs = new IPFS(IPFS_CONF_EXT);
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
      console.log('Peer joined the room', peer);
      if(typeof self.onJoint === 'function') {
        self.onJoint(peer);
      }
    });
    this.room.on('peer left', (peer) => {
      console.log('Peer left...', peer);
    });
    // now started to listen to room
    this.room.on('subscribed', () => {
      console.log('Now connected!');
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
    if(msg.from !== this.peer) {
      //console.log('onRoomMessage::msg=<',msg,'>');
      let jsonData = JSON.parse(msg.data.toString('utf8'));
      //console.log('onRoomMessage::jsonData=<',jsonData,'>');
      if(jsonData && jsonData.channel) {
        let cb = this._cb[jsonData.channel];
        if(typeof(cb) === 'function') {
          delete jsonData.channel;
          cb(jsonData,msg.from);
        } else {
          //console.log('onRoomMessage::jsonData=<',jsonData,'>');
        }
      }
    } else {
      //console.log('onRoomMessage::ignore loopback msg !!!!!!!!!!!!!!');
    }
  }
};
