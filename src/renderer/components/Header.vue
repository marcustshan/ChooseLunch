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
    <div class="network_status" :class="disconnected ? 'off' : 'on'" title="소켓 연결 상태"></div>
    <div class="app_version">v{{ appVersion }}</div>
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
      user () {
        return this.$store.getters.userInfo
      }
    },
    methods: {
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
header div.user {float: right; line-height: 60px; font-weight: 600; margin-right: 100px;}
header div.time_info {z-index: 3; position: absolute; width: 100%; height: 60px; line-height: 60px; font-weight: 600; font-size: 20px;}
header div.time_info .sat {color: #1162f8;}
header div.time_info .sun {color: #fa0a1e;}

div.network_status { position: absolute; top: 24px; right: 80px; width: 12px; height: 12px; background-color: #777; border-radius: 6px; }
div.app_version { position: absolute; top: 0; right: 40px; width: 12px; line-height: 60px; height: 60px; }

div.network_status.on { background-color:#2ac700 }
div.network_status.off { background-color:#c22d10 }
</style>
