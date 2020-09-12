import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../component/Login'
// import Home from '../component/Home'
// import Users from '../component/user/Users'

// import Rights from '../component/power/Rights'
// import Roles from '../component/power/Roles'

// import Cate from '../component/goods/Cate'
// import Params from '../component/goods/Params'
// import List from '../component/goods/List'
// import Add from '../component/goods/Add'

// import order from '../component/order/order'
// import report from '../component/report/report'


const Login = () => import(/* webpackChunkName: "login_home_users" */ '../component/Login')
const Home = () => import(/* webpackChunkName: "login_home_users" */ '../component/Home')
const Users = () => import(/* webpackChunkName: "login_home_users" */ '../component/user/Users')

const Rights = () => import(/* webpackChunkName: "power" */ '../component/power/Rights')
const Roles = () => import(/* webpackChunkName: "power" */ '../component/power/Roles')

const Cate = () => import(/* webpackChunkName: "goods" */ '../component/goods/Cate')
const Params = () => import(/* webpackChunkName: "goods" */ '../component/goods/Params')
const List = () => import(/* webpackChunkName: "goods" */ '../component/goods/List')
const Add = () => import(/* webpackChunkName: "goods" */ '../component/goods/Add')

const order = () => import(/* webpackChunkName: "order_report" */ '../component/order/order')
const report = () => import(/* webpackChunkName: "order_report" */ '../component/report/report')


Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/users',
    children: [
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/orders', component: order },
      { path: '/goods/add', component: Add },
      { path: '/reports', component: report },

    ]
  },
]
// 解决代码冗余报错
const originalPush = VueRouter.prototype.push
   VueRouter.prototype.push = function push(location) {
   return originalPush.call(this, location).catch(err => err)
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});
router.beforeEach((to, from, next) => {
  // to表示去哪里，from表示哪里来，next表示继续
  const logintoken = window.sessionStorage.getItem('token');
  if (to.path === '/login') {
    return next();
  }
  if (logintoken) {
    return next();
  } else {
    return next('/login');
  }
})
export default router
