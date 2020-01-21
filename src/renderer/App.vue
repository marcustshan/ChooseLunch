<template>
  <div id="app">
    <Header />
    <router-view></router-view>
    <Loading />
    <Updater :showUpdatePopup="showUpdatePopup" :downloadedPercent="downloadedPercent" />
    <Smoke :showSmokePopup="showSmokePopup" />
  </div>
</template>

<script>
  import Header from './components/Header.vue'
  import Loading from './components/Loading.vue'
  import Updater from './components/Updater.vue'
  import Smoke from './components/Smoke.vue'

  const { ipcRenderer } = require('electron')

  export default {
    name: 'choose-lunch',
    components: {
      Header,
      Loading,
      Updater,
      Smoke
    },
    computed: {
      user () {
        return this.$store.getters.userInfo
      }
    },
    data () {
      return {
        showUpdatePopup: false,
        downloadedPercent: 0,
        updating: false,
        showSmokePopup: false
      }
    },
    methods: {
      fnInitUpdateChecker () {
        ipcRenderer.on('checking_for_update', () => {
          this.updating = true
        })
        ipcRenderer.on('update_available', () => {
          this.updating = false
          this.showUpdatePopup = true
          this.$store.dispatch('setShowLayerPopup', true)
        })
        ipcRenderer.on('update_not_available', () => {
          this.updating = false
        })
        ipcRenderer.on('update_downloaded', () => {
          this.updating = false
          ipcRenderer.send('update_completed')
        })
        ipcRenderer.on('download_progress', (event, progressObject) => {
          this.updating = true
          this.downloadedPercent = JSON.parse(progressObject).percent
        })
        ipcRenderer.on('update_error', (error) => {
          this.updating = false
          this.alert('업데이트 중 오류가 발생했습니다.\n' + error.toString())
        })

        ipcRenderer.send('check_update')
        setInterval(() => {
          if (this.updating) {
            return
          }
          this.updating = true
          ipcRenderer.send('check_update')
        }, 60000)
      },
      fnInitSmokeRequest () {
        ipcRenderer.on('smoke_request', () => {
          if (!this.user.isSmoker) {
            return
          }
          this.$socket.emit('smoke', { id: this.user.id, name: this.user.name })
          this.fnShowNoti('잠시만 기다려주세요...', false)
        })

        this.$socket.on('smoke', (data) => {
          this.fnShowNoti(data.name + ' : 담배 피러 가실까요?', true)
          this.fnShowSmokeRequestPopup()
        })

        this.$socket.on('smokeAnswer', (data) => {
          this.fnShowNoti(data.name + ' : ' + data.msg, true)
        })
      },
      fnShowSmokeRequestPopup () {
        this.EventBus.on('SMOKE_DIM_CLICK', () => {
          this.$store.dispatch('setShowLayerPopup', false)
          this.showSmokePopup = false
        })
        this.EventBus.on('DIM_CLICK', () => {
          this.$store.dispatch('setShowLayerPopup', false)
          this.showSmokePopup = false
        })
        this.$store.dispatch('setShowLayerPopup', true)
        this.showSmokePopup = true
      },
      fnShowNoti (msg, flashIcon) {
        let notification
        if (Notification.permission !== 'denied') {
          Notification.requestPermission(function (permission) {
            if (permission !== 'granted') {
              return false
            }
          })
        }

        notification = new Notification(msg)

        let win = require('electron').remote.getCurrentWindow()
        if (flashIcon) {
          win.once('focus', () => win.flashFrame(false))
          win.flashFrame(true)
        }

        notification.onclick = () => {
          win.focus()
        }
      }
    },
    mounted () {
      this.fnInitUpdateChecker()
      this.fnInitSmokeRequest()
    }
  }
</script>


