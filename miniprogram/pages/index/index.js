//index.js
const app = getApp()

Page({
  data: {
    loading: false,
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    showGroup: true,
    animationData: {},
    operationVisible: false,
    operationStyle: {},
    dialogShow: false,
    showOneButtonDialog: false,
    buttons: [{ text: '取消' }, { text: '确定' }],
    oneButton: [{ text: '确定' }],
    showName: false,
    formData: {
      nickName: ''
    },
    currentGroupIndex: '',
    groupList: [],
    delDialogShow: false,
    msgDialogShow: false,
    tips: '',

    groupOperator: '',
    addDialogShow: false
  },

  onLoad: function() {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    this.animation = animation

    this.setData({
      animationData: animation.export()
    })
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res)
              
              
              wx.cloud.callFunction({
                name: 'login',
                data: { user: res.userInfo },
                success: res => {
                  console.log('[云函数] [login] login: ', res.result.user)
                  const user = res.result.user
                  this.setData({
                    avatarUrl: user.avatar,
                    userInfo: user,
                    formData: user
                  })
                },
                fail: err => {
                  console.error('[云函数] [login] 调用失败', err)
                }
              })
              this.getGroupList()
              // wx.login({
              //   success:  (data) => {
              //     console.log(data);
              //     this.onGetOpenid(res.encryptedData, res.iv, data.code)
              //   }
              // })
              // 
              // this.getSession(res.userInfo.appId)
            }
          })
        }
      }
    })
  },
  getGroupList() {
    this.setData({loading: true})
    wx.cloud.callFunction({
      name: 'getGroupList',
      success: res => {
        console.log('getGroupList: ', res)
        this.setData({
          groupList: res.result,
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
          tips: '获取分组列表失败，请稍候重试。'
        })
      }
    })
  },
  tapMsgDialog() {
    this.setData({
      msgDialogShow: false
    })
  },
  deleteGroup() {
    this.setData({
      operationVisible: false,
      delDialogShow: true
    })
  },
  openDialog: function(e) {
    console.log(e)
    const type = e.currentTarget.dataset.type
    this.setData({
      dialogShow: true,
      formData: {nickName: this.data.userInfo.userName}
    })
    if (type === 'name') {
      this.setData({
        showName: true
      })
    }
  },
  
  formInputChange(e) {
    console.log(e)
    this.setData({
      formData: {...this.data.formData, 
        [e.currentTarget.dataset.field]: e.detail.value
      }
    })
  },
  tapDelDialog(e) {
    if (e.detail.index === 1){
      // 确认
      this.setData({
        loading: true
      })
      const id = this.data.groupList[this.data.currentGroupIndex]._id
      wx.cloud.callFunction({
        name: 'deleteGroup',
        data: {
          groupIdList: ['id']
        },
        success: res => {
          this.setData({
            loading: false,
            delDialogShow: false,
            msgDialogShow: true,
            tips: '删除分组成功！'
          })
          // app.globalData.openid = res.result.openid
          // wx.navigateTo({
          //   url: '../userConsole/userConsole',
          // })
        },
        fail: err => {
          this.setData({
            loading: false,
            delDialogShow: false,
            msgDialogShow: true,
            tips: '删除分组失败，请稍候重试。'
          })
        }
      })
    } else {
      // 取消
      this.setData({
        delDialogShow: false
      })
    }
  },
  tapDialogButton(e) {
    console.log('222222222', e)
    this.setData({
      dialogShow: false,
      showOneButtonDialog: false
    })
  },
  toggleGroup() {
    var animation = wx.createAnimation({
      duration: 4000,
      timingFunction: 'ease'
    });
    const height = this.data.showGroup ? 0 : 'auto'
    animation.height(height).step()
    this.setData({
      showGroup: !this.data.showGroup,
      animationData: animation.export()
    })
  },
  upHandler() {
    const updateList = [
      {
        groupId: this.data.groupList[this.data.currentGroupIndex]._id,
        index: this.data.groupList[this.data.currentGroupIndex - 1].index
      },
      {
        groupId: this.data.groupList[this.data.currentGroupIndex - 1]._id,
        index: this.data.groupList[this.data.currentGroupIndex].index
      }
    ]
    this.setIndexHandler({ updateList }, '上移')
  },
  downHandler() {
    const updateList = [
      {
        groupId: this.data.groupList[this.data.currentGroupIndex]._id,
        index: this.data.groupList[this.data.currentGroupIndex + 1].index
      },
      {
        groupId: this.data.groupList[this.data.currentGroupIndex + 1]._id,
        index: this.data.groupList[this.data.currentGroupIndex].index
      }
    ]
    console.log('下移', updateList)
    this.setIndexHandler({ updateList }, '下移')
  },
  setIndexHandler(data, operation) {
    this.setData({ loading: true, operationVisible: false })
    wx.cloud.callFunction({
      name: 'setGroupIndex',
      data,
      success: res => {
        this.setData({
          loading: false,
          msgDialogShow: true,
          tips: operation + '成功！'
        })
        this.getGroupList()
      },
      fail: err => {
        this.setData({
          loading: false,
          msgDialogShow: true,
          tips: operation + '失败，请稍后重试。'
        })
      }
    })
  },
  addGroupClick() {
    this.setData({
      formData: {},
      addDialogShow: true
    })
  },
  updateGroupClick() {
    this.setData({
      formData: {groupName: this.data.groupList[this.data.currentGroupIndex].groupName},
      updateDialogShow: true,
      operationVisible: false
    })
  },
  addInputChange(e) {
    console.log(e)
    this.setData({
      formData: {
        ...this.data.formData,
        [e.currentTarget.dataset.field]: e.detail.value
      }
    })
  },
  tapAddDialog(e) {
    if (e.detail.index === 1) {
      // 确认
      if (!this.data.formData.groupName) return
      this.setData({
        addDialogShow: false,
        loading: true
      })
      wx.cloud.callFunction({
        name: 'addGroup',
        data: {
          groupName: this.data.formData.groupName
        },
        success: res => {
          this.setData({
            loading: false,
            msgDialogShow: true,
            tips: '添加分组成功！'
          })
          this.getGroupList()
        },
        fail: err => {
          this.setData({
            loading: false,
            addDialogShow: false,
            msgDialogShow: true,
            tips: '添加分组失败，请稍候重试。'
          })
        }
      })
    } else {
      // 取消
      this.setData({
        formData: {},
        addDialogShow: false
      })
    }
  },
  tapUpdateDialog(e) {
    if (e.detail.index === 1) {
      // 确认
      if (!this.data.formData.groupName) return
      this.setData({
        updateDialogShow: false,
        loading: true
      })
      wx.cloud.callFunction({
        name: 'setGroupInfo',
        data: {
          groupInfo: {
            groupName: this.data.formData.groupName,
            groupId: this.data.groupList[this.data.currentGroupIndex]._id,
            importantLevel: this.data.groupList[this.data.currentGroupIndex].importantLevel
          }
        },
        success: res => {
          this.setData({
            loading: false,
            msgDialogShow: true,
            tips: '编辑分组成功！'
          })
          this.getGroupList()
        },
        fail: err => {
          this.setData({
            loading: false,
            updateDialogShow: false,
            msgDialogShow: true,
            tips: '编辑分组失败，请稍候重试。'
          })
        }
      })
    } else {
      // 取消
      this.setData({
        formData: {},
        updateDialogShow: false
      })
    }
  },
  getSession(appId, appSecret) {
    const APP_ID = appId
    const APP_SECRET = "5a7e2e3c0b15d27db898d01f67e311d4"
    wx.login({
      success: function (data) {
        console.log(data);
        
      }
    })
  },
  showOperation(e) {
    console.log(e)
    console.log(wx.getSystemInfoSync().windowWidth)
    const width = wx.getSystemInfoSync().windowWidth
    let left = e.touches[0].clientX
    console.log(left)
    if (width - left < 75) {
      left -= 75
    }
    this.setData({
      operationVisible: true,
      operationStyle: `top:${e.touches[0].clientY}px;left:${left}px`,
      currentGroupIndex: e.currentTarget.dataset.index
    })
    console.log(this.data)

  },
  closeOperation() {
    this.setData({
      operationVisible: false
    })
  },
  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function (encryptedData, iv, code) {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: { encryptedData, iv, code, user: this.data.userInfo},
      success: res => {
        console.log('[云函数] [login] user openid: ', res)
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  setNickName() {
    wx.cloud.callFunction({
      name: 'setNickName',
      data: { nickName: '柯南' },
      success: res => {
        console.log('setNickName: ', res)
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  addNote() {
    wx.cloud.callFunction({
      name: 'addNote',
      data: {
        content: '一条记录',
        groupId: 'd232df4c5fa62e1b000ee68a52614417',
        type: 1
      },
      success: res => {
        console.log('addNote: ', res)
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  deleteNote() {
    wx.cloud.callFunction({
      name: 'deleteNote',
      data: {
        noteIdList: ['d6b130aa5fa6a8c30012fde42a2e90fe', '4c86bd845fa6a90600110c3d6daf9e40']
      },
      success: res => {
        console.log('deleteNote: ', res)
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  setGroupForNote() {
    wx.cloud.callFunction({
      name: 'setGroupForNote',
      data: {
        noteIdList: ['d6b130aa5fa6a8c30012fde42a2e90fe', '4c86bd845fa6a90600110c3d6daf9e40','d6b130aa5fa6a5ef0012f5bd31ba00a9'],
        groupId:'13c6ced75fa6b0bc000e653c1258e746'
      },
      success: res => {
        console.log('setGroupForNote: ', res)
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  getNoteList() {
    wx.cloud.callFunction({
      name: 'getNoteList',
      data: {
        groupId: 'd232df4c5fa62e1b000ee68a52614417'
      },
      success: res => {
        console.log('getNoteList: ', res)
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  setNoteIndex() {
    wx.cloud.callFunction({
      name: 'setNoteIndex',
      data: {
        updateList: [
          { noteId: 'd6b130aa5fa6a5ef0012f5bd31ba00a9', index: 0 },
          { noteId: 'd6b130aa5fa6a8c30012fde42a2e90fe', index: 1 },
          { noteId: '4c86bd845fa6a90600110c3d6daf9e40', index:2},
        ]
      },
      success: res => {
        console.log('setNoteIndex: ', res)
        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  uploadFile() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        // 将图片上传至云存储空间
        wx.cloud.uploadFile({
          // 指定上传到的云路径
          cloudPath,
          filePath,
          // 指定要上传的文件的小程序临时文件路径
          // filePath: chooseResult.tempFilePaths[0],
          // 成功回调
          success: res => {
            console.log('上传成功', res)
            const fileId = res.fileID
            wx.cloud.callFunction({
              name: 'setAvatar',
              data: { fileId },
              success: res => {
                this.setData({
                  avatarUrl: fileId
                })
                console.log('[云函数] [login] user openid: ', res)
                // app.globalData.openid = res.result.openid
                // wx.navigateTo({
                //   url: '../userConsole/userConsole',
                // })
              },
              fail: err => {
                console.error('[云函数] [login] 调用失败', err)
                wx.navigateTo({
                  url: '../deployFunctions/deployFunctions',
                })
              }
            })
          },
        })
      },
    })
  }

})
