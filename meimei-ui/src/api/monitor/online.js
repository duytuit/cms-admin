import request from '@/utils/request'

// Truy vấn danh sách người dùng trực tuyến
export function list(query) {
  return request({
    url: '/monitor/online/list',
    method: 'get',
    params: query
  })
}

// Người dùng nghỉ hưu mạnh mẽ
export function forceLogout(tokenId) {
  return request({
    url: '/monitor/online/' + tokenId,
    method: 'delete'
  })
}
