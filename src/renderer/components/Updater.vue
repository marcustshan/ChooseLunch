<template>
  <div class="updater_layer" v-if="showUpdatePopup">
    <div class="updater_message">
      <p>업데이트가 진행됩니다.</p>
      <p>다운로드 완료 후 자동으로 재실행이 됩니다.</p>
    </div>
    <div class="progress">
      <div id="progressBar" class="progress_bar">
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'updater',
    props: [
      'showUpdatePopup',
      'downloadedPercent'
    ],
    watch: {
      downloadedPercent (newValue, oldValue) {
        document.getElementById('progressBar').style.width = newValue + '%'
      }
    }
  }
</script>

<style scoped>
  div.updater_layer {width: 500px; height: 200px; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; background-color: #fff; border: 1px solid #333; z-index: 999; border-radius: 15px;}
  div.updater_message {margin-top: 45px; text-align: center; font-weight: 600;}
  div.progress {width: 80%; height: 30px; border: 1px solid #333; border-radius: 15px; margin: 20px auto 0;}
  div.progress_bar {width: 0; height: 28px; background-color: #e68888; border-radius: 14px;}
</style>
