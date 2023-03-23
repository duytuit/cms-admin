import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isRelogin } from '@/utils/request'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect', '/bind', '/register']

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && store.dispatch('settings/setTitle', to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      if (store.getters.roles.length === 0) {
        isRelogin.show = true
        // Xác định xem người dùng hiện tại có bị kéo lên không user_info thông tin
        store.dispatch('GetInfo').then(() => {
          isRelogin.show = false
          store.dispatch('GenerateRoutes').then(accessRoutes => {
            // dựa theo roles Bảng định tuyến có thể tạo vĩnh viễn
            router.addRoutes(accessRoutes) // Động thêm bảng định tuyến có thể truy cập
            next({ ...to, replace: true }) // hack Các phương pháp để đảm bảo rằng các phần bổ sung đã được hoàn thành
          })
        }).catch(err => {
            store.dispatch('LogOut').then(() => {
              Message.error(err)
              next({ path: '/' })
            })
          })
      } else {
        next()
      }
    }
  } else {
    // Không token
    if (whiteList.indexOf(to.path) !== -1) {
      // Trong danh sách ghi nhật ký miễn phí, hãy trực tiếp vào
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // Nếu không, tất cả chuyển hướng đến trang đăng nhập
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
