import vueMapSearch from './vue-map-search.vue'
const mapSearch = {
  install (Vue, options) {
    Vue.component(vueMapSearch.name, vueMapSearch)
  }
}
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(mapSearch)
}
export default mapSearch
