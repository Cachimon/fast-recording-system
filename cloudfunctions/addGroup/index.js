const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {

  console.log(event)
  const { groupName } = event
  const nickName = event.nickName
  const { OPENID } = cloud.getWXContext()
  let {total} = await db.collection('group').where({
    userId: OPENID
  }).count()
  let res = await db.collection('group').add({
    data: {
      userId: OPENID,
      groupName,
      importantLevel: 3,
      createTime: Date.now(),
      index: total
    }
  })
  let groupInfo = await db.collection('group').where({
  _id: res._id,
}).get()

  return {
    data: groupInfo.data[0]
  }
}
