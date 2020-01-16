<template>
  <div class="wrapper">
    <div class="restaurants">
      <div class="latest">
        <ul>
          <li class="latest_item" v-for="(choice, index) in latestChoices" v-bind:key="index">
            <span class="latest_title">
              {{ choice.diffDaysString }} : 
            </span>
            <span class="latest_restaurant">
              {{ choice.restaurant.name }}
            </span>
          </li>
        </ul>
      </div>
      <ul>
        <li class="restaurant_card" v-for="(value, name) in restaurants" v-bind:key="name">
          <div class="category">
            {{ name }}
            <div class="users" style="cursor: default;">
              {{ fnGetUserCount(name, 'C') }}
            </div>
          </div>
          <ul class="restaurant_list">
            <li class="restaurant" v-for="restaurant in value" v-bind:key="restaurant.seq">
              <span class="bold">{{ restaurant.name }}</span>
              <p class="loc" v-if="restaurant.loc && restaurant.loc.length > 0">
                위치 : {{ restaurant.loc }}
              </p>
              <p class="desc" v-if="restaurant.desc && restaurant.desc.length > 0">
                특징 : <span class="desc_content">{{ restaurant.desc }}</span>
              </p>
              <p class="url" @click.prevent="fnShowBuffet(restaurant.instagramID)" v-if="restaurant.url && restaurant.url.length > 0">
                메뉴확인 >
              </p>
              <div class="users" v-tooltip="{ content: fnGetChosenUsers(restaurant.seq), placement: 'left'}">
                {{ fnGetUserCount(restaurant.seq, 'R') }}
              </div>
              <div class="choose">
                <button v-if="myChoice && myChoice.seq === restaurant.seq" class="cancel" @click="fnChoose(restaurant.seq, false)">
                  취소
                </button>
                <button v-else-if="!myChoice" class="choose" @click="fnChoose(restaurant.seq, true)">
                  선택
                </button>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="chat_container">
      <div id="chatContent" class="chat_content">
        <ul>
          <li class="chat_item" v-for="(message, index) in messages" v-bind:key="index">
            <div class="chat_line" :class="message.own ? 'own' : 'another'">
              <div class="name" v-if="!message.own">
                {{ message.name }}
              </div>
              <div class="message" :class="message.isImage ? 'imageMessage' : ''">
                <img @click="fnShowImage(message.fileName)" v-if="message.isImage" :src="baseUrl + '/image/' + message.fileName" />
                <p v-else>
                  {{ message.message }}
                </p>
                <div class="time">
                  {{ $moment(message.date, 'YYYYMMDDHHmmss').format('HH:mm:ss') }}
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
  export default {
    name: 'index',
    data () {
      return {
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
        showTooltip: false
      }
    },
    computed: {
      baseUrl () {
        return this.$store.getters.baseUrl
      },
      user () {
        return this.$store.getters.userInfo
      },
      myChoice () {
        return this._.find(this.todayChoices, (choice) => { return choice.id === this.user.id })
      },
      socketDisconnected () {
        return this.$store.getters.socketDisconnected
      }
    },
    methods: {
      fnShowImage (fileName) {
        this.imageUrl = this.baseUrl + '/image/' + fileName
        console.log(this.imageUrl)
        this.$nextTick(() => {
          this.fnShowPopup()
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

        let formData = new FormData()
        let fileName = this.user.id + '_' + this.$moment().format('YYYYMMDDHHmmssSSS') + '.png'
        formData.append('image', imageData)
        formData.append('id', this.user.id)
        formData.append('name', this.user.name)
        formData.append('isImage', true)
        formData.append('date', this.$moment().format('YYYYMMDDHHmmss'))
        formData.append('fileName', fileName)
        this.$axios.post('/upload', formData).then((response) => {
          this.messages.push(response.data)
        })
      },
      fnGetChosenUsers (seq) {
        let chosenUsers = this._.filter(this.todayChoices, (choice) => { return choice.seq === seq })
        let returnString = ''
        chosenUsers.forEach((user) => {
          returnString += '<p>' + user.name + '</p>'
        })

        return returnString
      },
      fnChoose (seq, choose) {
        this.$socket.emit('choose', { seq: seq, id: this.user.id, name: this.user.name, choose: choose })
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
              if (choice.seq === restaurant.seq && restaurant.category === value) {
                count++
              }
            })
          })
        } else {
          count = this._.filter(this.todayChoices, (choice) => {
            return choice.seq === value
          }).length
        }

        return count
      },
      fnSendMessage () {
        if (this.$socket.disconnected) {
          this.alert('소켓 연결이 끊겼습니다.\n다시 연결되면 새로고침 됩니다.')
          return
        }

        if (!this.sendMessage || this.sendMessage.length < 1) {
          return
        }

        let message = {
          id: this.user.id,
          name: this.user.name,
          message: this.sendMessage,
          date: this.$moment().format('YYYYMMDDHHmmss')
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
        this.$axios.get('/getLatestChoices/' + this.user.id, {}).then((response) => {
          this.latestChoices = []
          let today = this.$moment()
          for (let day in response.data) {
            let choice = response.data[day]
            let diffDays = today.diff(this.$moment(day, 'YYYYMMDD'), 'days')
            let restaurant = this._.find(this.flattenRestaurnts, (restaurant) => { return restaurant.seq === choice.seq })

            this.latestChoices.push({
              day: day,
              diffDays: diffDays,
              diffDaysString: diffDays === 1 ? '어제' : diffDays === 2 ? '그제' : this.$moment(day, 'YYYYMMDD').format('MM월 DD일 (ddd)'),
              restaurant: restaurant
            })
          }
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
          this.restaurants = this._.groupBy(response.data, 'category')
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
          let todayString = this.$moment().format('DD') + '일'
          if (latestMedia.text.indexOf(todayString) < 0) {
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
      }
    },
    mounted () {
      this.scraper = require('instagram-scraping')

      this.fnInitEventBus()
      this.fnInitSocket()
      this.fnGetTodayMessages()
      this.fnGetRestaurants()
      this.fnGetTodayChoices()
      this.fnGetLatestChoices()
    }
  }
</script>

<style>
  div.restaurants {width: 70%; height: 100%; float: left; overflow-y: auto; border-right: 1px solid #ccc;}

  div.restaurants div.header { height: 50px; }
  li.latest_item {display: inline-block; margin-left: 15px;}
  li.latest_item span {font-weight: 600;}
  li.latest_item span.latest_restaurant {color: #7b11bb;}

  /* 채팅 영역 */
  div.chat_container {width: 30%; height: 100%; float: left; overflow-y: auto; padding-left: 10px;}
  div.chat_content{height: calc(100% - 61px); max-height: calc(100% - 61px); overflow-y: auto; border-bottom: 1px solid #ccc;}
  div.chat_input_container {height: 60px; padding-top: 10px;}
  div.chat_input_container input.chat_input {width: 100%; height: 40px; line-height: 40px; border: 1px solid #ccc; padding: 5px;}
  li.chat_item {clear: both;}
  div.message { margin-right: 25px; margin-bottom: 10px; width: fit-content; padding: 10px; position: relative; border-radius: .4em; user-select: text; }
  div.imageMessage { max-height: 200px; }
  div.imageMessage img { width: 100%; object-fit: cover; cursor: pointer; }
  div.chat_line.another div.message { float: left; background: #fff; margin-top: 16px; }
  div.chat_line.own div.message { float: right; background: #f5ec78; }
  div.chat_line.another div.message:after { content: ''; position: absolute; top: 0; left: 22px; width: 0; height: 0; border: 17px solid transparent; border-bottom-color: #fff; border-top: 0; border-left: 0; margin-left: 0; margin-top: -16px; }
  div.chat_line.own div.message:after { content: ''; position: absolute; right: 0; top: 50%; width: 0; height: 0; border: 17px solid transparent; border-left-color: #f5ec78; border-right: 0; border-bottom: 0; margin-top: -11px; margin-right: -16px; }
  div.time { text-align: right; font-size: 13px; color: #777; }
  /* 채팅 영역 */

  /* 식당 영역 */
  li.restaurant_card { display: inline-block; width: 300px; height: auto; background-color: #fff; border: 1px solid #666; border-radius: 10px; padding: 10px; margin-left: 15px; margin-top: 15px; }
  li.restaurant_card div.category { border-bottom: 1px solid #ccc; font-weight: 600; font-size: 18px; position: relative; height: 40px; line-height: 40px; }
  div.users { width: 55px; height: 30px; line-height: 30px; border: 1px solid #666; border-radius: 10px; background-color: #f1f1f1; position: absolute; right: 5px; top: 2px; background-image: url('../assets/images/user.png'); background-size: 16px 16px; background-repeat: no-repeat; background-position: 7px 5px; text-align: center; text-indent: 20px; cursor: pointer; }
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
