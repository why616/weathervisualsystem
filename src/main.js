import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/reset.css'
import './assets/css/el_notify.css'
import axios from 'axios'
Vue.config.productionTip = false
//axios
axios.defaults.baseURL = "http://localhost:8081";
Vue.prototype.$axios = axios;

//bus
Vue.prototype.$bus = new Vue();

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
