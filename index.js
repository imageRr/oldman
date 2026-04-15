import { createRouter, createWebHashHistory } from 'vue-router'
import shouye from '@/components/shouye.vue'
import llNursingLevel from '@/views/llNursingLevel.vue'
import llNursingProject from '@/views/llNursingProject.vue'
import llCustomerSettings from '@/views/llCustomerSettings.vue'
import llNursingRecords from '@/views/llNursingRecords.vue'

const routes = [
  {
    path: '/',
    name: 'shouye',
    component: shouye,
    children:[
      {
        path: '/care-level',
        name: 'llNursingLevel',
        component: llNursingLevel
      },
      {
        path: '/care-items',
        name: 'llNursingProject',
        component: llNursingProject
      },
      {
        path: '/care-settings',
        name: 'llCustomerSettings',
        component: llCustomerSettings
      },
      {
        path: '/care-records',
        name: 'llNursingRecords',
        component: llNursingRecords
      }
    ]
  },
  
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})


export default router