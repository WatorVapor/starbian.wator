const Mass = await import(`${appPrefix}/assets/js/mass.js`);
const keyGalaxyCreated = 'starbian/galaxy/created';

export class Galaxy {
  static debug = true;
  constructor() {
  }
  create() {
    if(Galaxy.debug) {
      console.log('Galaxy::create::Mass=<',Mass,'>');
    }
    this.mass = new Mass.Mass(keyGalaxyCreated);
    if(Galaxy.debug) {
      console.log('Galaxy::create::this.mass.address()=<',this.mass.address(),'>');
    }
  } 
  address() {
    return 'WG' + this.mass.address();
  }
}

const keyGalaxyCollection = 'starbian/galaxy/collection';
export class GalaxyFactory {
  static debug = true;
  constructor() {
    this.loadAll();
  }
  loadAll() {
    try {
      const collectionStr = localStorage.getItem(keyGalaxyCollection);
      if(collectionStr) {
        this.collection = JSON.parse(collectionStr);
      } else {
        this.collection = {};
      }
    } catch(e) {
      this.collection = {};
      console.log('GalaxyFactory::loadAll::e=<',e,'>');
    }
  }
  save2Storage(galaxy) {
    if(GalaxyFactory.debug) {
      console.log('GalaxyFactory::save2Storage::galaxy=<',galaxy,'>');
      console.log('GalaxyFactory::save2Storage::this.collection=<',this.collection,'>');
    }
    this.collection[galaxy.core.address] = galaxy;
    localStorage.setItem(keyGalaxyCollection,JSON.stringify(this.collection,undefined,2));
    const mass = new Mass.Mass(keyGalaxyCreated);
    mass.destory();
  }
  loadGalaxyCollection() {
    return this.collection;
  }
}
