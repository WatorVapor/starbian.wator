StarBian.onReadyOfKey = (key) => {
  console.log('StarBian.onReadyOfKey key=<' , key , '>');
};



function onRemoteKeyRead() {
  let remotekeys = StarBian.getRemoteKey();
  console.log('onRemoteKeyRead remotekeys=<' , remotekeys , '>');
  let urls = [];
  for(let i = 0;i < remotekeys.length ; i++) {
    let casturl = 'https://www.wator.xyz/starbian/cloud/videocam_cast_opencv/' + remotekeys[i];
    let rcvurl = 'https://www.wator.xyz/starbian/cloud/videocam_recv/' + remotekeys[i];
    let keyPairs = {
      key:remotekeys[i],
      casturl:casturl,
      rcvurl:rcvurl,
    };
    urls.push(keyPairs);
  }
  let app2 = new Vue({
    el: '#vue-ui-remote-device-keys',
    data: {
      remoteDeviceKeys: urls
    }
  });
}
$(document).ready(function(){
  onRemoteKeyRead();
  let elemBtn = document.getElementById('vue-ui-remote-device-keys');
  console.log('onRemoteKeyRead elemBtn=<' , elemBtn , '>');
});
  
