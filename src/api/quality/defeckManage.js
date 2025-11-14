import request from '@/utils/request';

/**
 * @description 获取基础数据
 * @param {object} data 
 * @returns {object}
 */
export const getDefectBaseData = (data) => {
    return request({
        url: '/quality/defects/items',
        method: 'get',
        params: data
    })
}

/**
 * @description 获取缺陷列表
 * @param {object} data 
 * @returns {object}
 */
export const getDefectList = (data) => {
    return request({
        url: '/quality/defects/list',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改缺陷
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditDefect = (data) => {
    return request({
        url: '/quality/defects/save',
        method: 'post',
        data
    })
}

/**
 * @description 删除缺陷
 * @param {object} data 
 * @returns {object}
 */
export const deleteDefect = (data) => {
    return request({
        url: '/quality/defects/delete',
        method: 'post',
        data
    })
}

/**
 * @description 获取缺陷详情
 * @param {object} data 
 * @returns {object}
 */
export const getDefectDetail = (data) => {
    return request({
        url: '/quality/defects/show',
        method: 'post',
        data
    })
}