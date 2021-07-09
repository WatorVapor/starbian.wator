import {createApp} from 'https://cdn.jsdelivr.net/npm/vue@3.1.4/dist/vue.esm-browser.prod.js';
const graviton = new Graviton();
let gVMKeyImport = false;
let gVMToken = false;
let gVMKeyExport = false;

document.addEventListener('DOMContentLoaded', async (evt) => {
  const appImport = createApp({
    data() {
      return {
        graviton:{
          secret:'',
          secretQR:''
        }
      };
    }
  });
  gVMKeyImport = appImport.mount('#vue-ui-graviton-import');
  //console.log('DOMContentLoaded::gVMKeyImport=<',gVMKeyImport,'>');
  //console.log('DOMContentLoaded::gVMKeyImport.graviton=<',gVMKeyImport.graviton,'>');

  const appToken = createApp({
    data() {
      return {
        graviton:{
          id:graviton.address(),
          name:graviton.name()
        }
      };
    }
  });
  gVMToken = appToken.mount('#vue-ui-graviton-token');


 //console.log('DOMContentLoaded::QRCode=<',QRCode,'>');
 const qrcode = await new QRCode.toDataURL(graviton.secret());
 //console.log('DOMContentLoaded::qrcode=<',qrcode,'>');


  const appExport = createApp({
    data() {
      return {
        graviton:{
          secret:graviton.secret(),
          secretQR:qrcode
        }
      };
    }
  });
  gVMKeyExport = appExport.mount('#vue-ui-graviton-export'); 
});


window.onUIClickApplyGravitionTokenName = (elem) => {
  //console.log('onUIClickApplyGravitionTokenName::elem=<',elem,'>');
  const root = elem.parentElement.parentElement;
  //console.log('onUIClickApplyGravitionTokenName::root=<',root,'>');
  const valueElem = root.getElementsByTagName('input')[0];
  //console.log('onUIClickApplyGravitionTokenName::valueElem=<',valueElem,'>');
  const value = valueElem.value.trim();
  //console.log('onUIClickApplyGravitionTokenName::value=<',value,'>');
  if(value) {
    graviton.storeName(value);
  }
}

window.onUIChangeQRCodeSecretKey = (elem) => {
  //console.log('onUIChangeQRCodeSecretKey::elem=<',elem,'>');
  const root = elem.parentElement.parentElement;
  //console.log('onUIChangeQRCodeSecretKey::root=<',root,'>');
  const fileList = elem.files;
  //console.log('onUIChangeQRCodeSecretKey::fileList=<',fileList,'>');
  if(fileList.length > 0) {
    const file = fileList[0];
    //console.log('onUIChangeQRCodeSecretKey::file=<',file,'>');
    readQRCodeFromFile(file);
  }
}
const readQRCodeFromFile = (fileName) => {
  //console.log('readQRCodeFromFile::fileName=<',fileName,'>');
  const fileReader = new FileReader();
  fileReader.onload = () => {
    //console.log('readQRCodeFromFile::fileReader.result=<',fileReader.result,'>');
    gVMKeyImport.graviton.secretQR = fileReader.result;
  }
  fileReader.readAsDataURL( fileName );
}

window.onUIQRCodeLoaded = (img) => {
  //console.log('onUIQRCodeLoaded::img=<',img,'>');
  //console.log('onUIQRCodeLoaded::img.naturalWidth=<',img.naturalWidth,'>');
  //console.log('onUIQRCodeLoaded::img.naturalHeight=<',img.naturalHeight,'>');
  const cv = document.createElement('canvas');
  cv.width = img.naturalWidth;
  cv.height = img.naturalHeight;  
  const ct = cv.getContext('2d');
  ct.drawImage(img, 0, 0);
  const imageData = ct.getImageData(0, 0, cv.width, cv.height);
  //console.log('onUIQRCodeLoaded::imageData=<',imageData,'>');
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  //console.log('onUIQRCodeLoaded::code=<',code,'>');
  if(code) {
    gVMKeyImport.graviton.secret = code.data;
    const secretKey = code.data;
    if(graviton && secretKey) {
      const result = graviton.verifySecretKey(secretKey.trim());
      console.log('onUIQRCodeLoaded::result=<',result,'>');
    }
  }
}

/*
window.onUIClickVerifyGravitionSecret = (elem) => {
  console.log('onUIClickVerifyGravitionSecret::elem=<',elem,'>');
  const secretKey = gVMKeyImport.graviton.secret;
  console.log('onUIClickVerifyGravitionSecret::secretKey=<',secretKey,'>');
  if(graviton && secretKey) {
    graviton.verifySecretKey(secretKey.trim());
  }
}
*/

const constConfCamera = {
  video:{
    facingMode:'environment',
    width:{
      ideal:640
    },
    height:{
      ideal:480
    }
  },
  audio:false,
};

window.onUIClickScanSecretKey = async (elem) => {
  console.log('onUIClickScanSecretKey::elem=<',elem,'>');
  const stream = await navigator.mediaDevices.getUserMedia(constConfCamera);
  console.log('onUIClickScanSecretKey::stream=<',stream,'>');

  const video=document.createElement('video');
  video.setAttribute('autoplay','');
  video.setAttribute('muted','');
  video.setAttribute('playsinline','');
  video.srcObject = stream;
  video.onloadedmetadata = function(e){video.play();};
  const prev=document.getElementById('qrcode-preview');
  setTimeout(()=>{
    ScanQRCode(video,prev);
  },500);
}

const ScanQRCode = (video,preview) => {
  const w = video.videoWidth;
  const h = video.videoHeight;
  //console.log('ScanQRCode::w=<',w,'>');
  //console.log('ScanQRCode::h=<',h,'>'); 
  preview.style.width=(w/2)+"px";
  preview.style.height=(h/2)+"px";
  preview.setAttribute('width',w);
  preview.setAttribute('height',h);
  let m = 0;
  if(w>h){
    m = h*0.5;
  } else {
    m = w*0.5;
  }
  const x1 = (w-m)/2;
  const y1 = (h-m)/2;
  const prev_ctx = preview.getContext('2d');  
  prev_ctx.drawImage(video,0,0,w,h);
  prev_ctx.beginPath();
  prev_ctx.strokeStyle='rgb(255,0,0)';
  prev_ctx.lineWidth=2;
  prev_ctx.rect(x1,y1,m,m);
  prev_ctx.stroke();
  const tmp = document.createElement('canvas');
  const tmp_ctx = tmp.getContext('2d');
  tmp.setAttribute('width',m);
  tmp.setAttribute('height',m);
  tmp_ctx.drawImage(preview,x1,y1,m,m,0,0,m,m);
  const imageData = tmp_ctx.getImageData(0,0,m,m);
  const scanResult = jsQR(imageData.data,m,m);
  if(scanResult) {
    console.log('ScanQRCode::scanResult=<',scanResult,'>');
  } else {
    setTimeout(()=> {
      ScanQRCode(video,preview);
    },200);
  }
}

