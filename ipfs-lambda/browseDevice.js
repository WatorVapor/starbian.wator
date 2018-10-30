StarBian.onReadyOfKey = (key) => {
  console.log('StarBian.onReadyOfKey key=<' , key , '>');
  doUpdatePublicKey(key);
};

let broadcastKey = new StarBian.BroadCast();
broadcastKey.isReady = false;
broadcastKey.onReady = () => {
  broadcastKey.isReady = true;
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
  

function doUpdatePublicKey(key) {
  console.log('doUpdatePublicKey key=<' , key , '>');
  let app1 = new Vue({
    el: '#text-this-device-key',
    data: {
      pub_key: key
    }
  });
}

function onQRCodePubKey (elem) {
  try {
    //console.log('onQRCodePubKey  elem=<' , elem , '>');
    let pubKey = $('#text-this-device-key').text().trim();
    console.log('onQRCodePubKey pubKey=<' , pubKey , '>');
    $( '#qrcode-pubkey' ).empty();
    jQuery('#qrcode-pubkey').qrcode(pubKey);
  } catch(e) {
    console.error(e);
  }
}

function onSharedPubKey (elem) {
  try {
    console.log('onSharedPubKey  elem=<' , elem , '>');
    elem.setAttribute('disabled','true');
    broadcastKey.broadcastPubKey( (status,password) => {
      console.log('onSharedPubKey status=<' , status , '>');
      if(status < 1) {
        elem.setAttribute('disabled','false');
        $("#text-share-key-onetime-password").addClass("d-none");
        $("#top-share-key-onetime-progress").addClass("d-none");
        return;
      }
      if(password) {
        $("#text-share-key-onetime-password").text(password);
      }
      $("#text-share-key-onetime-password").removeClass("d-none");
      $("#text-share-key-onetime-password").toggleClass('bg-success');
      
      
      $("#text-share-key-onetime-progress").text(status *10);
      $("#text-share-key-onetime-progress").attr('style','width: ' + status *10 + '%');
      $("#text-share-key-onetime-progress").attr('aria-valuenow',status *10);
      $("#top-share-key-onetime-progress").removeClass("d-none");
      console.log('onSharedPubKey password=<' , password , '>');
    });
  } catch(e) {
    console.error(e);
  }
}

function onReadQRCode (elem) {
  try {
    console.log('onReadQRCode  elem=<' , elem , '>');
    let scanner = new Instascan.Scanner({ video: document.getElementById('qrcode-preview'), scanPeriod: 5 });
    Instascan.Camera.getCameras().then(function (cameras) {
      if (cameras.length > 0) {
        let index = 0;
        for(let i = 0 ;i < cameras.length;i++) {
          console.log('onReadQRCode  cameras[i].name=<' , cameras[i].name , '>');
          if( cameras[i].name && cameras[i].name.includes('facing back') ) {
            index = i;
          }
        }
        console.log('onReadQRCode  index=<' , index , '>');
        scanner.start(cameras[index]);
      } else {
        console.error('No cameras found.');
      }
    }).catch(function (e) {
      console.error(e);
    });
    scanner.addListener('scan', function (content, image) {
      console.log('onQRCodePubKey  content=<' , content , '>');
      if(content) {
        $("#text-remote-device-key").text(content);
      }
    });
  } catch(e) {
    console.error(e);
  }
}

function onAddRemoteKey(elem) {
  try {
    console.log('onAddRemoteKey elem=<' , elem , '>');
    let root = elem.parentElement;
    console.log('onAddRemoteKey root=<' , root , '>');
    let textKey = root.getElementsByTagName('textarea')[0].value;
    console.log('onAddRemoteKey textKey=<' , textKey , '>');
    if(textKey) {
      StarBian.addRemoteKey(textKey.trim());
    }
  } catch(e) {
    console.error(e);
  }
}

function onSearchPubKey (elem) {
  try {
    //console.log('onSearchPubKey  elem=<' , elem , '>');
    let root = elem.parentElement.parentElement;
    //console.log('onSearchPubKey root=<' , root , '>');
    let textPassword = root.getElementsByTagName('input')[0].value;
    //console.log('onSearchPubKey textPassword=<' , textPassword , '>');
    if(!textPassword) {
      return;
    }
    broadcastKey.listenPubKey(textPassword.trim(), (pubKey,verified) => {
      console.log('onSearchPubKey pubKey=<' , pubKey , '>');
      console.log('onSearchPubKey verified=<' , verified , '>');
      $("#text-share-key-onetime-password-verified-counter").removeClass("d-none");
      $("#text-share-key-onetime-password-verified-counter").text( 'This password  is verified ' + verified + ' Times');
      $("#text-remote-device-key").text(pubKey);
    });
  } catch(e) {
    console.error(e);
  }
}

function onRemoveRemoteKey (elem) {
  try {
    console.log('onRemoveRemoteKey elem=<' , elem , '>');
    let rootElem = elem.parentElement.parentElement.parentElement;
    console.log('onRemoveRemoteKey rootElem=<' , rootElem , '>');
    let keyElem = rootElem.getElementsByClassName('remote-key')[0];
    console.log('onRemoveRemoteKey keyElem=<' , keyElem , '>');
    let textKey = keyElem.textContent;
    console.log('onRemoveRemoteKey textKey=<' , textKey , '>');
    if(textKey) {
      console.log('onRemoveRemoteKey textKey=<' , textKey , '>');
      StarBian.removeRemoteKey(textKey.trim());
    }
  } catch(e) {
    console.error(e);
  }
}
  
function onQRCodeRemoteKey (elem) {
  try {
    console.log('onQRCodeRemoteKey  elem=<' , elem , '>');
    let root = elem.parentElement.parentElement.parentElement;
    console.log('onQRCodeRemoteKey root=<' , root , '>');
    let keyElem = root.getElementsByClassName('remote-key')[0];
    console.log('onQRCodeRemoteKey keyElem=<' , keyElem , '>');
    let pubKey = keyElem.textContent.trim();
    console.log('onQRCodePubKey pubKey=<' , pubKey , '>');
    let qrElem = root.getElementsByClassName('qrcode-remote-key')[0];
    console.log('onQRCodeRemoteKey qrElem=<' , qrElem , '>');
    let jElem = jQuery(qrElem);
    jElem.empty();
    jElem.qrcode(pubKey);
  } catch(e) {
    console.error(e);
  }
}

