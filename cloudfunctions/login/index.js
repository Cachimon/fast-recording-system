// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')
const got = require('got')
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
var crypto = require('crypto')

function WXBizDataCrypt(appId, sessionKey) {
  this.appId = appId
  this.sessionKey = sessionKey
}

WXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
  // base64 decode
  var sessionKey = Buffer.from(this.sessionKey, 'base64')
  encryptedData = Buffer.from(encryptedData, 'base64')
  iv = Buffer.from(iv, 'base64')

  try {
     // 解密
    var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true)
    var decoded = decipher.update(encryptedData, 'binary', 'utf8')
    decoded += decipher.final('utf8')
    
    decoded = JSON.parse(decoded)

  } catch (err) {
    throw new Error('Illegal Buffer')
  }

  if (decoded.watermark.appid !== this.appId) {
    throw new Error('Illegal Buffer')
  }

  return decoded
}

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main =  async (event, context) => {
  console.log(event)
  // let encryptedData = event.encryptedData
  // let iv = event.iv
  const user = event.user
  // console.log(context)
  // const APP_ID = "wx2e377738e0c59800"
  // const APP_SECRET = "5a7e2e3c0b15d27db898d01f67e311d4"
  // let res = await got('https://api.weixin.qq.com/sns/jscode2session?appid=' + APP_ID + '&secret=' + APP_SECRET + '&js_code=' + event.code + '&grant_type=authorization_code')
  // console.log('好哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈是哈1哈哈')
  // console.log(event.code)
  // console.log(Object.keys(res))
  // console.log(typeof res.body)
  // const sessionKey = JSON.parse(res.body)['session_key']
  // OPEN_ID = res.data.openid; //获取到的openid 
  // SESSION_KEY = res.data.session_key; //获取到session_key 
  // console.log('这里的openid', OPEN_ID)
  // console.log('这里的sessionid', SESSION_KEY)
  // wx.request({
  //   //获取openid接口
  //   url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + APP_ID + '&secret=' + APP_SECRET + '&js_code=' + code + '&grant_type=authorization_code',
  //   data: {},
  //   method: 'GET',
  //   success: function (res) {
     
  //   }
  // })
  // let obj = new WXBizDataCrypt(APP_ID, sessionKey)
  // encryptedData = new Buffer(encryptedData.split(""), 'base64')
  // console.log(typeof encryptedData)
  // console.log(sessionKey)
  // const unioncode = obj.decryptData(encryptedData, iv)
  // console.log('我要的id啊啊啊啊啊啊啊啊啊啊')
  // console.log(unioncode.unionId)
  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看
 
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext()
  console.log('ssssssss')
  console.log(wxContext)
  const exsit = await db.collection('user').where({
    number: wxContext.OPENID,
  }) .get()
  console.log('是否存在')
  console.log(exsit)
  let userInfo = {}
  if (exsit.data && exsit.data.length) {
    await db.collection('user').where({
      _openid: wxContext.OPENID
    }) .update({
      data: {
        avatar: user.avatarUrl,
        // userName: user.nickName,
        gender: user.gender,
        loginTime: Date.now()
      }
    })
  } else {
    const defaultGroup = await db.collection('group').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        groupName: 'default',
        createTime: Date.now(),
        loginTime: Date.now(),
        importantLevel: 3,
        index: 0,
        userId: wxContext.OPENID
      }
    })
    await db.collection('user').add({
        data: {
          number: wxContext.OPENID,
        //  _openid: wxContext.OPENID,
          avatar: user.avatarUrl,
          // groupList: [defaultGroup._id],
          createTime: Date.now(),
          userName: user.nickName,
          gender: user.gender
        }
      })
  }
  userInfo = await db.collection('user').where({
    _openid: wxContext.OPENID,
  }).get()
  return {
    event,
    user: userInfo.data[0],
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    env: wxContext.ENV,
  }
}

