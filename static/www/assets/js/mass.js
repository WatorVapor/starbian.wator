export class Mass {
  static debug = false;
  constructor(storePrefix) {
    this.priKeyPath_ = `${storePrefix}/priKey`;
    this.pubKeyPath_ = `${storePrefix}/pubKey`;
    this.addressPath_ = `${storePrefix}/address`;
    const result = this.loadMassKey_();
    if(!result) {
      this.createMassKey_();
      this.loadMassKey_();
    }
  }
  pub() {
    return this.pubKeyB64_;
  }
  secret() {
    return this.priKeyB64_;
  }
  address() {
    return this.address_;
  }
  verifySecretKey(secretKey) {
    if(Mass.debug) {
      console.log('verifySecretKey::secretKey=<',secretKey,'>');
    }
    const secretBin = nacl.util.decodeBase64(secretKey);
    if(Mass.debug) {
      console.log('verifySecretKey::secretBin=<',secretBin,'>');
    }
    const keyPair = nacl.sign.keyPair.fromSecretKey(secretBin);
    if(Mass.debug) {
      console.log('verifySecretKey::keyPair=<',keyPair,'>');
    }
    if(keyPair) {
      return true;
    }
    return false;
  }
  importSecretKey(secretKey) {
    if(Mass.debug) {
      console.log('importSecretKey::secretKey=<',secretKey,'>');
    }
    const secretBin = nacl.util.decodeBase64(secretKey);
    if(Mass.debug) {
      console.log('importSecretKey::secretBin=<',secretBin,'>');
    }
    const keyPair = nacl.sign.keyPair.fromSecretKey(secretBin);
    if(Mass.debug) {
      console.log('importSecretKey::keyPair=<',keyPair,'>');
    }
    if(keyPair) {
      save2Storage_(keyPair);
      loadMassKey_();
      return true;
    }
    return false;
  }
  createMassKey_(){
    const keyPair = nacl.sign.keyPair();
    if(Mass.debug) {
      console.log('Mass::createMassKey_:keyPair=<',keyPair,'>');
    }
    this.save2Storage_(keyPair);
  }
  save2Storage_(keyPair){
    const b64Pri = nacl.util.encodeBase64(keyPair.secretKey);
    if(Mass.debug) {
      console.log('Mass::save2Storage_:b64Pri=<',b64Pri,'>');
    }
    localStorage.setItem(this.priKeyPath_,b64Pri);    
    const b64Pub = nacl.util.encodeBase64(keyPair.publicKey);
    if(Mass.debug) {
      console.log('Mass::save2Storage_:b64Pub=<',b64Pub,'>');
    }
    localStorage.setItem(this.pubKeyPath_,b64Pub);
    const hash1Pub = CryptoJS.RIPEMD160(b64Pub).toString(CryptoJS.enc.Base64);
    if(Mass.debug) {
      console.log('Mass::save2Storage_:hash1Pub=<',hash1Pub,'>');
    }
    const hash1pubBuffer = nacl.util.decodeBase64(hash1Pub);
    if(Mass.debug) {
      console.log('Mass::save2Storage_:hash1pubBuffer=<',hash1pubBuffer,'>');
    }  
    const address = Base58.encode(hash1pubBuffer);
    if(Mass.debug) {
      console.log('Mass::save2Storage_:address=<',address,'>');
    }
    localStorage.setItem(this.addressPath_,address);  
  }
  loadMassKey_() {
    try {
      const address = localStorage.getItem(this.addressPath_);
      if(Mass.debug) {
        console.log('Mass::loadMassKey_:address=<',address,'>');
      }
      this.address_ = address;
      const PriKey = localStorage.getItem(this.priKeyPath_);
      if(Mass.debug) {
        console.log('Mass::loadMassKey_:PriKey=<',PriKey,'>');
      }
      this.priKeyB64_ = PriKey;
      this.priKey_ = nacl.util.decodeBase64(PriKey);
      if(Mass.debug) {
        console.log('Mass::loadMassKey_:this.priKey_=<',this.priKey_,'>');
      }
      const keyPair = nacl.sign.keyPair.fromSecretKey(this.priKey_);
      if(Mass.debug) {
        console.log('Mass::loadMassKey_:keyPair=<',keyPair,'>');
      }    
      const pubKey = localStorage.getItem(this.pubKeyPath_);
      if(Mass.debug) {
        console.log('Mass::loadMassKey_:pubKey=<',pubKey,'>');
      }
      this.pubKeyB64_ = pubKey;
      this.pubKey_ = nacl.util.decodeBase64(pubKey);
    } catch(err) {
      console.log('Mass::loadMassKey_:err=<',err,'>');
      return false;
    }
    return true;
  }
}








