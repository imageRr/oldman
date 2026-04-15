import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import shouye from '@/components/shouye.vue'
import Bedlayout from '@/components/bedlayout.vue'
import Bedmanagement from '@/components/bedmanagement.vue'
import customerlist from '@/components/customerlist.vue'
import CheckInDialog from '@/components/CheckInDialog.vue'
import GoRegi from '@/components/GoRegi.vue'
import Checkout from '@/components/Checkout.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    name: 'shouye',
    component: shouye,
    children: [
      {
        path: 'bedlayout',        
        name: 'bedlayout',
        component: Bedlayout
      },
      {
        path: 'bedmanagement',
        name: 'bedmanagement',
        component: Bedmanagement
      },
      {
        path: 'customerlist',
        name: 'customerlist',
        component: customerlist
      },
      {
        path: 'CheckInDialog',
        name: 'CheckInDialog',
        component: CheckInDialog
      },
      {
        path: 'goregi',
        name: 'goregi',
        component: GoRegi
      },
      {
        path: 'checkout',
        name: 'checkout',
        component: Checkout
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),  
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (authRequired && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
