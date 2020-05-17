<template>
  <div class="wrapper">
    <div class="container">
      <div class="title">
        식사 하고 하시죠!
      </div>
      <div class="content">
        <input class="login_input" placeholder="ID" type="text" v-model="user.id" />
        <br />
        <input class="login_input" placeholder="Password" type="password" v-model="user.password" />
        <br />
        <br />
        <input class="checkbox" type="checkbox" v-model="remember" id="remember" />
        <label for="remember">로그인 유지</label>
      </div>
      <div class="bottom">
        <button @click="fnLogin">
          Login
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'login',
    data () {
      return {
        user: {
          id: '',
          password: ''
        },
        remember: false
      }
    },
    computed: {
      isLogged () {
        return this.$store.getters.userInfo && this.$store.getters.userInfo.id
      }
    },
    methods: {
      fnLogin () {
        this.$axios.post('/login', this.user).then((response) => {
          console.log(response)
          if (!response.data) {
            this.alert('로그인 정보를 확인해주세요.')
          } else {
            this.$store.dispatch('setUserInfo', response.data)
            if (this.remember) {
              this.setCookie('ChooseLunchJWT', response.data.token, 15)
            }
            this.$router.push('/lunch')
          }
        })
      },
      fnLoginByToken () {
        this.$axios.post('/loginByToken', {}).then((response) => {
          if (!response.data) {
            this.alert('로그인을 해주세요.')
          } else {
            this.$store.dispatch('setUserInfo', response.data)
            this.$router.push('/lunch')
          }
        })
      },
      fnCheckRemember () {
        const token = this.getCookie('ChooseLunchJWT')
        if (token && token.length > 0) {
          this.fnLoginByToken()
        }
      }
    },
    mounted () {
      this.fnCheckRemember()
    }
  }
</script>

<style>
  div.container {width: 500px; height: 300px; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; border: 1px solid #ccc; background-color: #fff;}
  div.title {width: 100%; height: 60px; line-height: 60px; color:#f1f1f1; font-weight: 600; font-size: 20px; text-align: center; margin: auto; background-color: #313131;}
  div.content {text-align: center; padding-top: 20px;}
  input.login_input {padding: 10px 10px; border: none; border-bottom: 1px #ccc solid;}
  div.bottom {margin-top: 30px; text-align: center;}
</style>
