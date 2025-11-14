import request from '@/utils/request'

/**
 * @description 01.获取物料分类树
 * @param {object} data
 * @returns {object}
 */
export function getMaterialTreeList(data) {
  return request({
    url: '/material/category/tree',
    method: 'post',
    data,
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}

/**
 * @description 根据分类查询物料列表
 * @param {object} data 查询参数
 * @returns {object}
 */
export const getMaterialList = (data) => {
  return request({
    url: '/material/list',
    method: 'post',
    data,
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}
