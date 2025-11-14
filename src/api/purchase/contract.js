import request from '@/utils/request'
// 采购合同
// 01.采购合同列表
export function getContactList(query) {
  return request({
    url: '/purchase/contract/list',
    method: 'get',
    params: query,
  })
}

// 02.新增合同
export function addContact(data) {
  return request({
    url: '/purchase/contract',
    method: 'post',
    data: data,
  })
}

// 03.修改合同
export function updateContact(data) {
  return request({
    url: '/purchase/contract',
    method: 'put',
    data: data,
  })
}

// 04.查看合同信息 编辑用
export function contactInfo(contractId) {
  return request({
    url: '/purchase/contract/' + contractId,
    method: 'get',
  })
}

// 05.合同详情
export function contactDetails(contractId) {
  return request({
    url: '/purchase/contract/details/' + contractId,
    method: 'get',
  })
}

// 06.删除合同
export function deleteContact(data) {
  return request({
    url: '/purchase/contract/' + data,
    method: 'delete',
  })
}
// 07.获取合同关联的物料信息
export function getContactMaterialShow(contractId) {
  return request({
    url: '/purchase/contract/materials/show/' + contractId,
    method: 'get',
  })
}
// 08.删除合同物料信息
export function deleteContactMaterial(contractId) {
  return request({
    url: '/purchase/contract/materials/delete/' + contractId,
    method: 'delete',
  })
}
// 09.删除合同附件信息
export function deleteContactAttachments(contractId) {
  return request({
    url: '/purchase/contract/attachments/delete/' + contractId,
    method: 'delete',
  })
}
// 10.预览合同
export function previewContact(data) {
  return request({
    url: '/purchase/contract/preview',
    method: 'post',
    data: data,
  })
}
// 11.导出合同pdf
export function exportContact(contractId) {
  return request({
    url: '/purchase/contract/export/pdf' + contractId,
    method: 'get',
  })
}
// 12.提审或取消提审记录
export function publishedContact(data) {
  return request({
    url: '/purchase/contract/published',
    method: 'post',
    data: data,
  })
}
// 13.根据id查看审核详情
export function checkContact(id) {
  return request({
    url: '/purchase/contract/check/' + id,
    method: 'get',
  })
}

// 获取所有采购合同
export function getAllContactList(query) {
  return request({
    url: '/purchase/contract/all',
    method: 'get',
    params: query,
  })
}
// 14.导出合同价格明细
export function exportContactPrice(data) {
  return request({
    url: '/purchase/contract/export/price',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}
