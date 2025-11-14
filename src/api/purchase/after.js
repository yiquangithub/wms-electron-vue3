import request from '@/utils/request'

// 01.售后列表
export function getAfterList(query) {
  return request({
    url: '/purchase/after/sales/list',
    method: 'get',
    params: query,
  })
}
// 02.新增售后
export function addAfter(data) {
  return request({
    url: '/purchase/after/sales',
    method: 'post',
    data: data,
  })
}

// 03.修改售后
export function updateAfter(data) {
  return request({
    url: '/purchase/after/sales',
    method: 'put',
    data: data,
  })
}
// 04.查询售后信息
export function getAfterInfo(id) {
  return request({
    url: '/purchase/after/sales/' + id,
    method: 'get',
  })
}
