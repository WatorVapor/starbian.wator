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
    kty: 'EC',
    crv: 'P-256',
    x: 'C5NWDLuJip1NCcQbKG80y6EDDINkHM88cIJioBDLimI',
    y: 'MLE8G0z1K2jvTcSfneHahgSw3sR2X10GAY8L4-EREyI',
    d: 'MiXegg3qMwgJGC3QlTBemmGqDrPJHCphXIIcIJ4Q08c'
  },
  repos:{
    
  }
}
const broker = new Broker(options);
