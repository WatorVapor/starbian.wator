const Broker = require('../api/broker.js');
const options = {
  bootstrap:[
    {
      host:'127.0.0.1',
      port:11234
    },
    {
      host:'::1',
      port:11235
    }
  ],
  cluster:{
    ipv4:{
      host:'127.0.0.1',
      port:11234
    },
    ipv6:{
      host:'::1',
      port:11235
    }
  },
  pubsub:{
    ipv4:{
      host:'127.0.0.1',
      port:11236
    },
    ipv6:{
      host:'::1',
      port:11237
    }
  },
  masterKey:{
    kty: 'ed25519',
    publicKey: '',
    secretKey: ''
  },
  repos:{
    
  }
}
const broker = new Broker(options);
