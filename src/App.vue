<template>
  <div id="app">
    <OssFinder
      :credential="credential"
      :user-path="`post/1/`"
      :max-keys="10"
      :parallel="3"
      :part-size="1024 * 1024"
      @dblclick="dblclick"
      @get-credential="getCredential"
      v-model="visible"
    >
      <template v-slot:activator>
        <button @click="visible = !visible">打开对话框</button>
      </template>
    </OssFinder>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      visible: false,
      credential: {
        accessKeyId: "",
        accessKeySecret: "",
        securityToken: "",
        expiration: "",

        region: "oss-cn-hangzhou",
        bucket: "shuxie-dev"
      }
    };
  },

  methods: {
    dblclick(file) {
      console.log("双击事件触发", file);
    },
    getCredential(done) {
      /* eslint-disable */
      // 从后端获取临时ststoken，覆盖this.credential即可
      OSS.urllib.request(
        'http://localhost:3002/file/stsToken',
        { method: 'GET' },
        async (err, response) => {
          const result = JSON.parse(response)
          this.credential.accessKeyId = result.datas.accessKeyId
          this.credential.accessKeySecret = result.datas.accessKeySecret
          this.credential.securityToken = result.datas.securityToken
          this.credential.expiration = result.datas.expiration
          done() //调用 done 进行 ossclient的初始化
        }
      )
    },
  },
}
</script>

<style></style>
