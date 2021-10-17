const constKeyLanguangeCode = 'starbian/lang_code';
/*
window.addEventListener('load', (evt) => {
  createMultiLanguage_();
});
document.addEventListener('DOMContentLoaded', (evt) => {
  createMultiLanguage_();
});
*/
/*
document.addEventListener('AppScriptLoaded', (evt) => {
  //createMultiLanguage_();
});
*/

document.addEventListener('TopMenuBarLoaded', (evt) => {
  createMultiLanguage_();
});

const appLangList = [];
const createMultiLanguage_ = async () => {
  let lang = localStorage.getItem(constKeyLanguangeCode);
  if(!lang) {
    lang = 'cn';
  }
  //console.log('::location=<',location,'>');
  //console.log('::lang=<',lang,'>');
  const langURL = `${location.pathname}lang_${lang}.js`;
  //console.log('::langURL=<',langURL,'>');
  const langPromise = import(langURL);
  const langModule = await langPromise;
  //console.log('::langModule.data=<',langModule.data,'>');
  const langCommonURL = `${appPrefix}/layout/lang_${lang}.js`;
  //console.log('::langCommonURL=<',langCommonURL,'>');
  const langCommonPromise = import(langCommonURL);
  const langCommonModule = await langCommonPromise;
  //console.log('::langCommonModule.data=<',langCommonModule.data,'>');
  const allData = {...langModule.data, ...langCommonModule.data}
  //console.log('::allData=<',allData,'>');
  const langElem = document.querySelectorAll('.vue-lang');
  //console.log('createMultiLanguage_::langElem=<',langElem,'>');
  langElem.forEach((el, i) => {
    //console.log('createMultiLanguage_::el=<',el,'>');
    //console.log('createMultiLanguage_::allData=<',allData,'>');
    const app = Vue.createApp({
      data() {
        return allData;
      },
      delimiters:['{%', '%}']
    });
    const vm = app.mount(el);
    appLangList.push(vm);
  });  
}


window.onClickChangeLang = (lang)=> {
  console.log('onClickChangeLang::lang=<',lang,'>');
  localStorage.setItem(constKeyLanguangeCode,lang);
  location.reload(true);
};

