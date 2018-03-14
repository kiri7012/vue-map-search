<template>
  <div id="app">
    <vueMapSearch :x="110" :y="32" :xyChange="whenChange"></vueMapSearch>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods: {
    whenChange (item) {
      console.log(item)
    }
  }
}
</script>

<style>
html,body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
#app {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
