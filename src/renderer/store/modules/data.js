/* eslint-disable space-before-function-paren */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

const state = {
  restaurants: [],
  todayChoices: []
}

const getters = {
  restaurants: state => {
    return state.restaurants
  },
  todayChoices: state => {
    return state.todayChoices
  }
}

const actions = {
  setRestaurants(context, value) {
    context.commit('setRestaurants', value)
  },
  setTodayChoices(context, value) {
    context.commit('setTodayChoices', value)
  }
}

const mutations = {
  setRestaurants(state, restaurants) {
    state.restaurants = restaurants
  },
  setTodayChoices(state, choices) {
    state.todayChoices = choices
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
