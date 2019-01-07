
Vue.component('starbian-signal-generator-chart', {
  data: function () {
    let remotekeys = StarBian.getRemoteKey();
    //console.log('starbian-signal-generator-chart remotekeys=<' , remotekeys , '>');
    let retmoteGroups = [];
    let groups =[];
    for(let i = 0;i < remotekeys.length ; i++) {
      let keyPairs = {
        remote:remotekeys[i],
      };
      groups.push(keyPairs);
      if(i%3 === 2) {
        retmoteGroups.push(groups);
        groups =[];
      }
    }
    if(groups.length > 0) {
      retmoteGroups.push(groups);
    }
    //console.log('starbian-signal-generator-chart retmoteGroups=<' , retmoteGroups , '>');
    return {
      remoteGroup: retmoteGroups
    }
  },  
  template: `
    <div class="col-12 text-center">
      <div class="row mt-lg-1 justify-content-center" v-for="group in remoteGroup">
        <div class="col-4 text-center" v-for="device in group">
          <div class="card card-default text-center">
            <div class="card-header">
              <h6 class="small font-weight-bold">{{ device.remote }}</h6>
            </div>
            <div class="card-body">
              <canvas width="320" height="240" onclick="onChartOfRemote(this)">{{ device.remote }}</canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
});

onChartOfRemote = (elem) => {
  console.log('onChartOfRemote elem=<' , elem , '>');
  let device = elem.textContent;
  console.log('onChartOfRemote device=<' , device , '>');
};

