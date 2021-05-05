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
  const { content, groupId, type } = event
  const nickName = event.nickName
  const { OPENID } = cloud.getWXContext()
  let {total} = await db.collection('note').where({
    userId: OPENID
  }).count()
  let res = await db.collection('note').add({
    data: {
      userId: OPENID,
      content,
      groupId,
      type,
      createTime: Date.now(),
      index: total
    }
  })
  let noteInfo = await db.collection('note').where({
  _id: res._id,
}).get()

  return {
    data: noteInfo.data[0]
  }
}
