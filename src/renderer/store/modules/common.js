/* eslint-disable space-before-function-paren */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

// settings.js
const state = {
  // baseUrl: 'http://192.168.14.192:8090',
  baseUrl: '/',
  timeout: 15000,
  nowLoading: false,
  showLayerPopup: false
}

const getters = {
  baseUrl: state => {
    return state.baseUrl
  },
  nowLoading: state => {
    return state.nowLoading
  },
  showLayerPopup: state => {
    return state.showLayerPopup
  }
}

const actions = {
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
