import request from '@/utils/request'

// Truy vấn bộ nhớ cache chi tiết
export function getCache() {
  return request({
    url: '/monitor/cache',
    method: 'get'
  })
}