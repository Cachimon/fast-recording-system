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
  const { groupId, page } = event
  const { OPENID } = cloud.getWXContext()
  const { data } = await db.collection('note').where({
    userId: OPENID, groupId,
    ifDeleted: _.neq(1)
  }).orderBy('index', 'asc').get()
 

  return data
}
