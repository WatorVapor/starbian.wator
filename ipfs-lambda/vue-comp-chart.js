
Vue.component('starbian-signal-generator-chart', {
  data: function () {
    let remotekeys = StarBian.getRemoteKey();
    console.log('starbian-signal-generator-chart remotekeys=<' , remotekeys , '>');
    return {
      remotekeys: remotekeys
    }
  },  
  template: `

  `
});






