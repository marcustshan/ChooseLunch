/* eslint-disable space-before-function-paren */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

const state = {
  prod_baseUrl: 'http://192.168.14.192:8090',
  dev_baseUrl: '',
  timeout: 15000,
  nowLoading: false,
  showLayerPopup: false
}

const getters = {
  baseUrl: state => {
    return process.env.WEBPACK_DEV_SERVER ? state.dev_baseUrl : state.prod_baseUrl
  },
  nowLoading: state => {
    return state.nowLoading
  },
  showLayerPopup: state => {
    return state.showLayerPopup
  }
}

const actions = {
  setBaseUrl(context, value) {
    context.commit('setBaseUrl', value)
  },
  setNowLoading(context, value) {
    context.commit('setNowLoading', value)
  },
  setShowLayerPopup(context, value) {
    context.commit('setShowLayerPopup', value)
  }
}

const mutations = {
  setBaseUrl(state, baseUrl) {
    state.baseUrl = baseUrl
  },
  setNowLoading(state, isLoading) {
    state.nowLoading = isLoading
  },
  setShowLayerPopup(state, showLayerPopup) {
    state.showLayerPopup = showLayerPopup
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
