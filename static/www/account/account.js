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
  }
}


window.onUIClickVerifyGravitionSecret = (elem) => {
  console.log('onUIClickVerifyGravitionSecret::elem=<',elem,'>');
  const secretKey = gVMKeyImport.graviton.secret;
  console.log('onUIClickVerifyGravitionSecret::secretKey=<',secretKey,'>');
  if(graviton && secretKey) {
    graviton.verifySecretKey(secretKey.trim());
  }
}

window.onUIClickScanSecretKey = async (elem) => {
  console.log('onUIClickScanSecretKey::elem=<',elem,'>');
  const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
  console.log('onUIClickScanSecretKey::stream=<',stream,'>');
}

