import request from '@/utils/request';

/**
 * @description 获取工单列表数据（分页）
 * @param {object} data 
 * @returns {object}
 */
export const getWorkOrderList = (data) => {
    return request({
        url: '/workorder/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取工单类型数据（下拉框）
 * @param {object} data 
 * @returns {object}
 */
export const getWorkOrderItems = (data) => {
    return request({
        url: '/workorder/query/items',
        method: 'post',
        data
    })
}

/**
 * @description 添加或编辑工单
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditWorkOrder = (data) => {
    return request({
        url: '/workorder/save',
        method: 'post',
        data
    })
}

/**
 * @description 获取工单详情
 * @param {object} data 
 * @returns {object}
 */
export const getWorkOrderDetail = (data) => {
    return request({
        url: '/workorder/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除工单
 * @param {object} data 
 * @returns {object}
 */
export const deleteWorkOrder = (data) => {
    return request({
        url: '/workorder/delete',
        method: 'post',
        data
    })
}

/**
 * @description 批量确认
 * @param {object} data 
 * @returns {object}
 */
export const batchConfirm = (data) => {
    return request({
        url: '/workorder/batch/confirm',
        method: 'post',
        data
    })
}

/**
 * @description 批量结案
 * @param {object} data 
 * @returns {object}
 */
export const batchFinish = (data) => {
    return request({
        url: '/workorder/batch/finish',
        method: 'post',
        data
    })
}

/**
 * @description 查询所有工单信息(下拉框)
 * @param {object} data 
 * @returns {object}
 */
export const getAllWorkOrders = (data) => {
    return request({
        url: '/workorder/all',
        method: 'post',
        data
    })
}
