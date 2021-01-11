<template
  ><dialog id="ossDialog">
    <Loading v-if="isLoading"></Loading>
    <div>
      <!-- 上传文件储存处 -->
      <input
        @input="uploadFile"
        style="display:none"
        type="file"
        id="fileInput"
        multiple="true"
      />
      <div class="ossfinder_content">
        <div class="ossfinder_header">
          <button @click="openUpload">上传</button>
          <button style="cursor:pointer" @click="hideDialog()" class="header">
            关闭
          </button>
        </div>
        <div class="ossfinder_body">
          <div class="ossfinder_wraper">
            <div v-if="isUpload">
              上传中：进度条{{ progress }}

              <div><button @click="stop">暂停</button></div>
              <div><button @click="resume">继续</button></div>
            </div>
            <div class="d-flex ">
              <div @click="listFolders(prevPath)">
                <svg class="icon pointer" aria-hidden="true">
                  <use xlink:href="#iconfanhui"></use>
                </svg>
              </div>
              <div class="folder_path">{{ path }}</div>
            </div>

            <div
              class="wraper"
              v-for="folder in result.prefixes"
              :key="folder.url"
            >
              <div class="d-flex ">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#iconFileManager"></use>
                </svg>
                <div
                  class="pointer ellipse pl-2"
                  @click="listFolders(folder.originPath)"
                >
                  {{ folder.path }}
                </div>
              </div>
            </div>
            <template v-for="file in result.objects">
              <div v-if="file.size !== 0" class="wraper " :key="file.url">
                <div class="d-flex ">
                  <svg class="icon" aria-hidden="true">
                    <use :xlink:href="`${switchFileIcon(file)}`"></use>
                  </svg>
                  <div
                    class="pointer ellipse pl-2"
                    @click="showImagePrevDialog(file, imgObject)"
                    @dblclick="selectFile(file)"
                  >
                    {{ file.name }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="footer">
          <button @click="prevPage">
            上一页
          </button>
          <button :disabled="isTruncated == false" @click="nextPage">
            下一页
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script>
import oss from '../utils/oss'
import { isAssetTypeAnImg, registerDialog, switchFileIcon } from '../utils/util'
import Loading from './Loading'
export default {
  name: 'MainDialog',
  components: {
    Loading,
  },
  props: {
    visible: Boolean,
    userPath: {
      type: String,
      default: '',
    },
    credential: {
      type: Object,
      default: () => {
        return {
          accessKeyId: '',
          accessKeySecret: '',
          securityToken: '',
          region: '',
          bucket: '',
          expiration: '', // 过期时间
        }
      },
    },
    parallel: {
      type: Number,
      default: 3, // 同时上传的分片数
    },
    maxKeys: {
      type: Number,
      default: 10, // 默认显示多少条数据
    },
    partSize: {
      type: Number,
      default: 1024 * 1024, // 每个分片大小(byte)
    },
  },
  watch: {
    visible: function(newVal) {
      if (newVal) {
        this.mainDialog.showModal()
      }
    },
  },
  computed: {
    prevPath() {
      if (this.path == this.userPath) {
        return this.userPath
      }
      const p = this.path.split('/')

      return this.path.replace(p[p.length - 2] + '/', '')
    },
  },
  data() {
    return {
      isTruncated: false,
      mainDialog: null,
      isLoading: false,
      progress: 0,
      isUpload: false,
      result: {},
      imgObject: [],
      path: '',
      marker: '',

      switchFileIcon,
      ossClient: null,

      fileInput: null,

      checkpoints: {}, // 所有分片上传文件的检查点
    }
  },
  mounted() {
    this.fetchCredential(this.init)
    this.mainDialog = document.querySelector('#ossDialog')

    this.fileInput = document.querySelector('#fileInput')

    registerDialog(this.mainDialog)
  },
  methods: {
    async init() {
      this.ossClient = await oss(this.credential)
      this.listFolders(this.userPath)
    },
    async openUpload() {
      this.fileInput.click()
    },
    fetchCredential(fun) {
      // 获取STS Token
      this.$emit('getCredential', fun)
    },

    async uploadFile() {
      this.fetchCredential(async () => {
        this.isUpload = true
        const { files } = this.fileInput
        const fileList = Array.from(files)
        fileList.forEach((file) => {
          // 如果文件小于分片大小，使用普通上传，否则使用分片上传

          if (file.size < this.partSize) {
            this.commonUpload(file)
          } else {
            this.multipartUpload(file)
          }
        })
      })
    },
    async commonUpload(file) {
      const fileName = this.path + file.name
      return this.ossClient
        .put(fileName, file)

        .then((result) => {
          console.log(
            `Common upload ${file.name} succeeded, result === `,
            result
          )
          this.isUpload = false
          this.listFolders(this.path)
        })
        .catch((err) => {
          console.log(`Common upload ${file.name} failed === `, err)
        })
    },
    async listFolders(prefix, marker) {
      this.isLoading = true
      this.result = {}
      this.imgObject = []
      let result = await this.ossClient.list({
        marker: marker ? marker : '',
        'max-keys': this.maxKeys,
        delimiter: '/',
        prefix: prefix ? prefix : '',
      })

      this.isTruncated = result.isTruncated
      this.marker = result.nextMarker
      this.path = prefix ? prefix : ''
      if (result.prefixes) {
        let prefixes = []
        result.prefixes.forEach((e) => {
          prefixes.push({
            path: e.replace(this.path, ''),
            originPath: e,
          })
        })
        result.prefixes = prefixes
      }

      if (result.objects) {
        let objects = []
        result.objects.forEach((e) => {
          e.name = e.name.replace(this.path, '')
          if (isAssetTypeAnImg(e.name) == true) {
            this.imgObject.push(e)
          }
          objects.push(e)
        })
        result.objects = objects
      }

      setTimeout(() => {
        this.isLoading = false
        this.result = result
      }, 300)
    },

    // 分片上传
    async multipartUpload(file) {
      const fileName = this.path + file.name

      return this.ossClient
        .multipartUpload(fileName, file, {
          parallel: this.parallel,
          partSize: this.partSize,
          progress: this.onMultipartUploadProgress,
        })
        .then(() => {
          this.isUpload = false
          // 生成文件下载地址
          const url = `http://${this.credential.bucket}.${this.credential.region}.aliyuncs.com/${fileName}`
          console.log(`Multipart upload ${file.name} succeeded, url === `, url)
        })
        .catch((err) => {
          console.log(`Multipart upload ${file.name} failed === `, err)
        })
    },

    // 断点续传
    async resumeMultipartUpload() {
      Object.values(this.checkpoints).forEach((checkpoint) => {
        const { uploadId, file, name } = checkpoint
        this.ossClient
          .multipartUpload(uploadId, file, {
            parallel: this.parallel,
            partSize: this.partSize,
            progress: this.onMultipartUploadProgress,
            checkpoint,
          })
          .then(() => {
            console.log('before delete checkpoints === ', this.checkpoints)
            delete this.checkpoints[checkpoint.uploadId]
            console.log('after delete checkpoints === ', this.checkpoints)
            const url = `http://${this.credential.bucket}.${this.credential.region}.aliyuncs.com/${name}`
            console.log(
              `Resume multipart upload ${file.name} succeeded, url === `,
              url
            )
          })
          .catch((err) => {
            this.isUpload = false
            console.log('Resume multipart upload failed === ', err)
          })
      })
    }, // 分片上传进度改变回调
    async onMultipartUploadProgress(progress, checkpoint) {
      this.progress = progress
      // console.log(`${checkpoint.file.name} 上传进度 ${progress}`);
      this.checkpoints[checkpoint.uploadId] = checkpoint
      // 判断STS Token是否将要过期，过期则重新获取
      const { expiration } = this.credential
      const timegap = 1 // 一分钟内过期
      if (expiration && this.credential.expiration - Date.now() < 1000 * 60) {
        console.log(
          `STS token will expire in ${timegap} minutes，uploading will pause and resume after getting new STS token`
        )
        if (this.ossClient) {
          this.ossClient.cancel()
        }
        this.fetchCredential(this.resumeMultipartUpload())
      }
    },
    hideDialog() {
      this.$emit('change', false)
      this.mainDialog.close()
    },
    showImagePrevDialog(file, imgObject) {
      this.$emit('openImgDialog', file, imgObject)
    },
    selectFile(file) {
      this.$emit('selectFile', file)
    },
    prevPage() {
      this.listFolders(this.path)
    },
    nextPage() {
      this.listFolders(this.path, this.marker)
    },
    // 暂停上传
    stop() {
      if (this.ossClient) this.ossClient.cancel()
    },

    // 续传
    resume() {
      this.isUpload = true
      if (this.ossClient) this.resumeMultipartUpload()
    },
  },
}
</script>

<style scoped>
.footer {
  height: 60px;
}

.pl-2 {
  padding-left: 10px;
}
.pointer {
  cursor: pointer;
}
#ossDialog {
  box-shadow: 4px 7px 11px 5px #0000000f;
  border: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 2px;
  transition: opacity 0.4s ease;
  opacity: 1;
  padding: 0 !important;
  margin: 0 auto;
}

#ossDialog:not([open]) {
  display: block;
  opacity: 0;
  visibility: hidden;
}
.ossfinder_content {
  /* padding: 1rem; */
}
.d-flex {
  display: flex;
}

.jc-center {
  justify-content: center;
}
.jc-between {
  justify-content: space-between;
}

.ossfinder_body {
  display: flex;
  justify-content: center;
}

.ossfinder_wraper {
  height: 500px;
  width: 500px;
  padding: 10px;
}

.wraper {
  padding-top: 10px;
  font-size: 18px;
}

.folder_path {
  padding-left: 20px;
}

.ellipse {
  overflow: hidden; /*内容超出后隐藏*/

  text-overflow: ellipsis; /* 超出内容显示为省略号*/

  white-space: nowrap; /*文本不进行换行*/
}

dialog::backdrop {
  /* native */
  backdrop-filter: blur(5px);
  background-color: rgba(0, 0, 0, 0.1);
}
#createFolderDialog {
  box-shadow: 4px 7px 11px 5px #0000000f;
  border: none;
  position: fixed;
  top: 50%;
  transform: translate(0, -50%);
  border-radius: 2px;
  transition: opacity 0.4s ease;
  opacity: 1;
  padding: 0 !important;
  width: 400px;
  height: 400px;
}
</style>
