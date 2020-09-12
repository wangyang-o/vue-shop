import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

import ZkTable from 'vue-table-with-tree-grid'
import axios from 'axios'
import NProgress from 'nprogress'
import VueQuillEditor from 'vue-quill-editor'
import './assets/shop_aside_icon/iconfont.js';
import './assets/shop_aside_icon/iconfont.css';
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// import 'nprogress/nprogress.css'

axios.defaults.baseURL = 'http://api.ojbk666.top/api/private/v1/';
// axios.defaults.baseURL = 'http://47.110.160.200:8888/api/private/v1/'; 
axios.interceptors.request.use(config => {
  NProgress.start();
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})
axios.interceptors.response.use(config => {
  NProgress.done();
  return config;
})
Vue.prototype.$http = axios;
Vue.filter('dataFormat', originVal => {
  const dt = new Date(originVal);
  const y = dt.getFullYear(dt);
  const m = (dt.getMonth() + 1 + '').padStart(2, '0');
  const d = (dt.getDate() + '').padStart(2, '0');
  const hh = (dt.getHours() + '').padStart(2, '0');
  const mm = (dt.getMinutes() + '').padStart(2, '0');
  const ss = (dt.getSeconds() + '').padStart(2, '0');
  return `${y}.${m}.${d}-${hh}:${mm}:${ss}`
})
Vue.config.productionTip = false;

Vue.use(VueQuillEditor);
// Vue.use(ElementUI);
Vue.use(ZkTable);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
