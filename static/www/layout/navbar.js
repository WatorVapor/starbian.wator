//const RootPath = '/starbian';
const RootPath = '';

const navbarTemplate = 
`
  <div class="container-fluid">    
    
    <ul class="navbar-nav nav justify-content-start">
      <li class="nav-item">
        <a class="nav-link text-primary nav-btn" v-bind:href="root + '/'" role="button">
          <i class="material-icons md-48">home</i>
        </a>
      </li>
      <li class="nav-item active">
        <a class="nav-link text-primary vue-lang" v-bind:href="root + '/galaxy'" role="button">
          {% navbar.galaxy %}
        </a>
      </li>
    </ul>
    
    <ul class="navbar-nav nav justify-content-end">
      <li class="nav-item dropdown mr-5">
        <a class="nav-link dropdown-toggle btn-lg" href="#" id="navbarDropdownLang" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="material-icons md-48">language</i>
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdownLang">
          <div class="row ml-2">
            <div class="col">
              <a class="" onclick="onClickChangeLang('cn')"><span class="flag-icon flag-icon-background flag-icon-cn"></span></a>
            </div>
            <div class="col">
              <a class="" onclick="onClickChangeLang('ja')"><span class="flag-icon flag-icon-background flag-icon-jp"></span></a>
            </div>
          </div> 
          <div class="row ml-2 mt-2">
            <div class="col">
              <a class="" onclick="onClickChangeLang('en')"><span class="flag-icon flag-icon-background flag-icon-us"></span></a>
            </div>
            <div class="col">
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
`




document.addEventListener('DOMContentLoaded', async (evt) => {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  });
});

document.addEventListener('DOMContentLoaded', async (evt) => {
  const topNaveBar = Vue.createApp({});
  topNaveBar.component('w-navbar', {
    template: navbarTemplate,
    data: ()=>{
      return {
        root:RootPath
      };
    }    
  });
  console.log('w-navbar::topNaveBar=<',topNaveBar,'>');
  topNaveBar.mount('#vue-navbar-top');
});


