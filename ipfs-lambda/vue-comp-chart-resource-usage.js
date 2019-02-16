Vue.component('starbian-resource-usage-list', {
  data: function () {
    let remotekeys = StarBian.getRemoteKey();
    console.log('starbian-resource-usage-list remotekeys=<' , remotekeys , '>');
    //console.log('starbian-resource-usage-list retmoteGroups=<' , retmoteGroups , '>');
    let keys = [];
    for(let key of remotekeys) {
      keys.push({key:key,url:'./resourceUsageGraph.html?' + key})
    }
    return {
      remoteDevice: keys
    }
  },  
  template: `
    <div class="row justify-content-center mt-5">
      <div class="col-8">
        <table class="table table-striped text-center">
          <thead>
            <th scope="col">Remote Device</th>
            <th scope="col"></th>
          </thead>
          <tbody>
            <tr v-for="device in remoteDevice">
              <td>{{ device.key }}</td>
              <td><a class="btn btn-primary" v-bind:href="device.url" role="button">Show Graph</a></td>
            </tr>
          </tbody>
        </table>
    </div>
    </div>
  `
});


Vue.component('starbian-resource-usage-chart-single-peer', {
  data: function () {
    let pubKey = location.search.substring(1).trim();
    console.log('starbian-resource-usage-chart-single-peer pubKey=<' , pubKey , '>');
    if(pubKey) {
      createStarbianPeerSinglePeer(pubKey);
    }
    return {}
  },  
  template: `
    <div class="row justify-content-center">
      <div class="col-6 mt-5 text-center">
        <canvas width="320" height="240" id="starbian-chart-memory"></canvas>
      </div>
      <div class="col-6 mt-5 text-center">
        <canvas width="320" height="240" id="starbian-chart-cpu"></canvas>
      </div>
    </div>
  `
});

createStarbianPeerSinglePeer = (pubKey) => {
  console.log('createStarbianPeerSinglePeer pubKey=<' , pubKey , '>');
  let peer = new StarBian.Peer(pubKey);
  peer.onopen =() => {
    console.log('createStarbianPeerSinglePeer peer.onopen pubKey=<' , pubKey , '>');
  };
  peer.subscribe((msg)=>{
    onMessageSinglePeer(msg,pubKey);
  });
};

onMessageSinglePeer = (msg,pubKey) => {
  //console.log('onMessageSinglePeer msg=<' , msg , '>');  
  //console.log('onMessageSinglePeer pubKey=<' , pubKey , '>');
  let memElem = document.getElementById('starbian-chart-memory');
  console.log('onMessageSinglePeer memElem=<' , memElem , '>');
  onUpdateGraphSinglePeerMem(memElem,msg.memory,pubKey);
  let cpuElem = document.getElementById('starbian-chart-cpu');
  console.log('onMessageSinglePeer cpuElem=<' , cpuElem , '>');
  onUpdateGraphSinglePeerCPU(cpuElem,msg.cpu,pubKey);
};


let dataCacheSinglePeerMem = {};
const iConstGraphWidthSinglePeer = 64;


onUpdateGraphSinglePeerMem = (ctx,value,pubKey) => {
  console.log('onUpdateGraphSinglePeerMem value=<' , value , '>');
  if(!dataCacheSinglePeerMem[pubKey]) {    
    dataCacheSinglePeerMem[pubKey] = [];
  }
  dataCacheSinglePeerMem[pubKey].push(value);
  if(dataCacheSinglePeerMem[pubKey].length >= iConstGraphWidthSinglePeer) {
    dataCacheSinglePeerMem[pubKey].shift();
  }
  
  let graphOption = {
    type: 'line',
    data: {
      labels: new Array(iConstGraphWidthSinglePeer),
      datasets: [ 
        {
          label: 'Memory Usage',
          fill: false,
          data:dataCacheSinglePeerMem[pubKey],
          borderColor: 'rgba(255,0,0,1)'
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
            /*suggestedMax: 1.0,*/
            /*suggestedMin: 0.0,*/
            stepSize: 0.01,
            callback: function(value, index, values){
              return values;
            }
          }
        }]
      },
      elements: { 
        point: { 
          radius: 0,
          hitRadius: 1, 
          hoverRadius: 1,
        } 
      } 
    }
  };
  console.log('onUpdateGraphSinglePeerMem dataCacheSinglePeerMem=<' , dataCacheSinglePeerMem , '>');
  let myChart = new Chart(ctx,graphOption);
}

const CPUGraphColorTable = [
  'rgba(255,0,0,1)',
  'rgba(0,255,0,1)',
  'rgba(0,0,255,1)',
  'rgba(0,255,255,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
  'rgba(255,0,0,1)',
];

let dataCacheSinglePeerCPU = {};
onUpdateGraphSinglePeerCPU = (ctx,value,pubKey) => {
  console.log('onUpdateGraphSinglePeerCPU value=<' , value , '>');
  if(value.length < 1 ) {
    return;
  }
  let datesets = [];
  if(!dataCacheSinglePeerCPU[pubKey]) {    
    dataCacheSinglePeerCPU[pubKey] = [];
  }
  for(let i = 0;i < value.length;i++) {
    if(!dataCacheSinglePeerCPU[pubKey][i]) {    
      dataCacheSinglePeerCPU[pubKey][i] = [];
    }
    dataCacheSinglePeerCPU[pubKey][i].push(value[i]);
    if(dataCacheSinglePeerCPU[pubKey][i].length >= iConstGraphWidthSinglePeer) {
      dataCacheSinglePeerCPU[pubKey][i].shift();
    }
    datesets[i] = {
      label: 'CPU Usage of Core ' + i,
      fill: false,
      data:dataCacheSinglePeerCPU[pubKey][i],
      borderColor: CPUGraphColorTable[i]
    }
  }
  console.log('onUpdateGraphSinglePeerCPU datesets=<' , datesets , '>');
  let graphOption = {
    type: 'line',
    data: {
      labels: new Array(iConstGraphWidthSinglePeer),
      datasets: datesets
    },
    options: {
      title: {
        display: true,
        text: ''
      },
      scales: {
        yAxes: [{
          ticks: {
            stepSize: 0.01,
            callback: function(value, index, values){
              return values;
            }
          }
        }]
      },
      elements: { 
        point: { 
          radius: 0,
          hitRadius: 1, 
          hoverRadius: 1,
        } 
      } 
    }
  };
  console.log('onUpdateGraphSinglePeerCPU dataCacheSinglePeerCPU=<' , dataCacheSinglePeerCPU , '>');
  let myChart = new Chart(ctx,graphOption);
}





Vue.component('starbian-resource-usage-chart-multi', {
  data: function () {
    let remotekeys = StarBian.getRemoteKey();
    //console.log('starbian-resource-usage-chart remotekeys=<' , remotekeys , '>');
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
    //console.log('starbian-resource-usage-chart retmoteGroups=<' , retmoteGroups , '>');
    return {
      remoteGroup: retmoteGroups
    }
  },  
  template: `
    <div class="col-12 text-center">
      <div class="row mt-lg-1 justify-content-center" v-for="group in remoteGroup">
        <div class="col-6 text-center" v-for="device in group">
          <div class="card card-default text-center">
            <div class="card-header">
              <h6 class="small font-weight-bold">{{ device.remote }}</h6>
            </div>
            <div class="card-body">
              <canvas width="640" height="480" class="starbian-chart">{{ device.remote }}</canvas>
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
  peer.onopen =() => {
    console.log('createStarbianPeer peer.onopen pubKey=<' , pubKey , '>');
  };
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
const iConstGraphWidth = 32;
onUpdateGraph = (ctx,msg,pubKey) => {
  console.log('onUpdateGraph msg=<' , msg , '>');
  if(!dataCache[pubKey]) {    
    dataCache[pubKey] = [];
    //dataCache[pubKey].push(1.0);
    //dataCache[pubKey].push(-1.0);
  }
  dataCache[pubKey].push(msg.memory);
  if(dataCache[pubKey].length >= iConstGraphWidth) {
    dataCache[pubKey].shift();
    //dataCache[pubKey].push(1.0);
    //dataCache[pubKey].push(-1.0);    
  }
  
  let graphOption = {
    type: 'line',
    data: {
      labels: new Array(iConstGraphWidth),
      datasets: [ 
        {
          label: 'Memory Usage',
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
            /*suggestedMax: 1.0,*/
            /*suggestedMin: 0.0,*/
            stepSize: 0.01,
            callback: function(value, index, values){
              return values;
            }
          }
        }]
      },
      elements: { 
        point: { 
          radius: 0,
          hitRadius: 1, 
          hoverRadius: 1,
        } 
      } 
    }
  };
  console.log('onUpdateGraph dataCache=<' , dataCache , '>');
  let myChart = new Chart(ctx,graphOption);
}
