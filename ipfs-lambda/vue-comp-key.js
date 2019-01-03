
Vue.component('starbian-key-pub', {
  data: function () {
    let pub_key = StarBian.getPubKey();
    console.log('starbian-key-pub pub_key=<' , pub_key , '>');
    return {
      pub_key: pub_key
    }
  },  
  template: `

      <div class="card card-default text-center bg-secondary">
        <div class="card-header">
          Public ECDSA Key
        </div>
        <div class="card-body">
          <pre class="card-text text-success" id="text-this-device-key" style="white-space: pre-wrap ; font-size: x-large;">
            {{ pub_key }}
          </pre>
          <button type="button" class="btn btn-primary mt-sm-1 pull-right btn-clipboard" id="btn-copy-key" data-clipboard-target="#text-this-device-key">
            <i class="fas fa-copy"></i>
          </button>
          <button type="button" class="btn btn-success mt-sm-1 ml-sm-2 pull-right" id="btn-qrcode-key" onclick="onQRCodePubKey(this)">
            <i class="fas fa-print"></i><i class="fas fa-qrcode"></i>
          </button>
          <button type="button" class="btn btn-warning mt-sm-1 ml-sm-2 pull-right" id="btn-share-key" onclick="onSharedPubKey(this)">
            <i class="fas fa-link"></i><i class="fas fa-share-alt-square"></i>
          </button>
          <h3 class="ml-lg-3 pull-left bg-success text-danger d-none" id="text-share-key-onetime-password">8182</h3>
          <div class="progress mr-lg-3 d-none" id="top-share-key-onetime-progress">
            <div id="text-share-key-onetime-progress" class="progress-bar progress-bar-striped progress-bar-animated " 
                role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
              100
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="qrcode-pubkey"></div>
        </div>
      </div>

  `
});


function onQRCodePubKey (elem) {
  try {
    //console.log('onQRCodePubKey  elem=<' , elem , '>');
    let pubKey = $('#text-this-device-key').text().trim();
    console.log('onQRCodePubKey pubKey=<' , pubKey , '>');
    $( '.qrcode-pubkey' ).empty();
    jQuery('.qrcode-pubkey').qrcode(pubKey);
  } catch(e) {
    console.error(e);
  }
}

let broadcastKey = new StarBian.BroadCast();
broadcastKey.isReady = false;
broadcastKey.onReady = () => {
  broadcastKey.isReady = true;
};


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



Vue.component('starbian-add-key-remote', {
  data: function () {
    return {
    }
  },  
  template: `
    <div class="card card-default text-center bg-info">
      <div class="card-header">
        Remote Device ECDSA Public key
      </div>
      <div class="card-body">
        <textarea class="form-control input-sm" id="text-remote-device-key" rows="4" ></textarea>
        <br/>
        <p class="d-none pull-left bg-warning" id="text-share-key-onetime-password-verified-counter"></p>
        <button type="button" class="btn btn-success btn-sm pull-right" id="btn-add-key" onclick="onAddRemoteKey(this)">
          <i class="fas fa-plus-circle"></i>
        </button>
        <button type="button" class="btn btn-warning btn-sm pull-right" id="btn-read-qrcode" onclick="onReadQRCode(this)">
          <i class="fas fa-camera-retro"></i>
          <i class="fas fa-qrcode"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="input-group mb-xs-1">
          <input type="text" class="form-control" placeholder="password show on remote device" aria-label="one time password" aria-describedby="button-addon2">
          <div class="input-group-append">
            <button class="btn btn-danger btn-sm" type="button" onclick="onSearchPubKey(this)" id="button-addon2"><i class="material-icons">search</i></button>
          </div>
        </div>
      </div>
      <div class="card-body">    
        <div class="preview-container">
          <video id="qrcode-preview" height=240 width=320 class="d-none"></video>
        </div>
      </div>
    </div>
  `
});


function onReadQRCode (elem) {
  try {
    console.log('onReadQRCode  elem=<' , elem , '>');
    $("#qrcode-preview").removeClass("d-none");
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
      location.reload(true);
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
      location.reload(true);
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


Vue.component('starbian-bind-device', {
  data: function () {
    let remotekeys = StarBian.getRemoteKey();
    console.log('starbian-bind-device remotekeys=<' , remotekeys , '>');
    let keys = [];
    for(let i = 0;i < remotekeys.length ; i++) {
      let keyPairs = {
        key:remotekeys[i],
      };
      keys.push(keyPairs);
    }
    return {
      remoteDeviceKeys: keys
    }
  },  
  template: `
      <div class="col-10 text-center">
        <h1>Binding Device</h1>
        <hr/>
        <div class="row mt-lg-1 justify-content-center" v-for="remote in remoteDeviceKeys">
          <div class="card card-default text-center">
            <div class="card-body">
              <h6 class="card-title"><small class="remote-key">{{ remote.key }}</small></h6>
              <div class="row mt-lg-1 justify-content-center">
                <div class="col-6">
                  <a type="button" class="btn btn-danger btn-block" onclick="onRemoveRemoteKey(this)">
                    <i class="material-icons">remove_circle</i>
                  </a>
                </div>
                <div class="col-6">
                  <a type="button" class="btn btn-success btn-block" onclick="onQRCodeRemoteKey(this)">
                    <i class="fas fa-qrcode"></i>
                  </a>
                </div>
              </div>
              <div class="row mt-lg-1 justify-content-center">
                <div class="qrcode-remote-key"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

  `
});




