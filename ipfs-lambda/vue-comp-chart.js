
Vue.component('starbian-signal-generator-chart', {
  data: function () {
    let remotekeys = StarBian.getRemoteKey();
    //console.log('starbian-signal-generator-chart remotekeys=<' , remotekeys , '>');
    let retmoteGroups = [];
    let groups =[];
    for(let i = 0;i < remotekeys.length ; i++) {
      createStarbianPeer(remotekeys[i]);
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
              <canvas width="320" height="240" class="starbian-chart">{{ device.remote }}</canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
});

createStarbianPeer = (pubKey) => {
  console.log('createStarbianPeer pubKey=<' , pubKey , '>');
  let peer = new StarBian.Peer(pubKey);
  peer.subscribe((msg)=>{
    onMessage(msg,pubKey);
  });
};

onMessage = (msg,pubKey) => {
  //console.log('onMessage msg=<' , msg , '>');  
  //console.log('onMessage pubKey=<' , pubKey , '>');
  let chartElems = document.getElementsByClassName('starbian-chart');
  //console.log('onMessage chartElems=<' , chartElems , '>');
  for(let i = 0;i < chartElems.length;i++) {
    let chartElem = chartElems[i];
    //console.log('onMessage chartElem=<' , chartElem , '>');
    let chartId = chartElem.textContent;
    //console.log('onMessage chartId=<' , chartId , '>');
    if(chartId === pubKey) {
      onUpdateGraph(chartElem,msg,pubKey);
    }
  }
};

let dataCache = {};
onUpdateGraph = (ctx,msg,pubKey) => {
  console.log('onUpdateGraph msg=<' , msg , '>');
  if(!dataCache[pubKey]) {    
    dataCache[pubKey] = [];
    //dataCache[pubKey].push(1.0);
    //dataCache[pubKey].push(-1.0);
  }
  dataCache[pubKey].push(msg.wave);
  if(dataCache[pubKey].length >= 240) {
    dataCache[pubKey] = [];
    //dataCache[pubKey].push(1.0);
    //dataCache[pubKey].push(-1.0);    
  }
  
  let graphOption = {
    type: 'line',
    data: {
      labels: new Array(240),
      datasets: [ 
        {
          label: 'wave',
          data:dataCache[pubKey],
          borderColor: 'rgba(255,0,0,1)',
          backgroundColor: 'rgba(0,0,0,0)'
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: ''
      },
      scales: {
        yAxes: [{
          ticks: {
            suggestedMax: 1.0,
            suggestedMin: -1.0,
            stepSize: 0.1,
            callback: function(value, index, values){
              return '';
            }
          }
        }]
      },
      elements: { 
        point: { 
          radius: 0,
          hitRadius: 10, 
          hoverRadius: 5,
        } 
      } 
    }
  };
  console.log('onUpdateGraph dataCache=<' , dataCache , '>');
  let myChart = new Chart(ctx,graphOption);
}
