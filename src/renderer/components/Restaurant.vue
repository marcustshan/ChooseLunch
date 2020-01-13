<template>
  <div class="layer">
    <div class="layer_header">
      <div class="close" @click="fnClosePopup"></div>
    </div>
    <div class="layer_body">

    </div>
  </div>
</template>

<script>
  export default {
    name: 'restaurant',
    methods: {
      fnClosePopup () {
        this.EventBus.emit('CLOSE_POPUP', {})
      }
    }
  }
</script>

<style scoped>
  div.layer {width: 500px; height: 500px; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; background-color: #fff; border: 1px solid #ccc; z-index: 999;}
  div.layer_header {width: 100%; height: 40px; background-color: #f1f1f1;}
  div.layer_body {width: 100%; height: 460px; max-height: 460px; overflow-y: auto; padding: 10px;}

  .close {
    position: absolute;
    right: 5px;
    top: 5px;
    width: 32px;
    height: 32px;
    opacity: 0.3;
    cursor: pointer;
  }
  .close:hover {
    opacity: 1;
  }
  .close:before, .close:after {
    position: absolute;
    left: 15px;
    content: ' ';
    height: 33px;
    width: 2px;
    background-color: #333;
  }
  .close:before {
    transform: rotate(45deg);
  }
  .close:after {
    transform: rotate(-45deg);
  }
</style>
