import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import moment from 'vue-moment'
import VueLodash from 'vue-lodash'
import io from 'socket.io-client'
import VTooltip from 'v-tooltip'

Vue.use(require('vue-moment'))
const options = { name: 'lodash' }
Vue.use(VueLodash, options)
Vue.use(VTooltip)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

require('./assets/css/reset.css')
require('./assets/css/common.css')

Vue.prototype.$socket = io('http://192.168.14.192:3001')

// EventBus 설정
Vue.prototype.EventBus = new Vue(
  {
    methods: {
      on (name, listener) {
        this.$off(name).$on(name, listener)
      },
      emit (name, ...param) {
        this.$emit(name, ...param)
      },
      off (name) {
        this.$off(name)
      }
    }
  }
)

const service = axios.create({
  baseURL: store.getters.baseUrl, // api의 base_url
  headers: {
    Accept: 'application/json',
    'Content-type': 'application/json;charset=utf-8'
  },
  timeout: store.getters.timeout // 요청 제한 시간 (10초)
})

// 요청(request) 인터셉터
service.interceptors.request.use(
  (config) => {
    if (config.url.indexOf('banapresso.com') > -1) {
      config.baseURL = ''
    } else if (config.url.indexOf('upload') > -1) {
      config.headers['Content-type'] = 'multipart/form-data'
    } else if (config.url.indexOf('jandi.com') > -1) {
      config.baseURL = ''
      config.headers['Accept'] = 'application/vnd.tosslab.jandi-v2+json'
      config.headers['Content-type'] = 'application/json'
    }
    store.dispatch('setNowLoading', true)
    return config
  },
  (error) => {
    store.dispatch('setNowLoading', true)
    Promise.reject(error)
  }
)

// 응답(response) 인터셉터
service.interceptors.response.use(
  (response) => {
    store.dispatch('setNowLoading', false)
    return Promise.resolve(response)
  },
  (error) => {
    store.dispatch('setNowLoading', false)
    alert(error.message, 'Choose Lunch')
    return Promise.reject(error)
  }
)
Vue.prototype.$axios = service

Vue.prototype.alert = (msg) => {
  alert(msg, 'Choose Lunch')
}
Vue.prototype.deepCopy = (target) => {
  return JSON.parse(JSON.stringify(target))
}

service.get('/getUser', {}).then((response) => {
  store.dispatch('setUserInfo', response.data)
}).finally(() => {
  /* eslint-disable no-new */
  window.rootVm = new Vue({
    components: { App },
    router,
    store,
    moment,
    template: '<App/>'
  }).$mount('#app')
})
