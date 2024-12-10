const routes = [
  { path: '/', component: homePage },
]

const router = VueRouter.createRouter({
  //history: VueRouter.createMemoryHistory(),
  history: VueRouter.createWebHashHistory(),
  routes,
})