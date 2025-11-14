import request from '@/utils/request'

/**
 * @description 01.获取往来单位分类树
 * @param {object} data
 * @returns {object}
 */
export function getContactTreeList(data) {
  return request({
    url: '/contact/units/category/tree',
    method: 'post',
    data,
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}

/**
 * @description 02.根据分类查询往来单位列表
 * @param {object} data 查询参数
 * @returns {object}
 */
export const getContactList = (data) => {
  return request({
    url: '/contact/units/list',
    method: 'post',
    data,
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}
/**
 * @description 03.查询往来单位联系人
 * @param {object} data 查询参数
 * @returns {object}
 */
export const getContactUnitsList = (data) => {
  return request({
    url: '/contact/units/contacts/list',
    method: 'post',
    data,
  })
}
