<script setup lang="ts">
import TikTok from '/svg/share/tiktok.svg'
import Telegram from '/svg/share/telegram.svg'
import WeChat from '/svg/share/wechat.svg'
import Twitter from '/svg/share/twitter.svg'
import Gallery from '/svg/share/gallery.svg'
import Video from '/svg/share/video.svg'
import Gif from '/svg/share/gif.svg'
import Contact from '/svg/share/contact.svg'

const shareDialog: any = inject('shareDialog')

const shareAvenus = [
  {
    svg: TikTok,
    name: 'TikTok',
    click() {

    },
  },
  {
    svg: Telegram,
    name: 'Telegram',
    click() {
    },
  },
  {
    svg: WeChat,
    name: '微信',
    click() {
    },
  },
  {
    svg: Twitter,
    name: 'Twitter',
    click() {
    },
  },
  {
    svg: Gallery,
    name: '相册',
    click() {
    },
  },
  {
    svg: Video,
    name: '视频',
    click() {
    },
  },
  {
    svg: Gif,
    name: 'GIF',
    click() {
    },
  },
  {
    svg: Contact,
    name: '联系人',
    click() {
    },
  },
]
</script>

<template>
  <div class="ShareMenuPage">
    <div w-full flex items-center justify-between class="ShareMenuPage-Header">
      <p>分享给</p>

      <div class="ShareMenuPage-Header-Icon" @click="shareDialog = false">
        <svg
          xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
          width="32" height="32" viewBox="0 0 32 32"
        >
          <g>
            <g />
            <g>
              <path
                d="M27.25,16C27.25,22.2132,22.2132,27.25,16,27.25C16,27.25,16,28.75,16,28.75C23.0416,28.75,28.75,23.0416,28.75,16C28.75,16,27.25,16,27.25,16C27.25,16,27.25,16,27.25,16ZM16,27.25C9.7868,27.25,4.75,22.2132,4.75,16C4.75,16,3.25,16,3.25,16C3.25,23.0416,8.95837,28.75,16,28.75C16,28.75,16,27.25,16,27.25C16,27.25,16,27.25,16,27.25ZM4.75,16C4.75,9.7868,9.7868,4.75,16,4.75C16,4.75,16,3.25,16,3.25C8.95837,3.25,3.25,8.95837,3.25,16C3.25,16,4.75,16,4.75,16C4.75,16,4.75,16,4.75,16ZM16,4.75C22.2132,4.75,27.25,9.7868,27.25,16C27.25,16,28.75,16,28.75,16C28.75,8.95837,23.0416,3.25,16,3.25C16,3.25,16,4.75,16,4.75C16,4.75,16,4.75,16,4.75Z"
                fill="#FFFFFF" fill-opacity="1"
              />
            </g>
            <g>
              <path
                d="M21.057499999999997,15.00173C21.334600000000002,14.693848,21.3096,14.219631,21.0017,13.942536C20.693849999999998,13.6654416,20.219630000000002,13.6904006,19.94254,13.998283C19.94254,13.998283,21.057499999999997,15.00173,21.057499999999997,15.00173C21.057499999999997,15.00173,21.057499999999997,15.00173,21.057499999999997,15.00173ZM16.00001,19.50001C16.00001,19.50001,15.442540000000001,20.001730000000002,15.442540000000001,20.001730000000002C15.584769999999999,20.15977,15.78739,20.25001,16.00001,20.25001C16.21263,20.25001,16.41525,20.15977,16.557479999999998,20.001730000000002C16.557479999999998,20.001730000000002,16.00001,19.50001,16.00001,19.50001C16.00001,19.50001,16.00001,19.50001,16.00001,19.50001ZM12.05748,13.998283C11.780380000000001,13.6904006,11.306166,13.6654416,10.998283,13.942536C10.6904006,14.219631,10.6654416,14.693848,10.942536,15.00173C10.942536,15.00173,12.05748,13.998283,12.05748,13.998283C12.05748,13.998283,12.05748,13.998283,12.05748,13.998283ZM19.94254,13.998283C19.94254,13.998283,15.442540000000001,18.99829,15.442540000000001,18.99829C15.442540000000001,18.99829,16.557479999999998,20.001730000000002,16.557479999999998,20.001730000000002C16.557479999999998,20.001730000000002,21.057499999999997,15.00173,21.057499999999997,15.00173C21.057499999999997,15.00173,19.94254,13.998283,19.94254,13.998283C19.94254,13.998283,19.94254,13.998283,19.94254,13.998283ZM16.557479999999998,18.99829C16.557479999999998,18.99829,12.05748,13.998283,12.05748,13.998283C12.05748,13.998283,10.942536,15.00173,10.942536,15.00173C10.942536,15.00173,15.442540000000001,20.001730000000002,15.442540000000001,20.001730000000002C15.442540000000001,20.001730000000002,16.557479999999998,18.99829,16.557479999999998,18.99829C16.557479999999998,18.99829,16.557479999999998,18.99829,16.557479999999998,18.99829Z"
                fill="#FFFFFF" fill-opacity="1"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>

    <div class="ShareMenuPage-Main">
      <div v-for="avenue in shareAvenus" :key="avenue.name" class="ShareMenuPage-Main-Item" @click="avenue.click">
        <img :src="avenue.svg" :alt="avenue.name">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ShareMenuPage-Main {
  margin: 2rem 0 3rem;
  display: grid;

  gap: 2rem;
  justify-items: center;
  grid-template-columns: repeat(4, 1fr);
}

.ShareMenuPage {
  padding: 0.5rem;

  &-Header {
    font-family: Source Han Sans;
    font-size: 20px;
    font-weight: normal;
    line-height: 22px;
    text-align: center;
    letter-spacing: 0px;

    font-variation-settings: 'opsz' auto;
    font-feature-settings: 'kern' on;
    color: #ffffff;
  }
}
</style>
