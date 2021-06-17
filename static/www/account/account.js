const graviton = new Graviton();
//let gAppImport = false;
let gVMKeyImport = false;
let gVMToken = false;
let gVMKeyExport = false;

document.addEventListener('DOMContentLoaded', async (evt) => {
  const appImport = Vue.createApp({
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

  const appToken = Vue.createApp({
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


  const appExport = Vue.createApp({
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


const onUIClickApplyGravitionTokenName = (elem) => {
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

const onUIChangeQRCodeSecretKey = (elem) => {
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

const onUIQRCodeLoaded = (img) => {
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


const onUIClickVerifyGravitionSecret = (elem) => {
  console.log('onUIClickVerifyGravitionSecret::elem=<',elem,'>');
  const secretKey = gVMKeyImport.graviton.secret;
  console.log('onUIClickVerifyGravitionSecret::secretKey=<',secretKey,'>');
  if(graviton && secretKey) {
    graviton.verifySecretKey(secretKey.trim());
  }
}