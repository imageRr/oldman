// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import shouye from '@/components/shouye.vue'
import Bedlayout from '@/components/bedlayout.vue'
import Bedmanagement from '@/components/bedmanagement.vue'
import customerlist from '@/components/customerlist.vue'
// 直接引入组件，不需要再包装 CheckInPage
import CheckInDialog from '@/components/CheckInDialog.vue' 

const routes = [
  {
    path: '/',
    name: 'shouye',
    component: shouye,
    children: [
      {
        path: '/bedlayout',
        name: 'bedlayout',
        component: Bedlayout
      },
      {
        path: '/bedmanagement',
        name: 'bedmanagement',
        component: Bedmanagement
      },
      {
        path: '/customerlist',
        name: 'customerlist',
        component: customerlist
      },
      {
        path: '/CheckInDialog',
        name: 'CheckInDialog',
        component: CheckInDialog // 直接使用组件
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router