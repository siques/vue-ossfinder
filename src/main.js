/* eslint-disable  */
import Vue from 'vue'
import App from './App'
import OssFinder from '../packages/index.js'

Vue.config.productionTip = false

Vue.use(OssFinder)

new Vue({
  render: (h) => h(App),
}).$mount('#app')
