import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Button, carousel } from 'ant-design-vue'
// import { Button } from 'element-ui'
Vue.config.productionTip = false
Vue.use(Button)
Vue.use(carousel)
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
Vue.use(Vuetify)
// vuetify 自定义配置
export default new Vuetify({})
// Vue.use(ElementUI)
new Vue({
  router,
  store,
  vuetify: new Vuetify(),
  render: h => h(App)
}).$mount('#app')
