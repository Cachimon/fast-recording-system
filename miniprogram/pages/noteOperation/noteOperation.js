// miniprogram/pages/noteCenter.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryList: [
      {
        _id: 111,
        name: "未分组"
      },
      {
        _id: 112,
        name: "html",
        selected: true
      },
      {
        _id: 113,
        name: "js"
      }, {
        _id: 114,
        name: "css"
      },
      {
        _id: 114,
        name: "vue"
      },
      {
        _id: 114,
        name: "nodejs"
      },
      {
        _id: 114,
        name: "es6"
      },
      {
        _id: 114,
        name: "ts"
      },
      {
        _id: 114,
        name: "扩展"
      },
    ],
    noteList: [
      {
        id: 1,
        content: `HTML5 语义化标签
html5shiv.js —— 必须在 head 标签内引入（在元素解析之前）`
      },
      {
        id: 1,
        content: "HTML5 媒体标签: html5media.js"
      }
    ],
    operationVisible: false,
    operationStyle: '',
    groupId: '',
    idList: [],

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
  back() {
    wx.navigateBack()
  },
  getNodeList() {
    let groupId = this.data.groupId
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
  idListHandler() {
    // idList
    let ids = this.data.noteList.filter(item => item.checked).map(item => item._id)
    this.setData({
      idList: ids
    })
  },
  delNote() {
    this.idListHandler()
    this.setData({
      delDialogShow: true
    })
    console.log('id列表', this.data.noteList)
    
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
          noteIdList: this.data.idList
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
  toggleChecked(e) {
    const i = e.currentTarget.dataset.index
    console.log('eeeeeeeeeeeeeee', i)
    const flag = this.data.noteList[i].checked
    let tempArr = this.data.noteList
    tempArr[i].checked = !flag
    this.setData({
      noteList: tempArr
    })
  },
  tapSetDialog(e) {
    this.closeSetDialog()
    if (e.detail.index === 1) {
      wx.cloud.callFunction({
        name: 'setGroupForNote',
        data: {
          noteIdList: this.data.idList,
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
      setDialogShow: false
    })
  },
  setGroup() {
    this.idListHandler()
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      groupId: options.groupId
    })
    this.getNodeList()
    // const eventChannel = this.getOpenerEventChannel()
    // // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    // eventChannel.on('acceptDataFromOpenerPage', function (data) {
    //   console.log(data)
    // })
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
    console.log(wx.getSystemInfoSync().windowWidth)
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
    
  }
})