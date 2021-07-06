const constGravitonPriKey = 'Graviton/priKey';
const constGravitonPubKey = 'Graviton/pubKey';
const constGravitonMassAddress = 'Graviton/mass/address';
const constGravitonMassName = 'Graviton/mass/name';
document.addEventListener('DOMContentLoaded', async (evt) => {
  const result = loadGravitonKey_();
  if(!result) {
    createGravitonKey_();
    loadGravitonKey_();
  }
});

const createGravitonKey_ = () => {
  const keyPair = nacl.sign.keyPair();
  if(Graviton.debug) {
    console.log('createGravitonKey_::keyPair=<',keyPair,'>');
  }
  const b64Pri = nacl.util.encodeBase64(keyPair.secretKey);
  if(Graviton.debug) {
    console.log('createGravitonKey_::b64Pri=<',b64Pri,'>');
  }
  localStorage.setItem(constGravitonPriKey,b64Pri);
  
  const b64Pub = nacl.util.encodeBase64(keyPair.publicKey);
  if(Graviton.debug) {
    console.log('createGravitonKey_::b64Pub=<',b64Pub,'>');
  }
  localStorage.setItem(constGravitonPubKey,b64Pub);
  const hash1Pub = CryptoJS.RIPEMD160(b64Pub).toString(CryptoJS.enc.Base64);
  if(Graviton.debug) {
    console.log('createGravitonKey_::hash1Pub=<',hash1Pub,'>');
  }
  
  const address = Base58.encode(hash1Pub);
  if(Graviton.debug) {
    console.log('createGravitonKey_::address=<',address,'>');
  }
  localStorage.setItem(constGravitonMassAddress,address);
}

const loadGravitonKey_ = ()=> {
  try {
    const address = localStorage.getItem(constGravitonMassAddress);
    if(Graviton.debug) {
      console.log('loadGravitonKey_::address=<',address,'>');
    }
    Graviton.address_ = address;
    const name = localStorage.getItem(constGravitonMassName);
    if(Graviton.debug) {
      console.log('loadGravitonKey_::name=<',name,'>');
    }
    Graviton.name_ = name;


    const PriKey = localStorage.getItem(constGravitonPriKey);
    if(Graviton.debug) {
      console.log('loadGravitonKey_::PriKey=<',PriKey,'>');
    }
    Graviton.priKeyB64_ = PriKey;
    Graviton.priKey_ = nacl.util.decodeBase64(PriKey);
    if(Graviton.debug) {
      console.log('loadGravitonKey_::Graviton.priKey_=<',Graviton.priKey_,'>');
    }
    const keyPair = nacl.sign.keyPair.fromSecretKey(Graviton.priKey_);
    if(Graviton.debug) {
      console.log('loadGravitonKey_::keyPair=<',keyPair,'>');
    }    
    const pubKey = localStorage.getItem(constGravitonPubKey);
    if(Graviton.debug) {
      console.log('loadGravitonKey_::pubKey=<',pubKey,'>');
    }
    Graviton.pubKeyB64_ = pubKey;
    Graviton.pubKey_ = nacl.util.decodeBase64(pubKey);


  } catch(err) {
    console.log('loadGravitonKey_::err=<',err,'>');
    return false;
  }
  return true;
}

class Graviton {
  constructor() {
    if(Graviton.priKeyB64_ === null) {
      const result = loadGravitonKey_();
      if(!result) {
        createGravitonKey_();
        loadGravitonKey_();
      }      
    }
  }
  pub() {
    return Graviton.pubKeyB64_;
  }
  secret() {
    return Graviton.priKeyB64_;
  }
  address() {
    return 'WT' + Graviton.address_;
  }
  name() {
    return Graviton.name_;
  }
  storeName(name) {
    Graviton.name_ = name;
    localStorage.setItem(constGravitonMassName,name);
  }
  verifySecretKey(secretKey) {
    if(Graviton.debug) {
      console.log('verifySecretKey::secretKey=<',secretKey,'>');
    }
    const secretBin = nacl.util.decodeBase64(secretKey);
    if(Graviton.debug) {
      console.log('verifySecretKey::secretBin=<',secretBin,'>');
    }
    const keyPair = nacl.sign.keyPair.fromSecretKey(secretBin);
    if(Graviton.debug) {
      console.log('verifySecretKey::keyPair=<',keyPair,'>');
    }
    if(keyPair) {
      return true;
    }
    return false;
  }

  static debug = false;
  static priKeyB64_ = null;
  static pubKeyB64_ = null;
  static priKey_ = null;
  static pubKey_ = null;
  static address_ = null;
  static name_ = null;
}