import Vue from 'vue'
import App from './App.vue'
import vueMapSearch from './lib/index.js'
Vue.use(vueMapSearch)

new Vue({
  el: '#app',
  render: h => h(App)
})
