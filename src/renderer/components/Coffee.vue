<template>
  <div class="coffee_container">
    <div class="close" @click="fnClosePopup"></div>
    <button @mouseenter="showCoffeeUsers = true" @mouseleave="showCoffeeUsers = false" class="btn_clipboard" title="클릭하시면 선택 내용들이 잔디로 전송됩니다." v-if="todayCoffeeChoices && todayCoffeeChoices.length > 0" @click="fnSendCoffeeChoices">
      커피 선택 보기
    </button>
    <div class="coffee_users_container" v-show="showCoffeeUsers">
      <ul class="coffee_user_list">
        <li v-for="choice in todayCoffeeChoices" v-bind:key="choice.id">
          {{ choice.name }} - {{ choice.coffee_name }} {{ choice.isHot ? 'HOT' : 'ICE' }} ({{fnGetPriceComma(choice.price)}}원)
        </li>
      </ul>
    </div>
    <div class="coffee_list_indexes">
      <button v-for="category in showCategories" v-bind:key="category" @click="fnSelectCategory(category)">
        {{ category }}
      </button>
      <div class="my_coffee_container">
        <p v-if="myCoffeeChoice">
          <span class="my_coffee">{{ myCoffeeChoice.coffee_name }}</span>
          <span v-if="myCoffeeChoice.isHot">(HOT)</span>
          <span v-else>(ICE)</span>
          을(를) 선택하셨습니다.
        </p>
        <p v-else>
          커피를 선택해주세요.
        </p>
      </div>
    </div>
    <div class="coffee_list_container">
      <div>
        <h3>
          커피 선택 1차 마감 : 오전 11시 20분, 2차 마감 : 오전 11시 50분
        </h3>
        <p class="deadline_guide">
          ※ 각 마감 시간 별로 잔디에 자동으로 전송되며, 2차 마감 이후 선택은 주문 시 반영되지 않습니다.
        </p>
      </div>
      <div v-for="(list, category, index) of coffeeListMap" v-bind:key="index">
        <h2 :id="category" class="coffee_category">
          {{ category }}
        </h2>
        <ul>
          <li :class="myCoffeeChoice && myCoffeeChoice.coffee_seq === coffee.nItem ? 'selected' : ''" class="coffee_card" v-for="coffee in coffeeListMap[category]" v-bind:key="coffee.nItem">
            <div class="coffee_image">
              <img :src="coffee.sImageUrl" />
            </div>
            <div class="coffee_name">
              {{ coffee.sItem }} (￦ {{ coffee.nCharge | currency }}원)
            </div>
            <div class="card_hot_ice">
              <button @click="fnChooseCoffee(coffee, true, true)" class="btn_hot_ice hot" v-if="!myCoffeeChoice && coffee.nIceItemType !== 2">
                HOT
              </button>
              <button @click="fnChooseCoffee(coffee, true, false)" class="btn_hot_ice ice" v-if="!myCoffeeChoice && coffee.nIceItemType !== 1">
                ICE
              </button>
              <button @click="fnChooseCoffee(coffee, false)" class="btn_hot_ice" v-if="myCoffeeChoice && myCoffeeChoice.coffee_seq === coffee.nItem">
                취소
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'coffee',
    computed: {
      user () {
        return this.$store.getters.userInfo
      },
      myCoffeeChoice () {
        return this._.find(this.todayCoffeeChoices, (choice) => { return choice.user_seq === this.user.user_seq })
      }
    },
    filters: {
      currency: function (value) {
        return value.toFixed(0).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,')
      }
    },
    data () {
      return {
        showCoffeeUsers: false,
        todayCoffeeChoices: [],
        coffeeCols: [],
        coffeeListMap: {},
        coffeeList: [],
        categories: [],
        selectedCategory: '',
        showCategories: [],
        choices: []
      }
    },
    methods: {
      fnGetPriceComma (price) {
        return Number.parseInt(price).toFixed(0).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,')
      },
      fnSendCoffeeChoices () {
        let clipboardText = `${this.$moment().format('YYYY년 MM월 DD일 ddd요일')} - ${this.user.name}\n`
        let priceSum = 0
        this.todayCoffeeChoices.forEach(choice => {
          clipboardText += `${choice.name} : ${choice.coffee_name} ${choice.isHot ? 'HOT' : 'ICE'} (${this.fnGetPriceComma(choice.price)})\n`
          priceSum = priceSum + parseInt(choice.price)
        })
        clipboardText += `\n총액 : ${this.fnGetPriceComma(priceSum)}원\n`

        let groupedChoices = this._.groupBy(this.todayCoffeeChoices, choice => {
          return `${choice.coffee_name} (${choice.isHot ? 'HOT' : 'ICE'})`
        })
        let groups = Object.keys(groupedChoices)
        let totalCoffeeCount = 0
        groups.forEach(group => {
          totalCoffeeCount += parseInt(groupedChoices[group].length)
          clipboardText += `\n${group} : ${groupedChoices[group].length}잔`
        })

        clipboardText += `\n\n총 ${totalCoffeeCount}잔`

        navigator.clipboard.writeText(clipboardText)
        // let jandiConnectURL = 'https://wh.jandi.com/connect-api/webhook/19790449/db43a74df6bdbd6364feb571ac2b2506'
        // this.$axios.post(jandiConnectURL, {'body': clipboardText}).then(response => {})
      },
      fnInitEvents () {
        this.$socket.off('chosenCoffee')
        this.$socket.on('chosenCoffee', (data) => {
          this.EventBus.emit('REFRESH_COFFEE_CHOICES', data)
        })

        this.EventBus.on('REFRESH_COFFEE_CHOICES', (choices) => {
          this.todayCoffeeChoices = []
          this.todayCoffeeChoices.push(...choices)
        })
      },
      fnChooseCoffee (coffee, choose, isHot) {
        const chooseParam = {
          category: coffee.sItemDivision,
          seq: coffee.nItem,
          coffee_name: coffee.sItem,
          isHot,
          price: coffee.nCharge,
          name: this.user.name,
          id: this.user.id,
          user_seq: this.user.user_seq,
          choose
        }
        this.$socket.emit('chooseCoffee', chooseParam)
      },
      fnSelectCoffee (coffee) {
        coffee.selected = true
        this.$forceUpdate()
      },
      fnSelectCategory (category) {
        location.href = '#' + category
      },
      fnClosePopup () {
        this.EventBus.emit('DIM_CLICK', {})
      },
      fnGetTodayCoffeeChoices () {
        this.$axios.get('/getTodayCoffeeChoices', {}).then((response) => {
          this.todayCoffeeChoices = this._.orderBy(response.data, ['coffee_name', 'isHot'], ['asc', 'asc'])
        })
      },
      fnGetCoffeeList () {
        const param = {
          'ws': 'fprocess',
          'query': 'MWRQ85AQ0V9VBEJ3GMUJ',
          'params': {'nFCode': 200000}
        }
        this.$axios.post('https://www.banapresso.com/query', param).then(response => {
          this.coffeeListMap = this._.groupBy(response.data.rows, (item) => {
            return item[1]
          })
          this.categories = Object.keys(this.coffeeListMap)

          this.showCategories = [
            'COFFEE',
            'MILK TEA & LATTE',
            'JUICE & YOGHURT',
            'BANACCINO & SMOOTHIE',
            'TEA & ADE'
          ]
          this.categories.forEach((category) => {
            if (!this._.includes(this.showCategories, category)) {
              delete this.coffeeListMap[category]
            }
          })
          this.coffeeCols = response.data.columns
          this.showCategories.forEach(category => {
            this.coffeeList = []
            this.coffeeListMap[category].forEach(coffeeRow => {
              let coffeeObj = {}
              for (let i = 0; i < this.coffeeCols.length; i++) {
                coffeeObj[`${this.coffeeCols[i].name}`] = coffeeRow[i]
              }
              this.coffeeList.push(coffeeObj)
            })

            this.coffeeListMap[category] = this.deepCopy(this.coffeeList)
          })

          this.fnSelectCategory(this.selectedCategory)
  
          /*
            ESPRESSO
            DUTCH
            LATTE
            MILK TEA
            JUICE
            YOGHURT
            BANACCINO
            YOGHURT SMOOTHIE
            TEA
            ADE
          */
          /*
            COFFEE
            MILK TEA & LATTE
            JUICE & YOGHURT
            BANACCINO & SMOOTHIE
            TEA & ADE
          */
        })
      },
      fnGetCoffeeDemoData () {
        let coffees = {'columns': [{'name': 'nItem', 'type': 'INT4'}, {'name': 'sItemDivision', 'type': 'NVARCHAR'}, {'name': 'sItem', 'type': 'NVARCHAR'}, {'name': 'sEItem', 'type': 'NVARCHAR'}, {'name': 'nIceItemType', 'type': 'INTN'}, {'name': 'sImageUrl', 'type': 'NVARCHAR'}, {'name': 'sImageUrlSub', 'type': 'NVARCHAR'}, {'name': 'nCharge', 'type': 'INTN'}, {'name': 'nUberCharge', 'type': 'INTN'}, {'name': 'sMenuExplanation', 'type': 'NVARCHAR'}, {'name': 'sSetItem', 'type': 'NVARCHAR'}, {'name': 'sItemShort', 'type': 'NVARCHAR'}, {'name': 'sLabelBottomEtc', 'type': 'NVARCHAR'}, {'name': 'nSortNumber', 'type': 'INTN'}, {'name': 'sItemDivisionSort', 'type': 'NVARCHAR'}], 'rows': [[5, 'COFFEE', '아메리카노', 'Americano', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_87ffe0eb7656.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_c9164b83c09f.png', 1500, 2000, '4가지 원두(브라질, 콜롬비아, 탄자니아, 만델링)를 블렌딩하여 고소한 견과류의 풍미를 살린 아메리칸 스타일의 커피', '', '아메리카', '', 1, 'ESPRESSO'], [6, 'COFFEE', '에티오피아싱글오리진', 'Ethiopia single origin', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_0284ecdd2a42.png', 'https://www.banapresso.com/img/items/SpecialAmericano_hot1.png', 2500, 2500, '에티오피아 싱글오리진 원두의 산뜻한 산미와 달콤한 과일향의 아메리카노', '', '스페아메', '', 2, 'ESPRESSO'], [8, 'COFFEE', '카푸치노', 'Cappuccino', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_51b71bd89112.png', 'https://www.banapresso.com/img/items/Cappuccino_hot1.png', 2500, 3000, '에스프레소에 크리미한 우유 거품이 어우러진 포근한 맛의 커피', '', '카푸치노', '', 5, 'ESPRESSO'], [9, 'COFFEE', '카페라떼', 'Cafe Latte', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_8c377bd81e61.png', 'https://www.banapresso.com/img/items/CafeLatte_hot1.png', 2500, 3000, '고소한 에스프레소에 우유를 더해 부드러운 맛을 즐길 수 있는 커피', '', '카페라떼', '', 6, 'ESPRESSO'], [11, 'COFFEE', '바닐라라떼', 'Vanilla Latte', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_bc4dd3c6f4e9.png', 'https://www.banapresso.com/img/items/VanillaLatte_hot1.png', 3000, 4000, '라떼에 바닐라의 감미로운 향을 더해 더욱 풍부한 맛을 내는 커피', '', '바닐라떼', '', 11, 'ESPRESSO'], [57, 'COFFEE', '크리미라떼', 'Creamy Latte', 2, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_3b6a2305623e.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_16c06baed2b1.png', 3000, 3500, '부드럽고 달콤한 크림을 더하여 깊은 풍미를 느낄 수 있는 커피', '', '크림라떼', '', 12, 'ESPRESSO'], [12, 'COFFEE', '카페모카', 'Cafe Mocha', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_96595e403e75.png', 'https://www.banapresso.com/img/items/CafeMocha_hot1.png', 3500, 4500, '초콜릿 파우더와 우유를 더한 에스프레소에 휘핑크림을 올린 달콤한 커피', '', '카페모카', '', 14, 'ESPRESSO'], [13, 'COFFEE', '카라멜마끼아또', 'Caramel Macchiato', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_ce79e98ad675.png', 'https://www.banapresso.com/img/items/CaramelMacchiato_hot1.png', 3500, 4500, '부드러운 우유와 카라멜 소스가 어우러진 달콤한 커피', '', '마끼아또', '', 15, 'ESPRESSO'], [51, 'COFFEE', '에스프레소', 'Espresso', 1, 'https://www.banapresso.com/img/items/Espresso.png', 'https://www.banapresso.com/img/items/Espresso.png', 1500, 2000, '4가지 원두(브라질, 콜롬비아, 탄자니아, 만델링)를 블렌딩해 진하게 추출한 깊은 풍미의 커피', '', '에스프소', '', 16, 'ESPRESSO'], [14, 'COFFEE', '더치커피', 'Dutch Coffee', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_1fc0b94b06ee.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_3b8a03228d9e.png', 2500, 3000, '장시간 저온에서 우려내어 특유의 깔끔함을 느낄 수 있는 커피', '', '더치커피', '', 1, 'DUTCH'], [267, 'COFFEE', '스페셜더치커피', 'Special Dutch Coffee', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_859fb787430e.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_6080cc1abce5.png', 3000, 0, '바나프레소의 스페셜원두로 천천히 우려내어 산미와 깔끔함이 잘 어우러진 스페셜 더치커피', '', '스페더치', '', 19, 'DUTCH'], [18, 'MILK TEA & LATTE', '리얼초코', 'Real Choco', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_5f9264feb1df.png', 'https://www.banapresso.com/img/items/RealChoco.png', 3000, 4000, '진한 초콜릿의 풍부한 맛이 오감을 자극하는 음료', '', '리얼초코', '', 0, 'LATTE'], [19, 'MILK TEA & LATTE', '리얼바닐라', 'Real Vanilla', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_600c98219db3.png', 'https://www.banapresso.com/img/items/RealVanila.png', 3000, 4000, '감미로운 향이 입안 가득 들어오는 바닐라 음료', '', '리바닐라', '', 0, 'LATTE'], [20, 'MILK TEA & LATTE', '오트밀라떼', 'Oatmeal Latte', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_6105d1eca7e1.png', 'https://www.banapresso.com/img/items/OatmealLatte_hot.png', 3000, 3500, '영양이 풍부한 오트밀을 우유에 믹스해 고소하게 즐길 수 있는 라떼', '', '오트라떼', '', 0, 'LATTE'], [22, 'MILK TEA & LATTE', '그린티라떼', 'Green Tea Latte', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_8c231048b67c.png', 'https://www.banapresso.com/img/items/GreenTeaLatte_hot.png', 3500, 4500, '녹차 특유의 쌉사름한 향에 우유의 부드러운 맛이 조화된 티 라떼', '', '그린라떼', '', 0, 'LATTE'], [74, 'JUICE & YOGHURT', '딸기쥬스', 'Strawberry Juice', 2, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_89625aed1a68.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_572b53dc9f86.png', 3500, 4000, '딸기의 새콤달콤한 맛이 입안 가득 퍼지는 과일쥬스', '', '딸기쥬스', '', 0, 'JUICE'], [40, 'BANACCINO & SMOOTHIE', '민트초코바나치노', 'Mint Chocolate Banaccino', 2, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_2e5b04186fec.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_061cc2fe57f0.png', 4000, 5000, '청량감 있는 민트와 초코의 달콤한 맛이 조화를 이룬 아이스 블렌디드 음료', '', '민트치노', '', 4, 'BANACCINO'], [239, 'BANACCINO & SMOOTHIE', '레몬스트로베리스무디', 'Lemon Strawberry Smoothie', 2, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_cbe4d65e9e41.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_e5722bccb6df.png', 3500, 0, '새콤 달콤한 맛이 입안 가득 퍼지는 스무디', '', '레몬스트', '', 8, 'BANACCINO'], [240, 'BANACCINO & SMOOTHIE', '패션망고스무디', 'Passion Mango Smoothie', 2, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_66eae82f4bbc.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_3b29f94a2efc.png', 3500, 0, '달콤한 망고와 패션후르츠의 특별한 만남', '', '패션망고', '', 9, 'BANACCINO'], [241, 'BANACCINO & SMOOTHIE', '베리베리스무디', 'Berry Berry Smoothie', 2, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_5b2eab27aa90.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_7c164aa2c205.png', 3500, 0, '플레인요거트와 스트로베리&블루베리를 넣어 새콤달콤하게 즐길 수 있는 스무디', '', '베리베리', '', 10, 'BANACCINO'], [243, 'BANACCINO & SMOOTHIE', '라이스바나치노', 'Rice Banaccino', 2, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_7c62ea18768c.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_e97b362e8cd5.png', 4000, 0, '쌀에 고소함과 볶은현미의 씹는 재미를 즐길  수 있는 바나치노', '', '라이치노', '', 11, 'BANACCINO'], [248, 'BANACCINO & SMOOTHIE', '피치피치스무디', 'Peach Peach Smoothie', 2, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_30e8711f01fc.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_dd3d0c7d8175.png', 3500, 0, '두가지 복숭아를 넣어 갈아만든 스무디', '', '피치무디', '', 12, 'BANACCINO'], [148, 'BANACCINO & SMOOTHIE', '레몬요거트스무디', 'Lemon Yogurt Smoothie', 2, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_37ba4bfa520d.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_f334bcbd57fc.png', 4500, 5000, '상큼한 레몬과 요거트에 환상적인 조합', '', '레요무디', '', 0, 'YOGHURT SMOOTHIE'], [41, 'BANACCINO & SMOOTHIE', '딸기요거트스무디', 'Strawberry Yogurt Smoothie', 2, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_b6d9c9eef121.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_21aab9c65516.png', 4500, 5000, '딸기의 새콤달콤한 맛이 입안 가득 퍼지는 요거트 스무디', '', '딸요무디', '', 9, 'YOGHURT SMOOTHIE'], [52, 'TEA & ADE', '레몬티', 'Lemon Tea', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_f94a0e2d8d11.png', 'https://www.banapresso.com/img/items/HoneyLemonTea.png', 3500, 4000, '레몬의 상큼함이 가득한 과일차', '', '레몬티', '', 0, 'TEA'], [217, 'TEA & ADE', '레몬페퍼민트티', 'Lemon Peppermint Tea', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_95d7d4dbd97e.png', 'https://www.banapresso.com/img/items/LemonPeppermintTea_hot.png', 3500, 3500, '레몬청과 상쾌한 페퍼민트가 잘 어우러진 과일허브티', '', '레몬페티', '', 0, 'TEA'], [276, 'GRILLED', '롤핫도그', 'Roll Hot dog', 0, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_c740907b6030.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_68855221c30d.png', 3000, 0, '육즙 가득한 소시지에 체다 치즈가 들어간 짭짤한 맛의 롤 핫도그', '', '롤핫도그', '', 37, 'GRILLED'], [255, 'BREAD', '플레인마들렌', 'Madeleine', 0, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_21420f9e6b6b.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_d826a609419a.png', 1000, 0, '촉촉한 버터 마들렌', '', '마들렌', '', 0, 'BREAD'], [205, 'BREAD', '소프트에그샌드위치', 'Soft egg sandwich', 0, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_548ae10f14c8.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_a6e6aee9a70c.png', 2500, 2500, '계란(국내산),우유식빵(밀-미국산),햄(미국,아일랜드,스페인산), 슬라이스치즈(미국산)', '', '소에샌드', '', 26, 'BREAD'], [252, 'BREAD', '더블에그샌드위치', 'Double egg sandwich', 0, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_b75bf1972d63.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_45127d840cf3.png', 2500, 0, '우유식빵(밀-미국산), 슬라이스햄(돼지고기-미국,아일랜드,스페인산), 계란(국내산), 난황(국내산)', '', '더블에그', '', 32, 'BREAD'], [124, 'SET MENU', '베이컨파니니세트', 'Bacon Panini Set', 3, 'https://www.banapresso.com/img/items/BaconPaniniSet1.png', 'https://www.banapresso.com/img/items/BaconPaniniSet1.png', 5000, 6000, '고소한 아메리카노와 수제 베이컨 바니니로 활기찬 하루를 시작하세요', '5,62,', '베파세트', '', 2, 'SET MENU'], [122, 'SET MENU', '클럽세트', 'Club Sandwich Set(Half)', 3, 'https://www.banapresso.com/img/items/ClubSandwichSetHalf2.png', 'https://www.banapresso.com/img/items/ClubSandwichSetHalf2.png', 3500, 4500, '  고소한 아메리카노와 신선한 클럽샌드위치로 활기찬 하루를 시작하세요', '5,47,', '클럽세트', '', 6, 'SET MENU'], [197, 'SET MENU', '치킨크랜베리샌드위치세트', 'Chicken Cranberry sandwich Set', 3, 'https://www.banapresso.com/img/items/ChickenCranberrysandwichSet.png', 'https://www.banapresso.com/img/items/ChickenCranberrysandwichSet.png', 3500, 5500, '영양가득한 곡물식빵에 크랜베리, 그릴드 치킨, 토마토와 함께 담백하게 즐길 수 있는 샌드위치', '5,194,', '치크세트', '', 8, 'SET MENU'], [196, 'SET MENU', '그릴드(콰트로)세트', 'Grilled Cheese(Cuatro) set', 3, 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_532cbbaf0ce6.png', 'https://www.banapresso.com/from_open_storage?ws=fprocess&file=banapresso/menu/img_82d2216fe043.png', 4500, 5500, '4가지 치즈가 듬뿍 들어가 치즈의 풍미와 맛을 즐길 수 있는 제품', '5,190,', '꽈치세트', '', 9, 'SET MENU'], [211, 'MD', '에티키링', 'Ethikeyring', 0, 'https://www.banapresso.com/img/items/Ethikeyring.png', 'https://www.banapresso.com/img/items/Ethikeyring.png', 9500, 9500, '보들보들한 원단에 앙증맞은 눈, 원하는 곳에 달아주면 귀여운 포인트가 되는 에티키링', '', '에티키링', '', 1, 'MD']], 'return': 0, 'params': {}}
        this.coffeeListMap = this._.groupBy(coffees.rows, (item) => {
          return item[1]
        })
        this.categories = Object.keys(this.coffeeListMap)

        this.showCategories = [
          'COFFEE',
          'MILK TEA & LATTE',
          'JUICE & YOGHURT',
          'BANACCINO & SMOOTHIE',
          'TEA & ADE'
        ]
        this.categories.forEach((category) => {
          if (!this._.includes(this.showCategories, category)) {
            delete this.coffeeListMap[category]
          }
        })
        this.coffeeCols = coffees.columns
        this.showCategories.forEach(category => {
          this.coffeeList = []
          this.coffeeListMap[category].forEach(coffeeRow => {
            let coffeeObj = {}
            for (let i = 0; i < this.coffeeCols.length; i++) {
              coffeeObj[`${this.coffeeCols[i].name}`] = coffeeRow[i]
            }
            this.coffeeList.push(coffeeObj)
          })

          this.coffeeListMap[category] = this.deepCopy(this.coffeeList)
        })

        this.fnSelectCategory(this.selectedCategory)
      }
    },
    mounted () {
      this.fnGetTodayCoffeeChoices()
      this.fnInitEvents()
      this.fnGetCoffeeList()
      // this.fnGetCoffeeDemoData()
  
      /*
      0:{name: "nItem", type: "INT4"}
      1:{name: "sItemDivision", type: "NVARCHAR"}
      2:{name: "sItem", type: "NVARCHAR"}
      3:{name: "sEItem", type: "NVARCHAR"}
      4:{name: "nIceItemType", type: "INTN"} - 1: hot only, 2: ice only, 3: both
      5:{name: "sImageUrl", type: "NVARCHAR"}
      6:{name: "sImageUrlSub", type: "NVARCHAR"}
      7:{name: "nCharge", type: "INTN"}
      8:{name: "nUberCharge", type: "INTN"}
      9:{name: "sMenuExplanation", type: "NVARCHAR"}
      10:{name: "sSetItem", type: "NVARCHAR"}
      11:{name: "sItemShort", type: "NVARCHAR"}
      12:{name: "sLabelBottomEtc", type: "NVARCHAR"}
      13:{name: "nSortNumber", type: "INTN"}
      14:{name: "sItemDivisionSort", type: "NVARCHAR"}
      */
    }
  }
</script>

<style scoped>
  div.coffee_container {width: 80%; height: 80%; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; border: 1px solid #ccc; background-color: #fff; z-index: 889;}

  div.my_coffee_container {padding: 10px 10px; font-weight: 600;}

  button.btn_clipboard {position: absolute; top: 10px; right: 50px;}
  div.coffee_users_container {position: absolute; z-index: 100; top: 50px; right: 50px; padding: 5px 10px; border: 1px solid #ccc; background-color: #f1f1f1; border-radius: 5px;}
  ul.coffee_user_list li {padding: 5px 0; font-weight: 600;}

  div.coffee_container .close { position: absolute; right: 5px; top: 12px; width: 32px; height: 32px; opacity: 0.5; cursor: pointer; }
  div.coffee_container .close:hover { opacity: 1; }
  div.coffee_container .close:before, .close:after { position: absolute; left: 15px; content: ' '; height: 33px; width: 2px; background-color: #333; }
  div.coffee_container .close:before { transform: rotate(45deg); }
  div.coffee_container .close:after { transform: rotate(-45deg); }

  div.coffee_title {width: 100%; height: 60px; line-height: 60px; text-indent: 20px; font-weight: 600; font-size: 24px;}
  div.coffee_list_indexes {height: 90px; padding: 10px 0; border-bottom: 1px solid #ccc;}
  div.coffee_list_indexes button {margin-left: 10px; border: 1px solid #f1446a; background-color: #f1648a; color: #f1f1f1;}

  div.coffee_list_container {height: calc(100% - 80px); overflow: auto; padding: 20px 10px;}
  div.coffee_list_container .deadline_guide {font-weight: 600; color: #e63030;}
  h2.coffee_category {margin-top: 15px;}
  li.coffee_card {position: relative; width: 300px; height: 400px; display: inline-block; border: 1px solid #ccc; margin-left: 10px; margin-top: 10px;}
  li.coffee_card.selected {border: 2px solid #f1648a;}
  div.coffee_image img {width: 300px; height: 319px;}
  div.coffee_name {text-align: center; font-weight: bold;}
  div.card_hot_ice {text-align: center;}
  div.card_hot_ice button {width: 80px;}
</style>
