import request from '@/utils/request'

// 01.采购物品明细
export function purchaseInquiry(id) {
  return request({
    url: '/inquiry/details/' + id,
    method: 'get',
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}
// 02.采购单询价比价分页列表
export function listInquiryPage(query) {
  return request({
    url: '/inquiry/list',
    method: 'get',
    params: query,
  })
}

// 02.采购单询价比价列表
export function listInquiry(id) {
  return request({
    url: '/inquiry/list/' + id,
    method: 'get',
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}
// 03.获取采购单询价比价详细信息
export function detailsInquiry(id) {
  return request({
    url: '/inquiry/' + id,
    method: 'get',
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}
//--
// 04.新增采购单询价比价
export function addInquiry(data) {
  return request({
    url: '/inquiry',
    method: 'post',
    data: data,
  })
}

// 05.修改采购单询价比价
export function updateInquiry(data) {
  return request({
    url: '/inquiry',
    method: 'put',
    data: data,
  })
}
// 06.删除采购单询价比价
export function deleteInquiry(id) {
  return request({
    url: '/inquiry/' + id,
    method: 'delete',
  })
}
// 08.推荐供应商信息
export function recommendInquiry(id) {
  return request({
    url: '/inquiry/recommend/' + id,
    method: 'get',
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}
// 09.获取采购单关联的物料信息
export function showMaterialsInquiry(id) {
  return request({
    url: '/inquiry/materials/show/' + id,
    method: 'get',
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}
// 10.删除采购单物料信息
export function deleteMaterialsInquiry(id) {
  return request({
    url: '/inquiry/materials/delete/' + id,
    method: 'delete',
  })
}
