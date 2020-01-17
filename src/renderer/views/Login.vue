<template>
  <div class="wrapper">
    <div class="container">
      <div class="title">
        식사 하고 하시죠!
      </div>
      <div class="content">
        <img v-if="showImageIndex === 1" src="~@/assets/images/pengsoo/1.jpg" alt="pengsoo" />
        <img v-if="showImageIndex === 2" src="~@/assets/images/pengsoo/2.jpg" alt="pengsoo" />
        <img v-if="showImageIndex === 3" src="~@/assets/images/pengsoo/3.jpg" alt="pengsoo" />
        <img v-if="showImageIndex === 4" src="~@/assets/images/pengsoo/4.jpg" alt="pengsoo" />
        <img v-if="showImageIndex === 5" src="~@/assets/images/pengsoo/5.jpg" alt="pengsoo" />
        <img v-if="showImageIndex === 6" src="~@/assets/images/pengsoo/6.jpg" alt="pengsoo" />
        <img v-if="showImageIndex === 7" src="~@/assets/images/pengsoo/7.jpeg" alt="pengsoo" />
        <img v-if="showImageIndex === 8" src="~@/assets/images/pengsoo/8.png" alt="pengsoo" />
        <img v-if="showImageIndex === 9" src="~@/assets/images/pengsoo/9.jpeg" alt="pengsoo" />
        <img v-if="showImageIndex === 10" src="~@/assets/images/pengsoo/10.jpg" alt="pengsoo" />
      </div>
      <div class="bottom">
        <button @click="fnMoveToMain" v-if="isLogged">
          가시죠
        </button>
        <div v-else>
          <h3>서버가 안켜져 있어요.....</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'login',
    data () {
      return {
        showImageIndex: 0
      }
    },
    computed: {
      isLogged () {
        return this.$store.getters.userInfo && this.$store.getters.userInfo.id
      }
    },
    methods: {
      fnMoveToMain () {
        this.$router.push('/index')
      }
    },
    mounted () {
      this.showImageIndex = Math.floor(Math.random() * 10) + 1
    }
  }
</script>

<style>
  div.container {width: 600px; height: 500px; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto;}
  div.title {width: 300px; height: 40px; line-height: 40px; color:#313131; font-weight: 600; font-size: 20px; text-align: center; margin: auto;}
  div.content {text-align: center; padding-top: 20px;}
  div.content img {width: 100%; height: 100%; object-fit: contain;}
  div.bottom {margin-top: 30px; text-align: center;}
</style>
