<template>
  <div id="app">
    <Header />
    <router-view></router-view>
    <Loading />
    <Updater :showUpdatePopup="showUpdatePopup" :downloadedPercent="downloadedPercent" />
  </div>
</template>

<script>
  import Header from './components/Header.vue'
  import Loading from './components/Loading.vue'
  import Updater from './components/Updater.vue'

  const { ipcRenderer } = require('electron')

  export default {
    name: 'choose-lunch',
    components: {
      Header,
      Loading,
      Updater
    },
    data () {
      return {
        showUpdatePopup: false,
        downloadedPercent: 0,
        updating: false
      }
    },
    mounted () {
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
      ipcRenderer.on('smoke_request', () => {
        console.log('ㅋㅋㅋㅋㅋ 담배 피자구요')

        if (Notification.permission === 'granted') {
          let notification = new Notification('Hi there!')
          console.log(notification)
        }
      })

      ipcRenderer.send('check_update')
      setInterval(() => {
        if (this.updating) {
          return
        }
        this.updating = true
        ipcRenderer.send('check_update')
      }, 60000)
    }
  }
</script>


