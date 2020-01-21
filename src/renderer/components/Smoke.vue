<template>
  <div class="smoke_layer" v-if="showSmokePopup">
    <div class="close" @click="fnClosePopup"></div>
    <div class="smoke_reply">
      <button @click="fnReply('가시죠')">
        가시죠
      </button>
      <button @click="fnReply('잠시만요')">
        잠시만요
      </button>
      <button @click="fnReply('다녀오세요')">
        다녀오세요
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'smoke',
    props: [
      'showSmokePopup'
    ],
    computed: {
      user () {
        return this.$store.getters.userInfo
      }
    },
    methods: {
      fnClosePopup () {
        this.EventBus.emit('SMOKE_DIM_CLICK')
      },
      fnReply (msg) {
        this.$socket.emit('smokeAnswer', { id: this.user.id, name: this.user.name, msg: msg })
        this.fnClosePopup()
      }
    }
  }
</script>

<style scoped>
  div.smoke_layer {width: 500px; height: 200px; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; background-color: #fff; border: 1px solid #333; z-index: 999; border-radius: 5px;}
  div.smoke_reply {width: 100%; height: 100%; padding-top: 80px; text-align: center;}
  div.smoke_layer .close { position: absolute; right: 5px; top: 5px; width: 32px; height: 32px; opacity: 0.5; cursor: pointer; }
  div.smoke_layer .close:hover { opacity: 1; }
  div.smoke_layer .close:before, .close:after { position: absolute; left: 15px; content: ' '; height: 33px; width: 2px; background-color: #333; }
  div.smoke_layer .close:before { transform: rotate(45deg); }
  div.smoke_layer .close:after { transform: rotate(-45deg); }
</style>
