/* eslint-disable  */
import OssFinder from './OssFinder'

if (typeof window !== 'undefined' && 'Vue' in window) {
  window.Vue.component('OssFinder', OssFinder)
}

export default OssFinder
