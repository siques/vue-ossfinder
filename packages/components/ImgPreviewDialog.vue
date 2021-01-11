<template>
  <dialog @click="closeModal" id="imgPreviewDialog">
    <!-- <div class="imgHeader"></div> -->
    <div v-if="imgIndex != 0" @click.stop="prev" class="prevImg pointer">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#iconprev"></use>
      </svg>
    </div>
    <div
      v-if="imgIndex != imgLen - 1"
      @click.stop="next"
      class="nextImg pointer"
    >
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#iconnext"></use>
      </svg>
    </div>

    <img class="previewImg" :src="previewImg" alt="无效链接" />
  </dialog>
</template>

<script>
import { registerDialog } from "../utils/util";
export default {
  name: "ImgPreviewDialog",
  model: {
    prop: "previewImg",
    event: "change"
  },
  props: {
    previewImg: {
      type: String,
      default: ""
    },
    imgObject: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  computed: {
    imgIndex() {
      return this.imgObject.findIndex(item => item.url === this.previewImg);
    },
    imgLen() {
      return this.imgObject.length;
    }
  },
  data() {
    return {
      imgPreviewDialog: null
    };
  },
  mounted() {
    this.imgPreviewDialog = document.querySelector("#imgPreviewDialog");
    registerDialog(this.imgPreviewDialog);
  },
  methods: {
    prev() {
      this.$emit("change", this.imgObject[this.imgIndex - 1].url);
    },
    next() {
      this.$emit("change", this.imgObject[this.imgIndex + 1].url);
    },
    closeModal() {
      this.$emit("change", "");
      this.imgPreviewDialog.close();
    },
    showModal() {
      this.imgPreviewDialog.showModal();
    }
  }
};
</script>

<style scoped>
#imgPreviewDialog {
  box-shadow: 4px 7px 11px 5px #0000000f;
  border: none;
  position: fixed;
  top: 50%;
  transform: translate(0, -50%);

  transition: opacity 0.4s ease;
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
  background: top;
}

.prevImg {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 47%;
  margin-left: 20px;
  height: 60px;
  width: 60px;
  background: white;
  border-radius: 50%;
}
.nextImg {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 0;
  margin-right: 20px;
  top: 47%;
  height: 60px;
  width: 60px;
  background: white;
  border-radius: 50%;
}

.imgHeader {
  height: 60px;
}
.previewImg {
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  margin: auto;
  max-width: 800px;
  object-fit: cover;
}
</style>
