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
    publicKey: 'mvgkt8ghq8ax4vadr10gwncwrfcnb9wd835xh8nfj3rwpvp9xbs0',
    secretKey: 's29r2pz9tfdh1wrbf64m171e9fjqnsxgrvd6n7mcnshth7m51aktdr9x488vm5ejdn6w0g8eapec7panmy6m1jyrmaqs1webdv4ynwg'
  }
}
const pub = new PubSub(options);
