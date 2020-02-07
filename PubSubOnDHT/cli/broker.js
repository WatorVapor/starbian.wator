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
    publicKey: '6k07qs1kfthq3pt6zxa8k5647x4a3v9v2hs7ys21b6zqwge8j130',
    secretKey: '216jeyjtxr01r3r8vza64qhme6hbr8wbkdj7e9wg9v4y36gpa3d39g3vwgsqx8vhvd3fyn49jk23yj51xmxh8wkzch0nkfvy87490hg'
  },
  repos:{
    
  }
}
const broker = new Broker(options);
