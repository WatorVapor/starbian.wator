document.addEventListener('AppScriptLoaded', async (evt) => {
  console.log('AppScriptLoaded::evt=<',evt,'>');
  createDashboardApp_();
});
const iConstGalaxyLayoutColOfOneRow = 3;

const createDashboardApp_ = async ()=> {
  const GLXY = await import(`${appPrefix}/assets/js/galaxy.js`);
  console.log('createDashboardApp_::GLXY=<',GLXY,'>');
  const gf = new GLXY.GalaxyFactory();
  const galaxys = gf.loadGalaxyCollection();
  console.log('createDashboardApp_::galaxys=<',galaxys,'>');
  const layoutGalaxys = [];
  let rowGalaxys = [];
  for(const galaxy in galaxys) {
    rowGalaxys.push(galaxys[galaxy]);
    if(rowGalaxys.length >= iConstGalaxyLayoutColOfOneRow) {
      layoutGalaxys.push(rowGalaxys);
      rowGalaxys = [];
    }
  }
  if(layoutGalaxys.length > 0) {
    layoutGalaxys.push(rowGalaxys);    
  }
  console.log('createDashboardApp_::layoutGalaxys=<',layoutGalaxys,'>');
  const appGalaxy = Vue.createApp({
    data() {
      return {
        galaxys:layoutGalaxys
      };
    },
    methods: {
    }
  });
  const galaxyVM = appGalaxy.mount('#vue-ui-galaxy-dashboard');
}

