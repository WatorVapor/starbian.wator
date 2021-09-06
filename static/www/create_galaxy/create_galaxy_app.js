document.addEventListener('AppScriptLoaded', async (evt) => {
  console.log('AppScriptLoaded::evt=<',evt,'>');
  createGalaxyApp_();
});

let gVMCreateGalaxy = false;
const createGalaxyApp_ = async ()=> {
  const GLXY = await import(`${appPrefix}/asset/js/galaxy.js`);
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
        glaxy:{
          address:address,
          name:address
        }
      };
    }
  });
  gVMCreateGalaxy = appGalaxy.mount('#vue-ui-create-galaxy');
}
