import request from '@/utils/request';

/**
 * @description 获取工序列表数据（分页）
 * @param {object} data 
 * @returns {object}
 */
export const getWorkProcessList = (data) => {
    return request({
        url: '/workprocess/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取所有工序数据（下拉框）
 * @param {object} data 
 * @returns {object}
 */
export const getAllWorkProcess = (data) => {
    return request({
        url: '/workprocess/all',
        method: 'post',
        data
    })
}

/**
 * @description 添加或编辑工序
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditWorkProcess = (data) => {
    return request({
        url: '/workprocess/save',
        method: 'post',
        data
    })
}

/**
 * @description 删除工序
 * @param {object} data 
 * @returns {object}
 */
export const deleteWorkProcess = (data) => {
    return request({
        url: '/workprocess/delete',
        method: 'post',
        data
    })
}

/**
 * @description 获取工序详情
 * @param {object} data 
 * @returns {object}
 */
export const getWorkProcessDetail = (data) => {
    return request({
        url: '/workprocess/show',
        method: 'post',
        data
    })
}

/**
 * @description 启用/禁用工序
 * @param {object} data 
 * @returns {object}
 */
export const enableWorkProcess = (data) => {
    return request({
        url: '/workprocess/enabled',
        method: 'post',
        data
    })
}
