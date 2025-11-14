import request from '@/utils/request'

// 01.我的合同
export function getContactList(query) {
  return request({
    url: '/sales/contract/list',
    method: 'get',
    params: query,
  })
}

// 02.新增合同
export function addContact(data) {
  return request({
    url: '/sales/contract',
    method: 'post',
    data: data,
  })
}

// 03.修改合同
export function updateContact(data) {
  return request({
    url: '/sales/contract',
    method: 'put',
    data: data,
  })
}

// 04.查看合同信息 编辑用
export function contactInfo(contractId) {
  return request({
    url: '/sales/contract/' + contractId,
    method: 'get',
  })
}

// 05.合同详情
export function contactDetails(contractId) {
  return request({
    url: '/sales/contract/details/' + contractId,
    method: 'get',
  })
}

// 06.删除合同
export function deleteContact(data) {
  return request({
    url: '/sales/contract/' + data,
    method: 'delete',
  })
}
// 07.获取合同关联的物料信息
export function getContactMaterialShow(contractId) {
  return request({
    url: '/sales/contract/materials/show/' + contractId,
    method: 'get',
  })
}
// 08.删除合同物料信息
export function deleteContactMaterial(contractId) {
  return request({
    url: '/sales/contract/materials/delete/' + contractId,
    method: 'delete',
  })
}
// 09.删除合同附件信息
export function deleteContactAttachments(contractId) {
  return request({
    url: '/sales/contract/attachments/delete/' + contractId,
    method: 'delete',
  })
}
// 10.预览合同
export function previewContact(data) {
  return request({
    url: '/sales/contract/preview',
    method: 'post',
    data: data,
  })
}
// 11.导出合同pdf
export function exportContact(contractId) {
   return request({
    url: '/sales/contract/export/pdf' + contractId,
    method: 'get',
  })
}
// 12.提审或取消提审记录
export function publishedContact(data) {
  return request({
    url: '/sales/contract/published',
    method: 'post',
    data: data,
  })
}
// 13.根据id查看审核详情
export function checkContact(id) {
   return request({
    url: '/sales/contract/check/' + id,
    method: 'get',
  })
}
// 14.采购查看合同列表
export function getPurchaseContactList(query) {
  return request({
    url: '/sales/contract/list/purchase',
    method: 'get',
    params: query,
  })
}
// 15.采购单数据初始化查询
export function batchPurchase(ids) {
  return request({
    url: '/sales/contract/purchase/batch/' + ids,
    method: 'get',
  })
}
