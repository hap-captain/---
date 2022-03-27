const db = wx.cloud.database()
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myClass: '',
    myDepartment: '请选择',
    myGrade: '请选择',
    departments: ['请选择'],
    departmentsIndex: 0,
    grades: [2020],
    gradesIndex: 0,
    classesObject: {},
    classes: ['请先选择学院与年级'],
    classesIndex: 0,
    count:0,
    courseKey:""
  },
   
  selectDepartment: function (e) {
    let departmentsIndex = e.detail.value
    let department = this.data.departments[departmentsIndex]
    let grade = this.data.grades[0]
    let classesObject = this.data.classesObject
    let classes = classesObject[department + grade]
    if (!classes) {
      console.log(classes)
      classes = ['该学院年级无班级数据']
    }
    this.setData({
      departmentsIndex,
      classes,
      classesIndex: 0,
      myClass: classes[0],
      myDepartment: department,
      myGrade:grade,
      gradesIndex:0
    })
  },
  selectGrade: function (e) {
    let gradesIndex = e.detail.value
    let grade = this.data.grades[gradesIndex]
    let department = this.data.departments[this.data.departmentsIndex]
    let classes = this.data.classesObject[department + grade]
    if (!classes) {
      console.log(classes)
      classes = ['该学院年级无班级数据']
    }
    this.setData({
      gradesIndex,
      classes,
      myClass: classes[0],
      classesIndex: 0,
      myGrade: grade
    })
  },
  selectClass: function (e) {
    let myClass = this.data.classes[e.detail.value]
    this.setData({
      classesIndex: e.detail.value,
      myClass
    })
  },
  saveInfo: function (e) {
   
    let data = this.data
    let myClass = data.myClass
    let myDepartment = data.myDepartment
    let myGrade = data.myGrade
    console.log(data)
    if (data.myClass != "" &&
      data.myClass != "该学院年级无班级数据" &&
      data.myClass != "请先选择学院与年级") {
      wx.showLoading({
        title: ' ',
      })
      wx.cloud.callFunction({
        name: 'saveUserInfo',
        data: {
          myClass,
          myDepartment,
          myGrade,
        }
      }).then(res => {
        wx.hideLoading()
        app.globalData.myClass=myClass;
        app.globalData.flushC=true
           //删除缓存
           wx.removeStorage({
            key: data.courseKey,
            success (res) {
              //console.log("更换班级删除删除缓存res")
              console.log(res)
            }
          })
          wx.navigateBack({
            delta: 1,
          })
      }).catch(res => {
          console.log(res)
          wx.hideLoading()
          wx.showToast({
            title: '网络异常',
            icon: 'none',
            duration: 1000
          })
        })
    } else {
      wx.showToast({
        title: '请选择正确的信息',
        icon: 'none',
        duration: 1000
      })
      // console.log(data)
    }
      
  
 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('globaldata',app.globalData)
    let that = this
    let departments=[]
    let grades=[]
    let classesObject={}
    wx.showLoading({
      title: ' ',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    db.collection('studentInfo')
      .doc('b00064a76086bdfb118611f80933bf98')
      .get().then(res => {
        console.log(res.data)
        departments=res.data.departments;
        grades=res.data.grades;
        classesObject=res.data.classesObject;
        that.setData({
          departments,
          grades,
          classesObject
        })
        wx.cloud.callFunction({
          name: 'getUserInfo'
        }).then(res => {
          let info = res.result.info
          that.data.courseKey = info[0].myClass   //缓存key
          console.log('要清除数据的班级',that.data.courseKey) 
          console.log('info',info)
          if (info && info.length > 0) {
            let departmentsIndex=0
            let gradesIndex=0
            let classesIndex=0
            for(let i=0;i<departments.length;i++){
              if(departments[i]==info[0].myDepartment){
                departmentsIndex=i;
                break;
              }
            }
            for(let i=0;i<grades.length;i++){
              if(grades[i]==info[0].myGrade){
                gradesIndex=i;
                break;
              }
            }
            for(let i=0;i<classesObject[info[0].myDepartment + info[0].myGrade].length;i++){
              if(classesObject[info[0].myDepartment + info[0].myGrade][i]==info[0].myClass){
                classesIndex=i;
                break;
              }
            }
            if(!info[0].count){
              info[0].count=1
            }
            that.setData({
              myClass: info[0].myClass,
              myDepartment: info[0].myDepartment,
              myGrade: info[0].myGrade,
              departmentsIndex,
              gradesIndex,
              classesIndex,
              classes:classesObject[info[0].myDepartment + info[0].myGrade],
              count:info[0].count
            })
          }
        }).catch(res => {
          console.log(res)
        })
      }).catch(res => {
       console.log(res)
      })
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

  }
})