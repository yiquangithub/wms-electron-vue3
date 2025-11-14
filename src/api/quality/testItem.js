import request from '@/utils/request';

/**
 * @description 自动获取编码
 * @param {object} data 
 * @returns {object}
 */
export const autoGetCode = (data) => {
    return request({
        url: '/quality/check/items/autoCode',
        method: 'post',
        data
    })
}

/**
 * @description 获取检测项列表
 * @param {object} data 
 * @returns {object}
 */
export const getTestItemList = (data) => {
    return request({
        url: '/quality/check/items/list',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改检测项
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditTestItem = (data) => {
    return request({
        url: '/quality/check/items/save',
        method: 'post',
        data
    })
}

/**
 * @description 删除检测项
 * @param {object} data 
 * @returns {object}
 */
export const deleteTestItem = (data) => {
    return request({
        url: '/quality/check/items/delete',
        method: 'post',
        data
    })
}

/**
 * @description 获取检测项详情
 * @param {object} data 
 * @returns {object}
 */
export const getTestItemDetail = (data) => {
    return request({
        url: '/quality/check/items/show',
        method: 'post',
        data
    })
}