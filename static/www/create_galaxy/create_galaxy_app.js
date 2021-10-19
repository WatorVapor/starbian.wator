document.addEventListener('AppScriptLoaded', async (evt) => {
  console.log('AppScriptLoaded::evt=<',evt,'>');
  createGalaxyApp_();
});

const createGalaxyApp_ = async ()=> {
  const GLXY = await import(`${appPrefix}/assets/js/galaxy.js`);
  console.log('createGalaxyApp_::GLXY=<',GLXY,'>');
  const galaxy = new GLXY.Galaxy();
  console.log('createGalaxyApp_::galaxy=<',galaxy,'>');
  galaxy.create();
  console.log('createGalaxyApp_::galaxy=<',galaxy,'>');
  const address = galaxy.address();
  console.log('createGalaxyApp_::address=<',address,'>');
  const appGalaxy = Vue.createApp({
    data() {
      return {
        galaxy:{
          address:address,
          name:address
        }
      };
    },
    methods: {
      onGalaxyCreateBtn(event) {
        //console.log('createGalaxyApp_::event=<',event,'>');
        //console.log('createGalaxyApp_::this.galaxy=<',this.galaxy,'>');
        console.log('createGalaxyApp_::this.galaxy.address=<',this.galaxy.address,'>');
        //console.log('createGalaxyApp_::this.galaxy.name=<',this.galaxy.name,'>');
        const gf = new GLXY.GalaxyFactory();
        const galaxyObj = {
          name:this.galaxy.name,
          core:galaxy
        };
        gf.save2Storage(galaxyObj);
      }
    }
  });
  const galaxyVM = appGalaxy.mount('#vue-ui-create-galaxy');
}
