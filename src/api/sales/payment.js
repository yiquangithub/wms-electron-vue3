import request from '@/utils/request'

// 01.合同回款计划列表
export function getPaymentList(id) {
  return request({
    url: '/sales/contract/payment/list/' + id,
    method: 'get',
  })
}

// 02.获取合同回款计划信息
export function getPayment(id) {
  return request({
    url: '/sales/contract/payment/' + id,
    method: 'get',
  })
}
// 03.新增合同回款计划信息
export function addPayment(data) {
  return request({
    url: '/sales/contract/payment',
    method: 'post',
    data: data,
  })
}
// 04.修改合同回款计划信息
export function updatePayment(data) {
  return request({
    url: '/sales/contract/payment',
    method: 'put',
    data: data,
  })
}

// 05.删除合同回款计划信息
export function deletePayment(data) {
  return request({
    url: '/sales/contract/payment/' + data,
    method: 'delete',
  })
}

// 07.计划汇总信息
export function getPaymentSummary(id) {
  return request({
    url: '/sales/contract/payment/summary/' + id,
    method: 'get',
  })
}
// 08.合同回款计划列表(不分页)
export function getPaymentAll(id) {
  return request({
    url: '/sales/contract/payment/all/' + id,
    method: 'get',
  })
}
// 09.收款记录
export function getPaymentRecords(id) {
  return request({
    url: '/sales/contract/payment/records/' + id,
    method: 'get',
  })
}
