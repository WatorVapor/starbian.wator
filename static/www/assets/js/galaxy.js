const Mass = await import(`${appPrefix}/assets/js/mass.js`);
export class Galaxy {
  static debug = true;
  constructor() {
  }
  create() {
    if(Galaxy.debug) {
      console.log('Galaxy::create::Mass=<',Mass,'>');
    }
    this.mass_ = new Mass.Mass('starbian/galaxy/created');
    if(Galaxy.debug) {
      console.log('Galaxy::create::this.mass_.address()=<',this.mass_.address(),'>');
    }
  } 
  address() {
    return 'WG' + this.mass_.address();
  }
}

export class GalaxyFactory {
  static debug = true;
  constructor() {
  }
  save2Storage(galaxy) {
    if(GalaxyFactory.debug) {
      console.log('GalaxyFactory::save2Storage::galaxy=<',galaxy,'>');
    }    
  }
}
