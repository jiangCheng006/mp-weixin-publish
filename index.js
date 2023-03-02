const ci = require('miniprogram-ci')
const yParser = require('yargs-parser')
const axios = require('axios')
const tmp = require('tmp');
const fs = require('fs')
const path = require('path')

const { 
  appid = '', 
  version = '1.0.0',
  type = 'miniProgram', // 默认微信小程序
  dist = 'dist/build/mp-weixin' // 构建生成的文件存放目录
} = yParser(process.argv.slice(2));

if (!appid) {
  throw new Error('---------- appid不能为空 ----------')
}

;(async () => {
  try {
    console.log('---------- 正在获取小程序信息 ----------')
    const { data } = await axios.post('/xxx', { appid })
    const tmpFilePath = tmp.fileSync().name;
    fs.writeFileSync(tmpFilePath, data.privateKey)

    console.log('---------- 小程序开始发布 ----------')
    const projectPath = path.resolve(__dirname, `../${dist}`)

    const project = new ci.Project({
      appid,
      type,
      projectPath,
      privateKeyPath: tmpFilePath,
      // ignores: ['node_modules/**/*'],
    })
    const uploadResult = await ci.upload({
      project,
      version,
      desc: '自动化发布',
      setting: {
        es6: true,
      },
      onProgressUpdate: console.log,
      robot: 1
    })
    console.log(uploadResult)
  } catch(err) {
    console.log('---------- 发布失败 ----------')
    console.log(err)
  }
})()
