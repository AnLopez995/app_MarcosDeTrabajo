import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import Toasted from 'vue-toasted'
import moment from 'moment'
Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
var self = Vue.prototype
self.moment = moment

var optionsToasted = {
  keepOnHover: true
}
Vue.use(Toasted, optionsToasted)