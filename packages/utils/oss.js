/* eslint-disable */
export default async (credential) => {
  return new Promise((resolve) => {
    const client = new OSS({
      accessKeyId: credential.accessKeyId,
      accessKeySecret: credential.accessKeySecret,
      stsToken: credential.securityToken,
      // region表示您申请OSS服务所在的地域，例如oss-cn-hangzhou。
      region: credential.region,
      bucket: credential.bucket,
    })
    resolve(client)
  })
}
