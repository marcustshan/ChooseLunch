import Vue from 'vue'
import Router from 'vue-router'
// eslint-disable-next-line no-unused-vars
import store from '../store'

Vue.use(Router)

const VueRouter = new Router({
  routes: [
    {
      path: '/index',
      name: 'index',
      component: require('@/views/Index').default
    },
    {
      path: '/lunch',
      name: 'lunch',
      component: require('@/views/Lunch').default
    },
    {
      path: '*',
      redirect: '/index'
    }
  ]
})

VueRouter.beforeEach((to, from, next) => {
  /*
  if (to.name.indexOf('index') < 0 && !store.getters.isLogged) {
    next({ path: '/index' })
    return
  }

  if (to.path.indexOf('/lunch') > -1) {
    next()
    return
  }
  */

  next()
})

export default VueRouter
