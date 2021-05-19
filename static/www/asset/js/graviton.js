const constGravitonPriKey = 'Graviton/priKey';
const constGravitonPubKey = 'Graviton/pubKey';
const constGravitonMassAddress = 'Graviton/mass/address';
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

    const PriKey = localStorage.getItem(constGravitonPriKey);
    if(Graviton.debug) {
      console.log('loadGravitonKey_::PriKey=<',PriKey,'>');
    }
    Graviton.priKeyB64_ = PriKey;
    Graviton.priKey_ = nacl.util.decodeUTF8(PriKey);
    
    const pubKey = localStorage.getItem(constGravitonPubKey);
    if(Graviton.debug) {
      console.log('loadGravitonKey_::pubKey=<',pubKey,'>');
    }
    Graviton.pubKeyB64_ = pubKey;
    Graviton.pubKey_ = nacl.util.decodeUTF8(pubKey);


  } catch(err) {
    return false;
  }
  return true;
}

class Graviton {
  static debug = false;
  static priKeyB64_ = null;
  static pubKeyB64_ = null;
  static priKey_ = null;
  static pubKey_ = null;
  static address_ = null;
  constructor() {
    
  }
  pub() {
    
  }
  address() {
    return 'WT' + address_;
  }
}