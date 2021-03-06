import {createApp} from 'https://cdn.jsdelivr.net/npm/vue@3.1.4/dist/vue.esm-browser.prod.js';
//const RootPath = '/starbian';
const RootPath = '';


const navbarTemplate = 
`
  <div class="container">
    <a class="navbar-brand text-primary " v-bind:href="root + '/'" role="button">
      <i class="material-icons md-48">home</i>
    </a>
    <div class="collapse navbar-collapse d-flex justify-content-start">
      <ul class="navbar-nav">
        <li class="nav-item active border rounded-pill">
          <a class="nav-link text-primary vue-lang" v-bind:href="root + '/create_galaxy'" role="button">
            <i class="material-icons md-48">add</i> {% navbar.galaxy %}
          </a>
        </li>
      </ul>
    </div>
    <div class="collapse navbar-collapse d-flex justify-content-center">
      <ul class="navbar-nav">
      </ul>
    </div>
    <div class="collapse navbar-collapse d-flex justify-content-end">
      <ul class="navbar-nav">
        <li class="nav-item dropdown mr-5">
          <a class="nav-link dropdown-toggle text-info" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="material-icons md-48">language</i>
          </a>
          <ul class="dropdown-menu">
            <li class="nav-item">
              <a class="nav-link" onclick="onClickChangeLang('cn')"><span class="flag-icon flag-icon-background flag-icon-cn"></span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" onclick="onClickChangeLang('ja')"><span class="flag-icon flag-icon-background flag-icon-jp"></span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" onclick="onClickChangeLang('en')"><span class="flag-icon flag-icon-background flag-icon-us"></span></a>
            </li>
          </ul>
        </li>
        <li class="nav-item dropdown mr-5">
          <a class="nav-link text-success" v-bind:href="root + '/account'">
            <i class="material-icons md-48" >manage_accounts</i>
            {{ accout.name }}
          </a>
        </li>
      </ul>
    </div>
  </div>
`




document.addEventListener('DOMContentLoaded', async (evt) => {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  });
});

const graviton = new Graviton();
document.addEventListener('DOMContentLoaded', async (evt) => {
  //const topNaveBar = Vue.createApp({});
  const topNaveBar = createApp({});
  topNaveBar.component('w-navbar', {
    template: navbarTemplate,
    data: ()=>{
      return {
        root:RootPath,
        accout:{ 
          name:graviton.name()
        }
      };
    }    
  });
  //console.log('w-navbar::topNaveBar=<',topNaveBar,'>');
  topNaveBar.mount('#vue-navbar-top');
});


