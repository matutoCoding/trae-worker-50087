export default defineAppConfig({
  pages: [
    'pages/schedule/index',
    'pages/ceremony/index',
    'pages/cases/index',
    'pages/profile/index',
    'pages/schedule-detail/index',
    'pages/schedule-add/index',
    'pages/eulogy/index',
    'pages/family/index',
    'pages/religion/index',
    'pages/settlement/index',
    'pages/case-detail/index',
    'pages/delivery/index',
    'pages/review/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2C5282',
    navigationBarTitleText: '殡仪司仪服务',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F7FAFC'
  },
  tabBar: {
    color: '#718096',
    selectedColor: '#2C5282',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/schedule/index',
        text: '档期'
      },
      {
        pagePath: 'pages/ceremony/index',
        text: '流程'
      },
      {
        pagePath: 'pages/cases/index',
        text: '案例'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
