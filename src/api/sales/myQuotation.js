import request from '@/utils/request'

/**
 * @description 01.我的报价单
 * @param {object} data
 * @returns {object}
 */
export function getMyQuotation(data) {
  return request({
    url: '/quote/price/list',
    method: 'post',
    data,
  })
}

/**
 * @description 02.添加,修改报价单
 * @param {object} data
 * @returns {object}
 */
export function saveQuotation(data) {
  return request({
    url: '/quote/price/save',
    method: 'post',
    data,
  })
}

/**
 * @description 03.获取报价单详细信息
 * @param {object} data
 * @returns {object}
 */
export function getQuotationDetail(data) {
  return request({
    url: '/quote/price/show',
    method: 'post',
    data,
  })
}

/**
 * @description 04.删除报价单
 * @param {object} data
 * @returns {object}
 */
export function deleteQuotation(data) {
  return request({
    url: '/quote/price/delete',
    method: 'post',
    data,
  })
}
/**
 * @description 05.获取报价单关联的物料信息
 * @param {object} data
 * @returns {object}
 */
export function materialsQuotation(data) {
  return request({
    url: '/quote/price/materials/show',
    method: 'post',
    data,
  })
}
/**
 * @description 06.删除物料信息
 * @param {object} data
 * @returns {object}
 */
export function deleteMaterialsQuotation(data) {
  return request({
    url: '/quote/price/materials/delete',
    method: 'post',
    data,
  })
}
/**
 * @description 07.报价单再次报价次数
 * @param {object} data
 * @returns {object}
 */
export function countQuotation(data) {
  return request({
    url: '/quote/price/count',
    method: 'post',
    data,
  })
}
/**
 * @description 08.再次报价初始化信息
 * @param {object} data
 * @returns {object}
 */
export function againQuotation(data) {
  return request({
    url: '/quote/price/again',
    method: 'post',
    data,
  })
}
/**
 * @description 09.保存再次报价信息
 * @param {object} data
 * @returns {object}
 */
export function againSaveQuotation(data) {
  return request({
    url: '/quote/price/again/save',
    method: 'post',
    data,
  })
}
/**
 * @description 10.多次报价详情
 * @param {object} data
 * @returns {object}
 */
export function moreQuotation(data) {
  return request({
    url: '/quote/price/more',
    method: 'post',
    data,
  })
}
/**
 * @description 11.导出报价单
 * @param {object} data
 * @returns {object}
 */
export function exportQuotation(data) {
  return request({
    url: '/quote/price/export/pdf',
    method: 'get',
    data,
  })
}
// 所有项目
export function getProject() {
    return request({
    url: '/project/info/all',
    method: 'get',
  })
}

