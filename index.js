const ci = require('miniprogram-ci')
const yParser = require('yargs-parser')
const axios = require('axios')
const tmp = require('tmp');
const fs = require('fs')
const path = require('path')
const spinner = require('ora')()

const package = require('../pacakge.json')

const {
  appid = '',
  version = package.version,
  type = 'miniProgram', // 默认微信小程序
  dist = 'dist/build/mp-weixin', // 构建生成的文件存放目录
  token = ''
} = yParser(process.argv.slice(2));

if (!appid || !token) {
  spinner.fail(`appid 和 token 不能为空`)
  return;
}

;(async () => {
  try {
    spinner.start('获取小程序信息...\n')
    const { data: { data } = {} } = await axios({
      url: 'http://fed.lishicloud.com/api/miniapp/config/queryByAppId',
      headers: { token },
      params: { appId: appid }
    })
    const tmpFilePath = tmp.fileSync().name;
    fs.writeFileSync(tmpFilePath, data.uploadSecret) // 写入临时文件中

    spinner.start('小程序发布中...\n')
    const projectPath = path.resolve(__dirname, `../${dist}`)
    const configPath = path.join(projectPath, 'project.config.json')
    const isConfigExists = fs.existsSync(configPath)
    let projectConfigSetting = { es6: true }

    if (isConfigExists) {
      projectConfigSetting = require(configPath).setting || projectConfigSetting
    }

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
      setting: projectConfigSetting,
      robot: 1
    })
    spinner.succeed('发布成功')
  } catch(err) {
    spinner.fail(`发布失败`)
    console.log(err)
  }
})()
