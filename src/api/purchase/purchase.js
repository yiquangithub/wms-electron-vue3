import request from '@/utils/request'

// 01.采购单列表
export function getPurchaseList(query) {
  return request({
    url: '/purchase/list',
    method: 'post',
    params: query,
  })
}
// 02.新增采购单
export function addPurchase(data) {
  return request({
    url: '/purchase',
    method: 'post',
    data: data,
  })
}

// 03.修改采购单
export function updatePurchase(data) {
  return request({
    url: '/purchase',
    method: 'put',
    data: data,
  })
}
// 04.获取详细信息
export function detailsPurchase(id) {
  return request({
    url: '/purchase/' + id,
    method: 'get',
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}
// 05.删除采购单
export function deletePurchase(id) {
  return request({
    url: '/purchase/' + id,
    method: 'delete',
  })
}
// 07.获取采购单关联的物料信息
export function showMaterialsPurchase(id) {
  return request({
    url: '/purchase/materials/show/' + id,
    method: 'get',
  })
}
// 08.删除采购单物料信息
export function deleteMaterialsPurchase(id) {
  return request({
    url: '/purchase/materials/delete/' + id,
    method: 'delete',
  })
}
// 09.批量新增采购单
export function addBatchPurchase(data) {
  return request({
    url: '/purchase/batch',
    method: 'post',
    data: data,
  })
}
// 10.所有采购单
export function getPurchaseAll() {
  return request({
    url: '/purchase/all',
    method: 'post',
  })
}
// 11.批量获取采购单关联的物料信息
export function getPurchaseMaterials(ids) {
  return request({
    url: '/purchase/materials/' + ids,
    method: 'get',
  })
}
// 12.采购单数据初始化查询
export function getPurchaseMaterialsBom(ids) {
  return request({
    url: '/sales/contract/purchase/batch/' + ids,
    method: 'get',
  })
}
