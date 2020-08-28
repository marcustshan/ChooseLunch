/* eslint-disable space-before-function-paren */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

const state = {
  prod_baseUrl: 'http://cl.byulsoft.com/api',
  dev_baseUrl: 'http://cl.byulsoft.com/api',
  timeout: 10000,
  nowLoading: false,
  showLayerPopup: false,
  menuShow: false
}

const getters = {
  baseUrl: state => {
    return process.env.WEBPACK_DEV_SERVER ? state.dev_baseUrl : state.prod_baseUrl
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
  },
  setMenuShow(context, value) {
    context.commit('setMenuShow', value)
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
  },
  setMenuShow(state, value) {
    state.menuShow = value
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
