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
      path: '/login',
      name: 'login',
      component: require('@/views/Login').default
    },
    {
      path: '*',
      redirect: '/login'
    }
  ]
})

VueRouter.beforeEach((to, from, next) => {
  /*
  if (to.name.indexOf('login') < 0 && !store.getters.isLogged) {
    next({ path: '/login' })
    return
  }

  if (to.path.indexOf('/index') > -1) {
    next()
    return
  }
  */

  next()
})

export default VueRouter
