<template>
  <div class="wrapper" @click="fnHideMenu">
    <coffee v-if="showCoffee"></coffee>
    <div class="restaurants">
      <!--
      <div class="choices_container" @mouseenter="showChoices = true" @mouseleave="showChoices = false">
        <div class="choices">
          한 눈에 보기
        </div>
        <div class="choice_list" v-show="showChoices">
          <ul>
            <li v-for="(choice, index) in todayChoices" v-bind:key="index">
              {{ choice.name }} : 
            </li>
          </ul>
        </div>
      </div>
      -->
      <button class="btn_coffee" @click="fnShowCoffee">
        커피
      </button>
      <div class="users_container">
        <div class="users_title">
          접속자 : 
        </div>
        <div class="users" @mouseenter="showUserList = true" @mouseleave="showUserList = false">
          {{ _.countBy(users, (user) => {return user.connected}).true }}
        </div>
        <div class="user_list" v-show="showUserList">
          <ul>
            <li v-for="user in users" v-bind:key="user.user_seq">
              <div class="network_status" :class="user.connected ? 'on' : 'off'"></div>
              {{ user.name }}
              <span v-if="_.filter(todayChoices, (choice) => { return user.user_seq === choice.user_seq }).length > 0">
                : {{ fnGetRestaurantsName(user.user_seq) }}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div class="latest" v-if="latestChoices && latestChoices.length > 0">
        <ul>
          <li class="latest_item" v-for="(choice, index) in latestChoices" v-bind:key="index">
            <span class="latest_title">
              {{ choice.diffDaysString }} : 
            </span>
            <span class="latest_restaurant">
              {{ choice.restaurantName }}
            </span>
          </li>
        </ul>
      </div>
      <ul class="restaurant_card_list">
        <li class="restaurant_card" v-for="(value, name) in restaurants" v-bind:key="name">
          <div class="category">
            {{ name }}
            <div class="users" style="cursor: default;">
              {{ fnGetUserCount(name, 'C') }}
            </div>
          </div>
          <ul class="restaurant_list">
            <li class="restaurant" v-for="restaurant in value" v-bind:key="restaurant.restaurant_seq">
              <span class="bold">{{ restaurant.name }}</span>
              <p class="loc" v-if="restaurant.location && restaurant.location.length > 0">
                위치 : {{ restaurant.location }}
              </p>
              <p class="desc" v-if="restaurant.description && restaurant.description.length > 0">
                특징 : <span class="desc_content">{{ restaurant.description }}</span>
              </p>
              <p class="url" @click.prevent="fnShowBuffet(restaurant.instagram_id)" v-if="restaurant.instagram_url && restaurant.instagram_url.length > 0">
                메뉴확인 >
              </p>
              <div class="users" v-tooltip="{ content: fnGetChosenUsers(restaurant.restaurant_seq), placement: 'left'}">
                {{ fnGetUserCount(restaurant.restaurant_seq, 'R') }}
              </div>
              <div class="choose">
                <button v-if="myChoice && myChoice.restaurant_seq === restaurant.restaurant_seq" class="cancel" @click="fnChoose(restaurant.restaurant_seq, false)">
                  취소
                </button>
                <button v-else-if="!myChoice" class="choose" @click="fnChoose(restaurant.restaurant_seq, true)">
                  선택
                </button>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="chat_container" id="chatContainer">
      <div id="chatContent" class="chat_content">
        <div v-show="dragging" class="dragging_dim"></div>
        <ul>
          <li class="chat_item" v-for="(message, index) in messages" v-bind:key="index">
            <div class="chat_line" :class="message.own ? 'own' : 'another'">
              <div class="name" v-if="!message.own">
                {{ message.name }}
              </div>
              <div class="message" :class="message.isImage ? 'imageMessage' : ''">
                <img @click="fnShowImage(message.fileName)" v-if="message.isImage" :src="`${baseUrl}/image/${message.fileName}`" />
                <div v-else v-html="message.chat"></div>
                <div class="time">
                  {{ $moment(message.chat_time, 'YYYYMMDDHHmmss').format('HH:mm:ss') }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="chat_input_container">
        <input @paste="fnPaste" class="chat_input" type="text" v-model="sendMessage" @keyup.enter="fnSendMessage" placeholder="Enter 키로 전송" />
      </div>
    </div>

    <div id="layer" class="layer" v-show="showPopup">
      <div class="close" @click="fnClosePopup"></div>
      <div class="layer_body">
        <img :src="imageUrl" />
      </div>
    </div>
  </div>
</template>

<script>
  import Coffee from '../components/Coffee'

  export default {
    name: 'index',
    components: {
      Coffee
    },
    data () {
      return {
        showCoffee: false,
        showChoices: false,
        users: [],
        showUserList: false,
        scraper: {},
        imageUrl: '',
        imageUrlMap: {},
        flattenRestaurnts: [],
        restaurants: {},
        selectedRestaurant: {},
        latestChoices: [],
        todayChoices: [],
        sendMessage: '',
        messages: [],
        showPopup: false,
        showTooltip: false,
        dragging: false,
        draggingCount: 0
      }
    },
    computed: {
      baseUrl () {
        return this.$store.getters.baseUrl
      },
      user () {
        return this.$store.state.user.userInfo
      },
      myChoice () {
        return this._.find(this.todayChoices, (choice) => { return choice.user_seq === this.user.user_seq })
      }
    },
    methods: {
      fnHideMenu () {
        this.$store.dispatch('setMenuShow', false)
      },
      fnGetRestaurantsName (userSeq) {
        const foundChoice = this._.find(this.todayChoices, (choice) => { return userSeq === choice.user_seq })
        if (foundChoice && foundChoice.restaurant_seq) {
          return this._.find(this.flattenRestaurnts, (restaurant) => { return restaurant.restaurant_seq === foundChoice.restaurant_seq }).name
        } else {
          return ''
        }
      },
      fnShowCoffee () {
        this.EventBus.on('DIM_CLICK', () => {
          this.$store.dispatch('setShowLayerPopup', false)
          this.showCoffee = false
          this.EventBus.off('DIM_CLICK')
        })
        this.$store.dispatch('setShowLayerPopup', true)
        this.showCoffee = true
      },
      fnGetUsers () {
        this.$axios.get('/getUsers', {}).then((response) => {
          this.users = []
          this.users.push(...response.data)
        })
      },
      fnInitDropEvent () {
        let holder = document.getElementById('chatContent')
        holder.ondragover = (e) => {
          this.draggingCount++
          this.dragging = true
          return false
        }
        holder.ondragleave = (e) => {
          this.draggingCount--
          if (this.draggingCount === 0) {
            this.dragging = false
          }
          return false
        }
        holder.ondragend = () => {
          return false
        }
        holder.ondrop = (e) => {
          e.preventDefault()
          this.dragging = false
          const nativeImage = require('electron').nativeImage
          for (let f of e.dataTransfer.files) {
            if (f.path.endsWith('.gif')) {
              let reader = new FileReader()
              reader.readAsBinaryString(f)
              reader.onload = () => {
                let imageData = btoa(reader.result)
                this.fnSendImage(imageData)
              }
              reader.onerror = () => {
                console.log('there are some problems')
              }
            } else {
              let imageInstance = nativeImage.createFromPath(f.path)
              let imageData = imageInstance.toDataURL().replace(/^data:image\/png;base64,/, '')
              this.fnSendImage(imageData)
            }
          }
        }
      },
      fnShowImage (fileName) {
        this.imageUrl = `${this.baseUrl}/image/${fileName}`
        this.$nextTick(() => {
          this.fnShowPopup()
        })
      },
      fnSendImage (imageData) {
        if (this.$socket.disconnected) {
          this.alert('소켓이 연결되지 않았습니다. 네트워크 및 통신 상태를 확인해주세요.')
          return
        }
  
        let formData = new FormData()
        let fileName = `${this.user.id}_${this.user.user_seq}_${this.$moment().format('YYYYMMDDHHmmssSSS')}.png`
        formData.append('image', imageData)
        formData.append('user_seq', this.user.user_seq)
        formData.append('image_yn', 'Y')
        formData.append('isImage', true)
        formData.append('chat_time', this.$moment().format('YYYYMMDDHHmmss'))
        formData.append('fileName', fileName)
        this.$axios.post('/upload', formData).then((response) => {
          this.$socket.emit('chat', response.data)
          response.data.own = true
          this.messages.push(response.data)
          this.$nextTick(() => {
            let chatDiv = document.getElementById('chatContent')
            chatDiv.scrollTop = chatDiv.scrollHeight
          })
        })
      },
      fnPaste () {
        const clipboard = require('electron').clipboard
        let availableFormats = clipboard.availableFormats()
        let existImage = false
        availableFormats.some((format) => {
          if (format.indexOf('image') > -1) {
            existImage = true
            return existImage
          }
        })

        if (!existImage) {
          return
        }

        let imageFile = clipboard.readImage()
        let imageData = imageFile.toDataURL().replace(/^data:image\/png;base64,/, '')
        this.fnSendImage(imageData)
      },
      fnGetChosenUsers (seq) {
        let chosenUsers = this._.filter(this.todayChoices, (choice) => { return choice.restaurant_seq === seq })
        let returnString = ''
        chosenUsers.forEach((user) => {
          returnString += `<p>${user.name}</p>`
        })

        return returnString
      },
      fnChoose (restaurantSeq, choose) {
        if (this.$socket.disconnected) {
          this.alert('소켓이 연결되지 않았습니다. 네트워크 및 통신 상태를 확인해주세요.')
          return
        }
  
        const chooseParam = {
          restaurant_seq: restaurantSeq,
          user_seq: this.user.user_seq,
          id: this.user.id,
          name: this.user.name,
          choose: choose
        }
        this.$socket.emit('choose', chooseParam)
      },
      fnClosePopup () {
        this.EventBus.off('DIM_CLICK')
        this.$store.dispatch('setShowLayerPopup', false)
        this.showPopup = false
      },
      fnShowPopup () {
        this.EventBus.on('DIM_CLICK', () => {
          this.fnClosePopup()
        })
        this.$store.dispatch('setShowLayerPopup', true)
        this.showPopup = true
      },
      fnGetUserCount (value, type) {
        let count = 0
        if (type === 'C') {
          this.todayChoices.forEach((choice) => {
            this.flattenRestaurnts.forEach((restaurant) => {
              if (choice.restaurant_seq === restaurant.restaurant_seq && restaurant.category_name === value) {
                count++
              }
            })
          })
        } else {
          count = this._.filter(this.todayChoices, (choice) => {
            return choice.restaurant_seq === value
          }).length
        }

        return count
      },
      fnSendMessage () {
        if (this.$socket.disconnected) {
          this.alert('소켓이 연결되지 않았습니다. 네트워크 및 통신 상태를 확인해주세요.')
          return
        }

        if (!this.sendMessage || this.sendMessage.length < 1) {
          return
        }

        let message = {
          user_seq: this.user.user_seq,
          name: this.user.name,
          chat: this.sendMessage,
          chat_time: this.$moment().format('YYYYMMDDHHmmss')
        }
        this.$socket.emit('chat', message)

        message.own = true
        this.messages.push(message)
        this.sendMessage = ''

        this.$nextTick(() => {
          let chatDiv = document.getElementById('chatContent')
          chatDiv.scrollTop = chatDiv.scrollHeight
        })
      },
      fnGetLatestChoices () {
        this.$axios.get(`/getLatestChoices/${this.user.user_seq}`, {}).then((response) => {
          if (!response.data || response.data.length < 1) {
            return
          }

          this.latestChoices = []
          const today = this.$moment()
          response.data.forEach(choice => {
            const diffDays = today.diff(this.$moment(choice.choose_time, 'YYYYMMDDHHmmssSSS'), 'days')
            const restaurant = this._.find(this.flattenRestaurnts, (restaurant) => { return restaurant.restaurant_seq === choice.restaurant_seq })
            this.latestChoices.push({
              diffDays: diffDays,
              diffDaysString: diffDays === 1 ? '어제' : diffDays === 2 ? '그제' : this.$moment(this.$moment(choice.choose_time, 'YYYYMMDDHHmmssSSS'), 'YYYYMMDD').format('MM월 DD일 (ddd)'),
              restaurantName: restaurant.name
            })
          })
        })
      },
      fnGetTodayChoices () {
        this.$axios.get('/getTodayChoices', {}).then((response) => {
          this.todayChoices = response.data
        })
      },
      fnGetTodayMessages () {
        this.$axios.get('/getTodayMessages', {}).then((response) => {
          response.data.forEach((message) => {
            message.own = message.id === this.user.id
            if (!message.isImage && message.chat) {
              message.chat = message.chat.replace(/(?:\r\n|\r|\n)/g, '<br>')
            }
          })
          this.messages = response.data
          this.$nextTick(() => {
            let chatDiv = document.getElementById('chatContent')
            chatDiv.scrollTop = chatDiv.scrollHeight
          })
        })
      },
      fnGetRestaurants () {
        this.$axios.get('/getRestaurants', {}).then((response) => {
          this.flattenRestaurnts = response.data
          this.flattenRestaurnts.forEach((restaurant) => {
            restaurant.showTooltip = false
          })
          this.restaurants = this._.groupBy(response.data, 'category_name')
          this.fnGetLatestChoices()
        })
      },
      fnShowBuffet (instagramID) {
        if (this.imageUrlMap[instagramID]) {
          this.imageUrl = this.imageUrlMap[instagramID]
          this.$nextTick(() => {
            this.fnShowPopup()
          })
          return
        }

        this.$store.dispatch('setNowLoading', true)

        this.scraper.scrapeUserPage(instagramID).then(response => {
          this.$store.dispatch('setNowLoading', false)

          let latestMedia = response.medias[0]
          let todayStringDD = this.$moment().format('DD')
          let todayStringD = this.$moment().format('D')
          if (latestMedia.text.indexOf(todayStringD) < 0 && latestMedia.text.indexOf(todayStringDD) < 0) {
            this.alert('아직 오늘 메뉴가 올라오지 않았습니다.')
          } else {
            if (latestMedia.text.indexOf('저녁') > -1) {
              latestMedia = response.medias[1]
            }
            this.imageUrl = latestMedia.display_url
            this.imageUrlMap[instagramID] = this.imageUrl
            this.$nextTick(() => {
              this.fnShowPopup()
            })
          }
        })
      },
      fnInitEventBus () {
        this.EventBus.on('ADD_MESSAGE', (message) => {
          message.own = message.user_seq === this.user.user_seq
          this.messages.push(message)
          this.$nextTick(() => {
            let chatDiv = document.getElementById('chatContent')
            chatDiv.scrollTop = chatDiv.scrollHeight
          })
        })

        this.EventBus.on('REFRESH_CHOICES', (choices) => {
          this.todayChoices = []
          this.todayChoices.push(...choices)
        })

        this.EventBus.on('USERS_CHANGED', (users) => {
          this.users = []
          this.users.push(...users)
        })
      },
      fnInitSocket () {
        this.$socket.off('receiveChat')
        this.$socket.on('receiveChat', (data) => {
          this.EventBus.emit('ADD_MESSAGE', data)
        })

        this.$socket.off('chosen')
        this.$socket.on('chosen', (data) => {
          this.EventBus.emit('REFRESH_CHOICES', data)
        })

        this.$socket.off('usersChanged')
        this.$socket.on('usersChanged', (data) => {
          this.EventBus.emit('USERS_CHANGED', data)
        })

        this.$socket.emit('connected', this.user)
      }
    },
    mounted () {
      this.scraper = require('instagram-scraping')

      if (!this.user || !this.user.id) {
        this.$router.push('/')
        return
      }

      this.fnInitEventBus()
      this.fnInitSocket()
      this.fnGetTodayMessages()
      this.fnGetRestaurants()
      this.fnGetTodayChoices()
      this.fnInitDropEvent()
      this.fnGetUsers()
    }
  }
</script>

<style>
  div.restaurants {width: 70%; height: 100%; float: left; overflow-y: auto; border-right: 1px solid #ccc; position: relative;}

  div.restaurants div.header { height: 50px; }

  button.btn_coffee {position: absolute; top: 0; right: 140px; z-index: 3; border: 1px solid #f1446a; background-color: #f1648a; color: #f1f1f1; border-radius: 5px;}
  div.users_title {position: absolute; right: 67px; top: 6px; color: #1a7b00; font-weight: 600;}
  div.user_list {border: 1px solid #666; border-radius: 10px; position: absolute; right: 8px; top: 36px; z-index: 99; background-color: #f3f3f3; padding: 5px 10px;}
  div.user_list li {position: relative; padding-left: 17px; padding-top: 7px; font-weight: 600;}
  div.user_list div.network_status { position: absolute; top: 12px; left: 0px; width: 12px; height: 12px; background-color: #777; border-radius: 6px; }
  div.user_list div.network_status.on { background-color:#2ac700 }
  div.user_list div.network_status.off { background-color:#c22d10 }

  /* 최근 식사 이력 영역 */
  div.latest {position:relative;}
  li.latest_item {display: inline-block; margin-left: 15px;}
  li.latest_item span {font-weight: 600;}
  li.latest_item span.latest_restaurant {color: #7b11bb;}
  /* 최근 식사 이력 영역 */

  /* 채팅 영역 */
  div.chat_container {width: 30%; height: 100%; float: left; overflow-y: auto; padding-left: 10px;}
  div.chat_content{height: calc(100% - 61px); max-height: calc(100% - 61px); overflow-y: auto; border-bottom: 1px solid #ccc; position: relative;}
  div.chat_content div.dragging_dim { position: absolute; width: 100%; height: 100%; background-color: #2364b1; opacity: 0.5; }
  div.chat_input_container {height: 60px; padding-top: 10px;}
  div.chat_input_container input.chat_input {width: 100%; height: 40px; line-height: 40px; border: 1px solid #ccc; padding: 5px;}
  li.chat_item {clear: both;}
  div.message { margin-right: 25px; margin-bottom: 10px; width: fit-content; padding: 10px; position: relative; border-radius: .4em; user-select: text; }
  div.message div {word-break: break-all;}
  div.imageMessage { max-height: 200px; }
  div.imageMessage img { max-height: 160px; max-width: 100%; object-fit: cover; cursor: pointer; }
  div.chat_line.another div.message { float: left; background: #fff; margin-top: 16px; }
  div.chat_line.own div.message { float: right; background: #f5ec78; }
  div.chat_line.another div.message:after { content: ''; position: absolute; top: 0; left: 22px; width: 0; height: 0; border: 17px solid transparent; border-bottom-color: #fff; border-top: 0; border-left: 0; margin-left: 0; margin-top: -16px; }
  div.chat_line.own div.message:after { content: ''; position: absolute; right: 0; top: 50%; width: 0; height: 0; border: 17px solid transparent; border-left-color: #f5ec78; border-right: 0; border-bottom: 0; margin-top: -11px; margin-right: -16px; }
  div.time { text-align: right; font-size: 13px; color: #777; }
  /* 채팅 영역 */

  /* 식당 영역 */
  ul.restaurant_card_list {margin-top: 30px;}
  li.restaurant_card { display: inline-block; width: 300px; height: auto; background-color: #fff; border: 1px solid #666; border-radius: 10px; padding: 10px; margin-left: 15px; margin-top: 15px; }
  li.restaurant_card div.category { border-bottom: 1px solid #ccc; font-weight: 600; font-size: 18px; position: relative; height: 40px; line-height: 40px; }
  div.users { width: 55px; height: 30px; line-height: 30px; border: 1px solid #666; border-radius: 10px; background-color: #f1f1f1; position: absolute; right: 5px; top: 2px; background-image: url('../assets/images/user.png'); background-size: 16px 16px; background-repeat: no-repeat; background-position: 7px 5px; text-align: center; text-indent: 20px; cursor: pointer; z-index: 3;}
  div.choose { position: absolute; right: 8px; top: 35px; }
  div.choose button.choose { border-radius: 5px; padding: 2px 8px; background-color: #435057; border: 1px solid #637077; }
  div.choose button.cancel { border-radius: 5px; padding: 2px 8px; background-color: #da601c; border: 1px solid #ba400c; }
  ul.restaurant_list { margin-top: 10px; }
  li.restaurant { margin-top: 10px; padding: 5px 0; min-height: 70px; text-overflow: ellipsis; overflow-x: hidden; white-space: nowrap; position: relative; border-bottom: 1px solid #ccc; }
  li.restaurant p.loc { text-indent: 5px; font-size: 14px; }
  li.restaurant p.desc { text-indent: 5px; font-size: 14px; }
  li.restaurant p.desc span.desc_content { color: #f55; font-weight: 600; }
  li.restaurant p.url { text-indent: 5px; font-size: 14px; color: #33f; cursor: pointer; }
  /* 식당 영역 */

  div.choices { width: 120px; height: 30px; line-height: 30px; border: 1px solid #666; border-radius: 10px; background-color: #f1f1f1; position: absolute; right: 135px; top: 2px; text-align: center; cursor: pointer; z-index: 3; font-weight: 600; }
  div.choice_list {width: 200px; border: 1px solid #666; border-radius: 10px; position: absolute; right: 101px; top: 36px; z-index: 99; background-color: #f3f3f3; padding: 5px 10px; text-align: center; font-weight: 600;}

  /* 참여 팝업 */
  div.layer {width: 90%; height: 90%; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; background-color: #fff; border: 2px solid #666; z-index: 999;}
  div.layer_body {width: 100%; height: 100%; overflow: auto; padding: 10px;}
  div.layer_body img {width: 100%; height: 100%; object-fit: contain;}
  div.layer .close { position: absolute; right: 5px; top: 5px; width: 32px; height: 32px; opacity: 0.5; cursor: pointer; }
  div.layer .close:hover { opacity: 1; }
  div.layer .close:before, .close:after { position: absolute; left: 15px; content: ' '; height: 33px; width: 2px; background-color: #333; }
  div.layer .close:before { transform: rotate(45deg); }
  div.layer .close:after { transform: rotate(-45deg); }
  /* 참여 팝업 */
</style>
