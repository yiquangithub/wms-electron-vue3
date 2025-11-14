import request from '@/utils/request'

// 01.采购查看合同列表
export function getPurchaseContactList(query) {
  return request({
    url: '/sales/contract/list/purchase',
    method: 'get',
    params: query,
  })
}
// 02.采购单数据初始化查询
export function batchPurchase(ids) {
  return request({
    url: '/sales/contract/purchase/batch/' + ids,
    method: 'get',
  })
}
