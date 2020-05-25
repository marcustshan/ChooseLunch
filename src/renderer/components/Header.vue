<template>
  <header>
    <div class="time_info">
      {{ nowDate }}
      <span :class="nowDay === '토' ? 'sat' : nowDay === '일' ? 'sun' : ''"> ({{ nowDay }}요일) </span>
      <span>{{ nowTime }}</span>
    </div>
    <div class="logo" @click="fnMoveToIndex">
      <img src="~@/assets/images/logo.png" alt="logo" />
    </div>
    <div class="user" v-if="user && user.name">
      {{ user.name }}
    </div>
    <div class="network_status" v-if="this.user && this.user.user_seq" :class="disconnected ? 'off' : 'on'" title="소켓 연결 상태"></div>
    <div v-if="isLogged" class="menu_container">
      <nav class="header__nav">
        <ul class="header__navbar">
          <li class="header__item">
            <a href="#" class="header__link">
              <transition name="slide-fade">
                <button class="header--button" v-if="!menuShow" key="off" @click="fnShowHideMenu(true)">
                  <svg viewBox="0 0 24 24" class="header--icon">
                    <title>Navigation Menu</title>
                    <path fill="currentColor" d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z" />
                  </svg>
                </button>
                <button class="header--button" v-else key="on" @click="fnShowHideMenu(false)">
                  <svg viewBox="0 0 24 24" class="header--icon">
                    <title>Close</title>
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path fill="currentColor" d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
                  </svg>
                </button>
              </transition>
            </a>
            <transition name="dropdown">
              <div class="dropdown__menu" v-bind:class="{ active: menuShow }" v-if="menuShow">
                <div class="app_version">Choose Lunch - v{{ appVersion }}</div>
                <hr>
                <ul class="dropdown__menu-nav">
                  <li class="dropdown__menu-item">
                    <a @click="fnLogout" href="#" class="dropdown__menu-link" title="Logout">
                      <div class="dropdown__menu-svg">
                        <svg viewBox="0 0 496 512">
                          <path fill="currentColor" d="m496 240.007812h-202.667969c-8.832031 0-16-7.167968-16-16 0-8.832031 7.167969-16 16-16h202.667969c8.832031 0 16 7.167969 16 16 0 8.832032-7.167969 16-16 16zm0 0"/><path d="m416 320.007812c-4.097656 0-8.191406-1.558593-11.308594-4.691406-6.25-6.253906-6.25-16.386718 0-22.636718l68.695313-68.691407-68.695313-68.695312c-6.25-6.25-6.25-16.382813 0-22.632813 6.253906-6.253906 16.386719-6.253906 22.636719 0l80 80c6.25 6.25 6.25 16.382813 0 22.632813l-80 80c-3.136719 3.15625-7.230469 4.714843-11.328125 4.714843zm0 0"/><path d="m170.667969 512.007812c-4.566407 0-8.898438-.640624-13.226563-1.984374l-128.386718-42.773438c-17.46875-6.101562-29.054688-22.378906-29.054688-40.574219v-384c0-23.53125 19.136719-42.6679685 42.667969-42.6679685 4.5625 0 8.894531.6406255 13.226562 1.9843755l128.382813 42.773437c17.472656 6.101563 29.054687 22.378906 29.054687 40.574219v384c0 23.53125-19.132812 42.667968-42.664062 42.667968zm-128-480c-5.867188 0-10.667969 4.800782-10.667969 10.667969v384c0 4.542969 3.050781 8.765625 7.402344 10.28125l127.785156 42.582031c.917969.296876 2.113281.46875 3.480469.46875 5.867187 0 10.664062-4.800781 10.664062-10.667968v-384c0-4.542969-3.050781-8.765625-7.402343-10.28125l-127.785157-42.582032c-.917969-.296874-2.113281-.46875-3.476562-.46875zm0 0"/><path d="m325.332031 170.675781c-8.832031 0-16-7.167969-16-16v-96c0-14.699219-11.964843-26.667969-26.664062-26.667969h-240c-8.832031 0-16-7.167968-16-16 0-8.832031 7.167969-15.9999995 16-15.9999995h240c32.363281 0 58.664062 26.3046875 58.664062 58.6679685v96c0 8.832031-7.167969 16-16 16zm0 0"/><path d="m282.667969 448.007812h-85.335938c-8.832031 0-16-7.167968-16-16 0-8.832031 7.167969-16 16-16h85.335938c14.699219 0 26.664062-11.96875 26.664062-26.667968v-96c0-8.832032 7.167969-16 16-16s16 7.167968 16 16v96c0 32.363281-26.300781 58.667968-58.664062 58.667968zm0 0"/>
                        </svg>
                      </div>
                      <div class="dropdown__menu-text">
                        Logout
                      </div>
                    </a>
                  </li>
                  <hr v-if="user.manager_yn === 'Y'">
                  <li v-if="user.manager_yn === 'Y'" class="dropdown__menu-item">
                    <a @click="fnShowRestaurantManager" href="#" class="dropdown__menu-link" title="Help">
                      <div class="dropdown__menu-svg">
                        <svg viewBox="0 0 128 128">
                          <g><path d="M23.437,4.75C13.133,4.75,4.75,15.769,4.75,29.313c0,10.675,5.2,20.038,12.8,23.324l-1.7,62.818a7.589,7.589,0,1,0,15.173,0l-1.7-62.817c7.6-3.286,12.8-12.649,12.8-23.324C42.125,15.769,33.742,4.75,23.437,4.75Zm3.546,45.038A1.75,1.75,0,0,0,25.791,51.5l1.735,64.054a4.09,4.09,0,1,1-8.177,0L21.084,51.5a1.75,1.75,0,0,0-1.192-1.707C13.037,47.49,8.25,39.07,8.25,29.313,8.25,17.7,15.063,8.25,23.437,8.25S38.625,17.7,38.625,29.313C38.625,39.07,33.838,47.49,26.983,49.788Z"/><path d="M68.327,4.816a4.686,4.686,0,0,0-5.275,3.157C58.064,22.589,51.982,46.65,51.33,78.278a1.751,1.751,0,0,0,.909,1.571l6.943,3.806-2.029,31.528a7.581,7.581,0,1,0,15.146.486V9.505A4.68,4.68,0,0,0,68.327,4.816ZM68.8,115.669a4.086,4.086,0,0,1-4.081,4.081,4.081,4.081,0,0,1-4.072-4.343l2.1-32.638a1.749,1.749,0,0,0-.905-1.647l-6.987-3.831c.753-30.656,6.659-53.97,11.51-68.187a1.25,1.25,0,0,1,2.435.4Z"/><path d="M121.5,4.75a1.749,1.749,0,0,0-1.75,1.75V35.19a15.159,15.159,0,0,1-11.5,14.732,1.749,1.749,0,0,0-1.325,1.746l1.73,63.88a4.093,4.093,0,1,1-8.182,0l1.73-63.88a1.749,1.749,0,0,0-1.325-1.746A15.16,15.16,0,0,1,89.37,35.19V6.5a1.75,1.75,0,0,0-3.5,0V35.19A18.653,18.653,0,0,0,98.664,52.923l-1.693,62.529a7.592,7.592,0,1,0,15.178,0l-1.693-62.529A18.653,18.653,0,0,0,123.25,35.19V6.5A1.749,1.749,0,0,0,121.5,4.75Z"/><path d="M96.09,35.917a1.749,1.749,0,0,0,1.75-1.75V6.5a1.75,1.75,0,0,0-3.5,0V34.167A1.749,1.749,0,0,0,96.09,35.917Z"/><path d="M104.559,35.917a1.75,1.75,0,0,0,1.75-1.75V6.5a1.75,1.75,0,0,0-3.5,0V34.167A1.749,1.749,0,0,0,104.559,35.917Z"/><path d="M113.028,35.917a1.749,1.749,0,0,0,1.75-1.75V6.5a1.75,1.75,0,0,0-3.5,0V34.167A1.75,1.75,0,0,0,113.028,35.917Z"/></g>
                        </svg>
                      </div>
                      <div class="dropdown__menu-text">식당 관리</div>
                    </a>
                  </li>
                </ul>
              </div>
            </transition>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
  export default {
    name: 'common-header',
    data () {
      return {
        nowDate: '',
        nowDay: '',
        nowTime: '',
        disconnected: false,
        appVersion: ''
      }
    },
    computed: {
      isLogged () {
        return this.$store.getters.isLogged
      },
      user () {
        return this.$store.state.user.userInfo
      },
      menuShow () {
        return this.$store.state.common.menuShow
      }
    },
    methods: {
      fnShowRestaurantManager () {
        this.alert('준비 중이어라')
      },
      fnShowHideMenu (show) {
        this.$store.dispatch('setMenuShow', show)
      },
      fnLogout () {
        if (this.$socket.disconnected) {
          this.alert('소켓이 연결되지 않았습니다. 네트워크 및 통신 상태를 확인해주세요.')
          return
        }
  
        this.$socket.emit('logout', this.user)
        this.$store.dispatch('setUserInfo', {})
        this.$store.dispatch('setMenuShow', false)
        localStorage.removeItem('ChooseLunchJWT')
        this.$router.push('/')
      },
      fnMoveToIndex () {
        this.$router.push('/')
      }
    },
    mounted () {
      this.$moment.lang('ko', {
        weekdays: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
        weekdaysShort: ['일', '월', '화', '수', '목', '금', '토']
      })
      this.nowDate = this.$moment().format('YYYY년 MM월 DD일')
      this.nowDay = this.$moment().format('ddd')
      this.nowTime = this.$moment().format('HH시 mm분')
      setInterval(() => {
        if (this.$socket.disconnected && !this.disconnected) {
          this.disconnected = true
        } else if (this.$socket.connected && this.disconnected) {
          require('electron').remote.getCurrentWindow().reload()
        }

        this.nowTime = this.$moment().format('HH시 mm분')
        let hour = this.$moment().format('HH')
        let minute = this.$moment().format('mm')
        if (hour === '00' && minute === '05') {
          require('electron').remote.getCurrentWindow().reload()
        }
      }, 3000)

      this.appVersion = window.require('electron').remote.app.getVersion()
    }
  }
</script>

<style scoped>
header {position: relative; width: 100%; height: 60px; background-color: #e0e0e0; border-bottom: 1px solid #c1c1c1; text-align: center;}
header div.logo {z-index: 5; position: absolute; width: 160px; height: 60px; cursor: pointer; margin-left: 10px;}
header div.logo img {width: 100%; height: 100%; object-fit: contain;}
header div.user {float: right; line-height: 60px; font-weight: 600; margin-right: 70px;}
header div.time_info {z-index: 3; position: absolute; width: 100%; height: 60px; line-height: 60px; font-weight: 600; font-size: 20px;}
header div.time_info .sat {color: #1162f8;}
header div.time_info .sun {color: #fa0a1e;}

div.network_status { position: absolute; top: 24px; right: 50px; width: 12px; height: 12px; background-color: #777; border-radius: 6px; }
div.network_status.on { background-color:#2ac700 }
div.network_status.off { background-color:#c22d10 }

div.menu_container { z-index: 4; position: absolute; top: 18px; right: 10px; }
.app_version { font-weight: 600; font-size: 1.1em; }
hr { border: 0; height: 0; margin: 10px 0; border-top: 1px solid #ccc; }
.header__nav { position: relative; }
.header__navbar { display: -webkit-box; display: flex; -webkit-box-align: center; align-items: center; -webkit-box-pack: end; justify-content: flex-end; }
.header--icon { width: 1.65rem; height: 1.65rem; }
.header--button { padding: 0; background-color: #e0e0e0; border: none; color: #6d6d6d; display: -webkit-box; display: flex; -webkit-box-align: center; align-items: center; -webkit-box-pack: end; justify-content: flex-end; }
.dropdown__menu { top: 100%; right: 0; position: absolute; z-index: 10; height: 25rem; min-width: 300px; margin-top: 20px; overflow-y: auto; padding: 15px; border-radius: 12px; background-color: white; border: 1px solid #ccc; background-clip: padding-box; }
.dropdown__menu-link { display: -webkit-box; display: flex; -webkit-box-align: center; align-items: center; -webkit-box-pack: start; justify-content: flex-start; text-decoration: none; color: rgba(0, 0, 0, 0.6); padding: 0.8rem 0 0.8rem 2rem; margin-top: 0.2rem; margin-bottom: 0.2rem; border-radius: 50px; }
.dropdown__menu-link:hover { color: #17bf63; background-color: rgba(79, 192, 141, 0.1); }
.dropdown__menu-svg { width: 1.5rem; height: 1.5rem; }
.dropdown__menu-text { font-weight: 600; margin-left: 1rem; margin-right: 1rem; color: #111; }
.slide-fade-enter-active, .slide-fade-leave-active { -webkit-transition: all 0s; transition: all 0s; }
.slide-fade-enter, .slide-fade-leave-active { opacity: 0; }
.slide-fade-enter { -webkit-transform: translateX(-60px); transform: translateX(-60px); }
.slide-fade-leave-active { -webkit-transform: translateX(60px); transform: translateX(60px); }
.dropdown-enter-active, .dropdown-leave-active { -webkit-transition: all 0.5s; transition: all 0.5s; }
.dropdown-enter, .dropdown-leave-to { opacity: 0; -webkit-transform: translateY(50px); transform: translateY(50px); }
</style>
