const graviton = new Graviton();
document.addEventListener('DOMContentLoaded', async (evt) => {

  const appImport = Vue.createApp({
    data() {
      return {
        graviton:{
          secret:''
        }
      };
    }
  });
  appImport.mount('#vue-ui-graviton-import');


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
  appToken.mount('#vue-ui-graviton-token');


 console.log('DOMContentLoaded::QRCode=<',QRCode,'>');
 const qrcode = await new QRCode.toDataURL(graviton.secret());
 console.log('DOMContentLoaded::qrcode=<',qrcode,'>');


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
  appExport.mount('#vue-ui-graviton-export');


 
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