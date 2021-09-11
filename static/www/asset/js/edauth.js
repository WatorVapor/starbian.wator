const constEdAuthPrefix = 'starbian/edauth';
const constEdAuthName = 'starbian/edauth/name';

const MASS = await import(`./mass.js`);
export class EDAuth {
  constructor() {
    if(EDAuth.debug) {
      console.log('EDAuth::constructor:MASS=<',MASS,'>');
    }
    this.mass_ = new MASS.Mass(constEdAuthPrefix);
    if(EDAuth.debug) {
      console.log('EDAuth::constructor:this.mass_=<',this.mass_,'>');
    }
    EDAuth.name_ = localStorage.getItem(constEdAuthName);
  }
  pub() {
    return this.mass_.pubKeyB64_;
  }
  secret() {
    return this.mass_.priKeyB64_;
  }
  address() {
    return 'WT' + this.mass_.address_;
  }
  name() {
    return EDAuth.name_;
  }
  storeName(name) {
    EDAuth.name_ = name;
    localStorage.setItem(constEdAuthName,name);
  }
  verifySecretKey(secretKey) {
    if(EDAuth.debug) {
      console.log('EDAuth::verifySecretKey:secretKey=<',secretKey,'>');
    }
    return this.mass_.verifySecretKey(secretKey);
  }

  importSecretKey(secretKey) {
    if(EDAuth.debug) {
      console.log('EDAuth::importSecretKey:secretKey=<',secretKey,'>');
    }
    return this.mass_.importSecretKey(secretKey);
  }
  static debug = true;
  static name_ = null;
}
