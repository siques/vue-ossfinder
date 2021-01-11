<template>
  <div id="ossfinder">
    <slot name="activator"></slot>

    <MainDialog
      :credential="credential"
      :visible="visible"
      :parallel="parallel"
      :userPath="userPath"
      :partSize="partSize"
      :maxKeys="maxKeys"
      @getCredential="getCredential"
      @openImgDialog="showImagePrevDialog"
      @selectFile="selectFile"
      @change="$emit('change', false)"
    ></MainDialog>
    <ImgPreviewDialog
      :imgObject="imgObject"
      v-model="previewImg"
      ref="imgPreviewDialog"
    ></ImgPreviewDialog>
  </div>
</template>

<script>
import ImgPreviewDialog from './components/ImgPreviewDialog'
import MainDialog from './components/MainDialog'
import './assets/iconfont.js'
import { isAssetTypeAnImg } from './utils/util'
export default {
  name: 'OssFinder',
  components: {
    ImgPreviewDialog,
    MainDialog,
  },

  model: {
    prop: 'visible',
    event: 'change',
  },
  props: {
    visible: Boolean,
    userPath: {
      type: String,
    },
    credential: {
      type: Object,
      required: true,
    },
    parallel: {
      type: Number,
    },
    maxKeys: {
      type: Number,
    },
    partSize: {
      type: Number,
    },
  },
  data() {
    return {
      previewImg: '',
      imgObject: [],
      timer: null,
    }
  },

  mounted() {},
  methods: {
    showImagePrevDialog(file, imgObject) {
      if (isAssetTypeAnImg(file.name) == true) {
        clearTimeout(this.timer) //首先清除计时器
        this.timer = setTimeout(() => {
          this.previewImg = file.url
          this.imgObject = imgObject
          this.$refs.imgPreviewDialog.showModal()
        }, 200)
      }
    },
    selectFile(file) {
      clearTimeout(this.timer)
      this.$emit('dblclick', file)
    },
    getCredential(done) {
      this.$emit('get-credential', done)
    },
  },
}
</script>

<style>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
#ossfinder {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
