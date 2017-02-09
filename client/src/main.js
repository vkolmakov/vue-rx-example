import Vue from 'vue'
import App from './App.vue'
import VueRx from 'vue-rx'
import Rx from 'rxjs/Rx'

Vue.use(VueRx, Rx)

new Vue({
  el: '#app',
  render: h => h(App)
})
