// miniprogram/pages/noteCenter.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupList: [
      // {
      //   _id: 111,
      //   name: "未分组"
      // },
      // {
      //   _id: 112,
      //   name: "html",
      //   selected: true
      // },
      // {
      //   _id: 113,
      //   name: "js"
      // }, {
      //   _id: 114,
      //   name: "css"
      // },
      // {
      //   _id: 114,
      //   name: "vue"
      // },
      // {
      //   _id: 114,
      //   name: "nodejs"
      // },
      // {
      //   _id: 114,
      //   name: "es6"
      // },
      // {
      //   _id: 114,
      //   name: "ts"
      // },
      // {
      //   _id: 114,
      //   name: "扩展"
      // },
    ],
    noteList: [
//       {
//         id: 1,
//         content: `HTML5 语义化标签
// html5shiv.js —— 必须在 head 标签内引入（在元素解析之前）`
//       },
//       {
//         id: 1,
//         content: "HTML5 媒体标签: html5media.js"
//       }
    ],
    operationVisible: false,
    operationStyle: '',
    loading: false,
    showGroup: false,
    currentGroupIndex: 0,
    content: '',
    currentNote: {},
    currentNoteIndex: 0,


    showActionsheet: false,
    groups: [
      { text: '示例菜单', value: 1 },
      { text: '示例菜单', value: 2 },
      { text: '负向菜单', type: 'warn', value: 3 }
    ],

    setDialogShow: false,
    selectedGroupIndex: 0,
    buttons: [{ text: '取消' }, { text: '确定' }],

    delDialogShow: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  tapSetDialog(e) {
    this.closeSetDialog()
    if (e.detail.index === 1) {
      wx.cloud.callFunction({
        name: 'setGroupForNote',
        data: {
          noteIdList: [this.data.noteList[this.data.currentNoteIndex]._id],
          groupId: this.data.groups[this.data.selectedGroupIndex].value
        },
        success: res => {
          console.log('setGroupForNote: ', res)
          this.closeSetDialog()
          this.getNodeList()
        },
        fail: err => {
          console.error('[云函数] [setGroupForNote] 调用失败', err)
        }
      })
    } else {
      // 取消
    }
  },
  closeSetDialog() {
    this.setData({
      setDialogShow:false
    })
  },
  setGroup() {
    this.closeOperation()
    this.setData({
      showActionsheet: true
    })
  },
  closeActionSheet: function () {
    this.setData({
      showActionsheet: false
    })
  },
  btnClick(e) {
    console.log(e)
    this.closeActionSheet()
    this.setData({
      selectedGroupIndex: e.detail.index,
      setDialogShow: true,
    })
    
  },
  getGroupList() {
    this.setData({ loading: true })
    wx.cloud.callFunction({
      name: 'getGroupList',
      success: res => {
        console.log('getGroupList: ', res)
        const arr = res.result
        // arr[this.data.currentGroupIndex].selected = true
        this.setData({
          groupList: arr,
          groups: arr.map(item => ({
            text: item.groupName,
            value: item._id
          }))
        })
        this.getNodeList(this.data.groupList[this.data.currentGroupIndex]._id)
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        this.setData({
          loading: false,
          msgDialogShow: true,
          tips: '获取分组列表失败，请稍候重试。'
        })
      }
    })
  },
  closeOperation() {
    this.setData({
      operationVisible: false
    })
  },
  getNodeList(id) {
    let groupId = id || this.data.groupList[this.data.currentGroupIndex]._id
    console.log('分组id', groupId)
    wx.cloud.callFunction({
      name: 'getNoteList',
      data: { groupId },
      success: res => {
        console.log('getNodeList: ', res)
        const arr = res.result
        // arr[this.data.currentGroupIndex].selected = true
        this.setData({
          noteList: arr,
          loading: false
        })
       
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        this.setData({
          loading: false,
          msgDialogShow: true,
          tips: '获取记录列表失败，请稍候重试。'
        })
      }
    })
  },
  contentChange(e) {
    this.setData({
      content: e.detail.value
    })
  },
  addContent() {
    const groupId = this.data.groupList[this.data.currentGroupIndex]._id
    wx.cloud.callFunction({
      name: 'addNote',
      data: {
        content: this.data.content,
        groupId: groupId,
        type: 1
      },
      success: res => {
        this.getNodeList(groupId)
        this.setData({
          content: ''
        })
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  toggleGroupShow() {
    this.setData({
      showGroup: !this.data.showGroup
    })
  },
  changeGroup(e) {
    console.log(e)
    this.setData({
      currentGroupIndex: e.currentTarget.dataset.index
    })
    this.getNodeList(this.data.groupList[this.data.currentGroupIndex]._id)
  },
  selectMore() {
    this.closeOperation()
    wx.navigateTo({
      //目的页面地址
      url: '/pages/noteOperation/noteOperation?groupId=' + this.data.groupList[this.data.currentGroupIndex]._id,
      success: function (res) { },
     })
  },
  delNote() {
    this.setData({
      operationVisible: false,
      delDialogShow: true
    })

  },
  closeDelDialog() {
    this.setData({
      delDialogShow: false
    })
  },
  tapDelDialog(e) {
    this.closeDelDialog()
    if (e.detail.index === 1) {

      wx.cloud.callFunction({
        name: 'deleteNote',
        data: {
          noteIdList: [this.data.noteList[this.data.currentNoteIndex]._id]
        },
        success: res => {
          this.getNodeList()
          // app.globalData.openid = res.result.openid
          // wx.navigateTo({
          //   url: '../userConsole/userConsole',
          // })
        },
        fail: err => {
          console.error('[云函数] [deleteNote] 调用失败', err)
        }
      })
    } else {
      // 取消
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getGroupList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      showActionsheet: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  showOperation(e) {
    // currentNote
    console.log(e)
    const index = e.currentTarget.dataset.index
    this.setData({
      currentNoteIndex: index
    })
    // console.log(wx.getSystemInfoSync().windowWidth)
    let left = e.touches[0].clientX
    console.log(left)
    if (375 - left < 75) {
      left -= 75
    }
    this.setData({
      operationVisible: true,
      operationStyle: `top:${e.touches[0].clientY}px;left:${left}px`
      
    })
    console.log(this.data)
    
  },
  upHandler() {
    this.closeOperation()
    const updateList = [
      {
        noteId: this.data.noteList[this.data.currentNoteIndex]._id,
        index: this.data.noteList[this.data.currentNoteIndex - 1].index
      },
      {
        noteId: this.data.noteList[this.data.currentNoteIndex - 1]._id,
        index: this.data.noteList[this.data.currentNoteIndex].index
      }
    ]
    console.log('更新列表', updateList)
    this.setNoteIndex({ updateList }, '上移')
  },
  downHandler() {
    this.closeOperation()
    const updateList = [
      {
        noteId: this.data.noteList[this.data.currentNoteIndex]._id,
        index: this.data.noteList[this.data.currentNoteIndex + 1].index
      },
      {
        noteId: this.data.noteList[this.data.currentNoteIndex + 1]._id,
        index: this.data.noteList[this.data.currentNoteIndex].index
      }
    ]
    console.log('更新列表', updateList)
    this.setNoteIndex({ updateList }, '上移')
  },
  setNoteIndex(data, operation) {
    wx.cloud.callFunction({
      name: 'setNoteIndex',
      data,
      success: res => {
        console.log('setNoteIndex: ', res)
        this.getNodeList()
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        // wx.navigateTo({
        //   url: '../deployFunctions/deployFunctions',
        // })
      }
    })
  },
})