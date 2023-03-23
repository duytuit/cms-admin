import { Message, MessageBox, Notification, Loading } from 'element-ui'

let loadingInstance;

export default {
  // thông báo
  msg(content) {
    Message.info(content)
  },
  // thông tin sai
  msgError(content) {
    Message.error(content)
  },
  // Tin tức thành công
  msgSuccess(content) {
    Message.success(content)
  },
  // Tin nhắn cảnh báo
  msgWarning(content) {
    Message.warning(content)
  },
  // Bật lên
  alert(content) {
    MessageBox.alert(content, "Gợi ý hệ thống")
  },
  // Thông báo lỗi
  alertError(content) {
    MessageBox.alert(content, "Gợi ý hệ thống", { type: 'error' })
  },
  // Nhắc nhở thành công
  alertSuccess(content) {
    MessageBox.alert(content, "Gợi ý hệ thống", { type: 'success' })
  },
  // Cảnh báo
  alertWarning(content) {
    MessageBox.alert(content, "Gợi ý hệ thống", { type: 'warning' })
  },
  // Lời nhắc thông báo
  notify(content) {
    Notification.info(content)
  },
  // Thông báo lỗi
  notifyError(content) {
    Notification.error(content);
  },
  // Thông báo thành công
  notifySuccess(content) {
    Notification.success(content)
  },
  // Thông báo cảnh báo
  notifyWarning(content) {
    Notification.warning(content)
  },
  // Xác nhận cửa sổ
  confirm(content) {
    return MessageBox.confirm(content, "Gợi ý hệ thống", {
      confirmButtonText: 'Chắc chắn rồi',
      cancelButtonText: 'Hủy bỏ',
      type: "warning",
    })
  },
  // Đã gửi nội dung
  prompt(content) {
    return MessageBox.prompt(content, "Gợi ý hệ thống", {
      confirmButtonText: 'Chắc chắn rồi',
      cancelButtonText: 'Hủy bỏ',
      type: "warning",
    })
  },
  // Mở lớp mặt nạ
  loading(content) {
    loadingInstance = Loading.service({
      lock: true,
      text: content,
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)",
    })
  },
  // Tắt lớp mặt nạ
  closeLoading() {
    loadingInstance.close();
  }
}
