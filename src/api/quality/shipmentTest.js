import request from '@/utils/request';

/**
 * @description 自动获取编码
 * @returns {object}
 */
export const autoShipmentTestCode = (data) => {
    return request({
        url: '/delivery/inspection/autoCode',
        method: 'post',
        data
    })
}

/**
 * @description 获取发货检测列表
 * @param {object} data 
 * @returns {object}
 */
export const getShipmentTestList = (data) => {
    return request({
        url: '/delivery/inspection/list',
        method: 'post',
        data
    })
}

/**
 * @description 新增或修改发货检测
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditShipmentTest = (data) => {
    return request({
        url: '/delivery/inspection/save',
        method: 'post',
        data
    })
}

/**
 * @description 删除发货检测
 * @param {object} data 
 * @returns {object}
 */
export const deleteShipmentTest = (data) => {
    return request({
        url: '/delivery/inspection/delete',
        method: 'post',
        data
    })
}

/**
 * @description 获取发货检测详情
 * @param {object} data
 * @returns {object}
 */
export const getShipmentTestDetail = (data) => {
    return request({
        url: '/delivery/inspection/show',
        method: 'post',
        data
    })
}