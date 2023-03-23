import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: Mục cấu hình định tuyến
 *
 * hidden: true                     // 当Khi đúng được đặt, tuyến đường sẽ không xuất hiện trên thanh bên của phía bên như 401, đăng nhập và các trang khác hoặc một số biên tập viên/chỉnh sửa/1
 * alwaysShow: true                 // Khi định tuyến của trẻ em bên dưới tuyến đường của bạn lớn hơn một, nó sẽ tự động trở thành chế độ lồng nhau như trang thành phần
 *                                  // Khi chỉ có một
 *                                  // Nếu bạn nghĩ rằng số lượng trẻ em được tuyên bố ở dưới cùng của tuyến đường, hãy hiển thị định tuyến gốc của bạn
 *                                  // Bạn có thể đặt luôn luôn: Đúng để nó sẽ bỏ qua các quy tắc được xác định trước và luôn hiển thị tuyến đường gốc
 * redirect: noRedirect             // Bao quanh noRedirect Khi đó, tuyến đường phải
 * name:'router-name'               // Đặt tên của định tuyến, hãy chắc chắn điền vào nó<keep-alive>Sẽ có nhiều vấn đề khác nhau mọi lúc
 * query: '{"id": 1, "name": "ry"}' // Truy cập tham số truyền mặc định của tuyến đường
 * roles: ['admin', 'common']       // Truy cập vai trò của định tuyến
 * permissions: ['a:a:a', 'b:b:b']  // Ghé thăm các quyền menu định tuyến
 * meta : {
    noCache: true                   // Nếu được đặt thành true，Không. <keep-alive>Bộ đệm (mặc địnhfalse)
    title: 'title'                  // Đặt tên được hiển thị trong thanh bên và gàu bánh mì
    icon: 'svg-name'                // Đặt biểu tượng của định tuyến, đường dẫn tương ứng src/assets/icons/svg
    breadcrumb: false               // Nếu được đặt thành false，Không breadcrumb Hiển thị trong vụn bánh mì
    activeMenu: '/system/user'      // Khi định tuyến được đặt, nó sẽ được tiết lộ tại thanh bên tương ứng.
  }
 */

// Lộ trình
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/index'),
        name: 'Index',
        meta: { title: 'Trang chủ', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: 'Thông tin cá nhân', icon: 'user' }
      }
    ]
  }
]

// Định tuyến động, tải dựa trên động lực học của người dùng
export const dynamicRoutes = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: 'Gán vai trò', activeMenu: '/system/user' }
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser'),
        name: 'AuthUser',
        meta: { title: 'Phân bổ người dùng', activeMenu: '/system/role' }
      }
    ]
  },
  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data'),
        name: 'Data',
        meta: { title: 'Dữ liệu từ điển', activeMenu: '/system/dict' }
      }
    ]
  },
  {
    path: '/monitor/job-log',
    component: Layout,
    hidden: true,
    permissions: ['monitor:job:list'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/monitor/job/log'),
        name: 'JobLog',
        meta: { title: 'Xác định nhật ký', activeMenu: '/monitor/job' }
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable'),
        name: 'GenEdit',
        meta: { title: 'Cấu hình thế hệ SửA', activeMenu: '/tool/gen' }
      }
    ]
  }
]

// Ngăn chặn nhiều lỗi định tuyến để nhấp vào liên tục
let routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(err => err)
}

export default new Router({
  mode: 'history', // Tháo URL#
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})
