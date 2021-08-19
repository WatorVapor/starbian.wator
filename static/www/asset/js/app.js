const appConf = {
  title:'StarBian',
  script_ready:false,
};
const loadHeaderOfApp = ()=> {
  console.log('loadHeaderOfCommon:=<',appConf,'>');
  {
    const fileref = document.createElement('meta');
    fileref.setAttribute('charset', 'utf-8');
    document.getElementsByTagName('head')[0].appendChild(fileref);
  }
  {
    const fileref = document.createElement('meta');
    fileref.setAttribute('http-equiv', 'X-UA-Compatible');
    fileref.setAttribute('content', 'IE=edge');
    document.getElementsByTagName('head')[0].appendChild(fileref);
  }
  {
    const fileref = document.createElement('meta');
    fileref.setAttribute('name', 'viewport');
    fileref.setAttribute('content', 'width=device-width,initial-scale=0.35, maximum-scale=0.35,minimum-scale=0.35');
    document.getElementsByTagName('head')[0].appendChild(fileref);
  }
  {
    const fileref = document.createElement('title');
    fileref.text = appConf.title;
    document.getElementsByTagName('head')[0].appendChild(fileref);
  }
  {
    const fileref = document.createElement('link');
    fileref.setAttribute('rel', 'stylesheet');
    fileref.setAttribute('type', 'text/css');
    fileref.setAttribute('href', 'https://fonts.googleapis.com/css?family=Raleway:100,600');
    document.getElementsByTagName('head')[0].appendChild(fileref);
  }
  {
    const fileref = document.createElement('link');
    fileref.setAttribute('rel', 'stylesheet');
    fileref.setAttribute('type', 'text/css');
    fileref.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons');
    document.getElementsByTagName('head')[0].appendChild(fileref);
  }
  {
    const fileref = document.createElement('link');
    fileref.setAttribute('rel', 'stylesheet');
    fileref.setAttribute('type', 'text/css');
    fileref.setAttribute('crossorigin', 'anonymous');
    fileref.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css');
    fileref.setAttribute('integrity', 'sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x');
    document.getElementsByTagName('head')[0].appendChild(fileref);
  }
  {
    const fileref = document.createElement('link');
    fileref.setAttribute('rel', 'stylesheet');
    fileref.setAttribute('type', 'text/css');
    fileref.setAttribute('crossorigin', 'anonymous');
    fileref.setAttribute('href', 'https://cdn.jsdelivr.net/npm/flag-icon-css@3.5.0/css/flag-icon.min.css');
    fileref.setAttribute('integrity', 'sha256-0n6YDYIexWJmHyTKtRRHTXvoanQrXpFfpsfv0h53qvk=');
    document.getElementsByTagName('head')[0].appendChild(fileref);
  }
  {
    const fileref = document.createElement('link');
    fileref.setAttribute('rel', 'stylesheet');
    fileref.setAttribute('type', 'text/css');
    fileref.setAttribute('crossorigin', 'anonymous');
    fileref.setAttribute('href', 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.3/css/all.min.css');
    fileref.setAttribute('integrity', 'sha256-2H3fkXt6FEmrReK448mDVGKb3WW2ZZw35gI7vqHOE4Y=');
    document.getElementsByTagName('head')[0].appendChild(fileref);
  }
}

window.frameworkScriptLoadCountUp = 0;
window.frameworkScriptLoadCountUpDown = 0;
const loadScriptOfApp = () => {
  {
    const fileref = document.createElement('script');
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js');
    fileref.setAttribute('integrity', 'sha384-gtEjrD/SeCtmISkJkNUaaKMoLD0//ElJ19smozuHV6z3Iehds+3Ulb9Bn9Plx0x4');
    fileref.setAttribute('crossorigin', 'anonymous');
    document.getElementsByTagName('body')[0].appendChild(fileref);
    window.frameworkScriptLoadCountUp++;
    fileref.onload = () => {onFrameworkScriptLoaded();};
  }
  {
    const fileref = document.createElement('script');
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', 'https://cdn.jsdelivr.net/npm/tweetnacl@1.0.3/nacl-fast.min.js');
    fileref.setAttribute('integrity', 'sha256-PsU1wASu6yJXhdjpP7M7+Z9S45m9ffwBlptWKbrqUTE=');
    fileref.setAttribute('crossorigin', 'anonymous');
    document.getElementsByTagName('body')[0].appendChild(fileref);
    window.frameworkScriptLoadCountUp++;
    fileref.onload = () => {onFrameworkScriptLoaded();};
  }
  {
    const fileref = document.createElement('script');
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', 'https://cdn.jsdelivr.net/npm/tweetnacl-util@0.15.1/nacl-util.min.js');
    fileref.setAttribute('integrity', 'sha256-l9yVE3YPWsTD48cjI2ABjQo466SAR0oLKj1VzQOlZ1U=');
    fileref.setAttribute('crossorigin', 'anonymous');
    document.getElementsByTagName('body')[0].appendChild(fileref);
    window.frameworkScriptLoadCountUp++;
    fileref.onload = () => {onFrameworkScriptLoaded();};
  }
  {
    const fileref = document.createElement('script');
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', 'https://cdn.jsdelivr.net/npm/base-58@0.0.1/Base58.js');
    fileref.setAttribute('integrity', 'sha256-d34IQcl2k8MvM/V8g3tBbuqy1cUoJ+G+H4dcDFVisnY=');
    fileref.setAttribute('crossorigin', 'anonymous');
    document.getElementsByTagName('body')[0].appendChild(fileref);
    window.frameworkScriptLoadCountUp++;
    fileref.onload = () => {onFrameworkScriptLoaded();};
  }
  {
    const fileref = document.createElement('script');
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', 'https://cdn.jsdelivr.net/npm/crypto-js@4.0.0/crypto-js.js');
    fileref.setAttribute('integrity', 'sha256-u605MhHOcevkqVw8DJ2q3X7kZTVTVXot4PjxIucLiMM=');
    fileref.setAttribute('crossorigin', 'anonymous');
    document.getElementsByTagName('body')[0].appendChild(fileref);
    window.frameworkScriptLoadCountUp++;
    fileref.onload = () => {onFrameworkScriptLoaded();};
  }
  
  {
    const fileref = document.createElement('script');
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', 'https://cdn.jsdelivr.net/npm/vue@3.2.4/dist/vue.global.prod.js');
    fileref.setAttribute('integrity', 'sha256-4RFDLmU+/77wdcK/iZZAeWjE617JJ2tn6nVUf3QS5Bg=');
    fileref.setAttribute('crossorigin', 'anonymous');
    document.getElementsByTagName('body')[0].appendChild(fileref);
    window.frameworkScriptLoadCountUp++;
    fileref.onload = () => {onFrameworkScriptLoaded();};
  }  
  
  {
    const fileref = document.createElement('script');
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', `${appPrefix}/asset/js/ga.js`);
    document.getElementsByTagName('body')[0].appendChild(fileref);
    window.frameworkScriptLoadCountUp++;
    fileref.onload = () => {onFrameworkScriptLoaded();};
  }
  {
    const fileref = document.createElement('script');
    fileref.setAttribute('type', 'module');
    fileref.setAttribute('src', `${appPrefix}/asset/js/lang.js`);
    document.getElementsByTagName('body')[0].appendChild(fileref);
    window.frameworkScriptLoadCountUp++;
    fileref.onload = () => {onFrameworkScriptLoaded();};
  }
  {
    const fileref = document.createElement('script');
    fileref.setAttribute('type', 'module');
    fileref.setAttribute('src', `${appPrefix}/layout/navbar.js`);
    document.getElementsByTagName('body')[0].appendChild(fileref);
    window.frameworkScriptLoadCountUp++;
    fileref.onload = () => {onFrameworkScriptLoaded();};
  }
}

const onFrameworkScriptLoaded = ()=> {
  //console.log('onFrameworkScriptLoaded::window.frameworkScriptLoadCountUp=<',window.frameworkScriptLoadCountUp,'>');
  window.frameworkScriptLoadCountUpDown++;
  //console.log('onFrameworkScriptLoaded::window.frameworkScriptLoadCountUpDown=<',window.frameworkScriptLoadCountUpDown,'>');
  if(window.frameworkScriptLoadCountUpDown === window.frameworkScriptLoadCountUp) {
    appConf.script_ready = true;
    const evt = document.createEvent('Event');
    evt.initEvent('AppScriptLoaded', true, true);
    document.dispatchEvent(evt);
  }
}

loadHeaderOfApp();
loadScriptOfApp();

