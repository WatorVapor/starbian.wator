const appPrefix = '/starbian';
const loadFrameWorkJS = ()=> {
  const fileref = document.createElement('script');
  fileref.setAttribute('type','text/javascript');
  fileref.setAttribute('src', `${appPrefix}/asset/js/app.js`);
  document.getElementsByTagName('head')[0].appendChild(fileref);
}
loadFrameWorkJS();