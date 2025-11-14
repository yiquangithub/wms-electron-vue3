import request from '@/utils/request'

// 01.应付款项汇总
export const getPayableSummary = () => {
  return request({
    url: '/accounts/payable/summary',
    method: 'get',
  })
}
// 02.应付款项趋势
export const getPayableTrend = (id) => {
  return request({
    url: '/accounts/payable/trend/' + id,
    method: 'get',
  })
}
// 03.应付款项明细
export const getPayableDetails = (query) => {
  return request({
    url: '/accounts/payable/details',
    method: 'get',
    params: query,
  })
}
// 04.根据Id查询上传凭证
export const uploadPayable = (id) => {
  return request({
    url: '/accounts/payable/upload/credentials/' + id,
    method: 'get',
  })
}
// 05.保存上传凭证
export const savePayable = (data) => {
  return request({
    url: '/accounts/payable/upload/credentials',
    data: data,
    method: 'post',
  })
}
