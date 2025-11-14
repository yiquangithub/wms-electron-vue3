import request from '@/utils/request';

/**
 * @description 获取计量单位列表
 * @param {object} data 
 * @returns {object}
 */
export const getUnitList = (data) => {
    return request({
        url: '/calculate/unit/list',
        method: 'post',
        data
    })
}

/**
 * @description 查询所有计量单位,用于下拉列表显示
 * @param {object}  data
 * @returns {object}
 */
export const getUnitDownlodList = (data) => {
    return request({
        url: '/calculate/unit/all',
        method: 'post',
        data
    })
}

/**
 * @description 新增或编辑计量单位
 * @param {object} data
 * @returns {object}
 */
export const addOrEditUnit = (data) => {
    return request({
        url: '/calculate/unit/save',
        method: 'post',
        data
    })
}

/**
 * @description 删除计量单位
 * @param {object} data
 * @returns {object}
 */
export const deleteUnit = (data) => {
    return request({
        url: '/calculate/unit/delete',
        method: 'post',
        data
    })
}

/**
 * @description 获取计量单位详情
 * @param {object} data
 * @returns {object}
 */
export const getUnitDetail = (data) => {
    return request({
        url: '/calculate/unit/show',
        method: 'post',
        data
    })
}



