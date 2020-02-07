const PubSub = require('../api/pubsub.js');
const options = {
  bootstrap:[
    {
      host:'::1',
      port:11237
    }
  ],
  masterKey: {
    kty: 'ed25519',
    publicKey: '',
    secretKey: ''
  }
}
const pub = new PubSub(options);
