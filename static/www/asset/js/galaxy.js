
export class Galaxy {
  static debug = true;
  constructor() {
  }
  create() {
    const keyPair = nacl.sign.keyPair();
    if(Galaxy.debug) {
      console.log('Galaxy::create::keyPair=<',keyPair,'>');
    }
    this.keyPair_ = keyPair;
    const b64Pri = nacl.util.encodeBase64(keyPair.secretKey);
    if(Galaxy.debug) {
      console.log('Galaxy::create::b64Pri=<',b64Pri,'>');
    }
    this.b64Pri_ = b64Pri;
    const b64Pub = nacl.util.encodeBase64(keyPair.publicKey);
    if(Galaxy.debug) {
      console.log('Galaxy::create::b64Pub=<',b64Pub,'>');
    }
    this.b64Pub_ = b64Pub;
    const hash1Pub = CryptoJS.RIPEMD160(b64Pub).toString(CryptoJS.enc.Base64);
    if(Galaxy.debug) {
      console.log('Galaxy::create::hash1Pub=<',hash1Pub,'>');
    }
    const hash1pubBuffer = nacl.util.decodeBase64(hash1Pub);
    if(Galaxy.debug) {
      console.log('Galaxy::create::hash1pubBuffer=<',hash1pubBuffer,'>');
    }
    const address = Base58.encode(hash1pubBuffer);
    if(Galaxy.debug) {
      console.log('Galaxy::create::address=<',address,'>');
    }
    this.address_ = address;
  }
  address() {
    return 'WG' + this.address_;
  }
}

export class GalaxyFactory {
  static debug = true;
  constructor() {
  }
  
}
