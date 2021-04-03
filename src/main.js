import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/reset.css'
import axios from 'axios'
Vue.config.productionTip = false
axios.defaults.baseURL = "http://localhost:8081";
Vue.prototype.$axios = axios;
// import {Select} from 'element-ui'
// Vue.use(Select);
// Vue.use(ElementUI);


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
