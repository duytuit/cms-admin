import axios from 'axios'
import { Notification, MessageBox, Message, Loading } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from "@/utils/ruoyi";
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'

let downloadLoadingInstance;
// Có thể hiển thị re-login không
export let isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// tạo ra axios Ví dụ
const service = axios.create({
  // axios Cấu hình yêu cầu được cấu hình với tùy chọn BaseURL, cho biết rằng phần công khai URL yêu cầu
  baseURL: process.env.VUE_APP_BASE_API,
  // hết giờ
  timeout: 10000
})

// request Đánh chặn
service.interceptors.request.use(config => {
  // Bạn có cần cài đặt token
  const isToken = (config.headers || {}).isToken === false
  // Bạn có cần ngăn dữ liệu gửi liên tục
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // Hãy để mỗi yêu cầu mang theo mã thông báo tùy chỉnh, vui lòng tự mình theo tình huống thực tế Sửa
  }
  // get Yêu cầu ánh xạ params tham số
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params);
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url;                  // Địa chỉ yêu cầu
      const s_data = sessionObj.data;                // Yêu cầu dữ liệu
      const s_time = sessionObj.time;                // Thời gian yêu cầu
      const interval = 1000;                         // Thời gian khoảng (MS), ít hơn thời gian này được coi là được gửi liên tục
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = 'Dữ liệu đang được xử lý, vui lòng không gửi nhiều lần';
        console.warn(`[${s_url}]: ` + message)
        return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

// Phản ứng đánh chặn
service.interceptors.response.use(res => {
    // Không được thiết lập Trạng thá Tôi mã là thành công mặc định Trạng thái
    const code = res.data.code || 200;
    // Nhận thông báo lỗi
    const msg = errorCode[code] || res.data.msg || errorCode['default']
    // Dữ liệu nhị phân được trả về trực tiếp
    if(res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer'){
      return res.data
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        MessageBox.confirm('Đăng nhập Trạng thái Đã hết hạn, bạn có thể ở trên trang này hoặc đăng nhập ',' dấu nhắc hệ thống ', {
          confirmButtonText: 'Đăng ký lại',
          cancelButtonText: 'Hủy bỏ',
          type: 'warning'
        }
      ).then(() => {
        isRelogin.show = false;
        store.dispatch('LogOut').then(() => {
          location.href = '/index';
        })
      }).catch(() => {
        isRelogin.show = false;
      });
    }
      return Promise.reject('Phiên bất động, hoặc cuộc trò chuyện đã hết hạn, vui lòng đăng nhập lại.')
    } else if (code === 500) {
      Message({
        message: msg,
        type: 'error'
      })
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      Notification.error({
        title: msg
      })
      return Promise.reject('error')
    } else {
      return res.data
    }
  },
  error => {
    console.log('err' + error)
    let { message } = error;
    if (message == "Network Error") {
      message = "Kết nối giao diện trở lại bất thường";
    }
    else if (message.includes("timeout")) {
      message = "Thời gian chờ yêu cầu giao diện hệ thống";
    }
    else if (message.includes("Request failed with status code")) {
      message = "Giao diện hệ thống" + message.substr(message.length - 3) + "khác thường";
    }
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

// Phương thức tải xuống GM
export function download(url, params, filename) {
  downloadLoadingInstance = Loading.service({ text: "Tải xuống dữ liệu, vui lòng đợi ", spinner: "el-icon-loading", background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, params, {
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob'
  }).then(async (data) => {
    const isLogin = await blobValidate(data);
    if (isLogin) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      const resText = await data.text();
      const rspObj = JSON.parse(resText);
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
      Message.error(errMsg);
    }
    downloadLoadingInstance.close();
  }).catch((r) => {
    console.error(r)
    Message.error('Nếu có lỗi trong tệp tải xuống, vui lòng liên hệ với quản trị viên!')
    downloadLoadingInstance.close();
  })
}

export default service
