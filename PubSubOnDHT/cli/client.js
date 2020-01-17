const PubSub = require('../api/pubsub.js');
const options = {
  bootstrap:[
    {
      host:'::1',
      port:11237
    }
  ],
  masterKey: {
    kty: 'EC',
    crv: 'P-256',
    x: '0dJLJFS-xC2Pf6xpj9mrrBARWMSasswx-3HDOXZ6RLk',
    y: 'TpyQIM2Weihjuz-ivICUn-j4AtElZa-ifvfSvuTlVyQ',
    d: 'fKKMDx278H-QCtpkOY2vjqH_832PuSqvwx6eOEL8KbA'
  }
}
const pub = new PubSub(options);
