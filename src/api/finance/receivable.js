import request from '@/utils/request'

// 01.应收款项汇总
export const getReceivableSummary = () => {
  return request({
    url: '/accounts/receivable/summary',
    method: 'get',
  })
}
// 02.应收款项趋势
export const getReceivableTrend = (id) => {
  return request({
    url: '/accounts/receivable/trend/' + id,
    method: 'get',
  })
}
// 03.应收款项明细
export const getReceivableDetails = (query) => {
  return request({
    url: '/accounts/receivable/details',
    method: 'get',
     params: query,
  })
}
// 04.根据Id查询上传凭证
export const uploadReceivable = (id) => {
  return request({
    url: '/accounts/receivable/upload/credentials/' + id,
    method: 'get',
  })
}
// 05.保存上传凭证
export const saveReceivable = (data) => {
  return request({
    url: '/accounts/receivable/upload/credentials',
    data:data,
    method: 'post',
  })
}