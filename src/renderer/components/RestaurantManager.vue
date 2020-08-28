<template>
  <div class="layer">
    <div class="layer_header">
      <div class="layer_title">
        식당 관리
      </div>
      <div class="close" @click="fnClosePopup"></div>
    </div>
    <div class="layer_body">
    </div>
  </div>
</template>

<script>
  export default {
    name: 'restaurant',
    data () {
      return {
        flattenRestaurnts: [],
        restaurants: []
      }
    },
    methods: {
      fnClosePopup () {
        this.EventBus.emit('RESTAURANT_MANAGER_CLOSE_POPUP', {})
      },
      fnGetRestaurants () {
        this.$axios.get('/getRestaurants', {}).then((response) => {
          this.flattenRestaurnts = response.data
          this.flattenRestaurnts.forEach((restaurant) => {
            restaurant.showTooltip = false
          })
          this.restaurants = this._.groupBy(response.data, 'category_name')
        })
      }
    },
    mounted () {
  
    }
  }
</script>

<style scoped>
  div.layer {width: 90%; height: 90%; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; background-color: #fff; border: 1px solid #777; z-index: 999;}
  div.layer_header {width: 100%; height: 50px; background-color: #f1f1f1; border-bottom: 1px solid #777;}
  div.layer_title {line-height: 50px; font-weight: 600; color: #111; font-size: 22px; text-indent: 20px;}
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
