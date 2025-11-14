import request from '@/utils/request';

/**
 * @description 自动获取来料检验编码
 * @returns {object}
 */
export const autoIncomingTestCode = () => {
    return request({
        url: '/incoming/inspection/autoCode',
        method: 'post',

    })
}

/**
 * @description 获取来料检测列表
 * @param {object} data 
 * @returns {object}
 */
export const getIncomingTestList = (data) => {
    return request({
        url: '/incoming/inspection/list',
        method: 'post',
        data
    })
}


/**
 * @description 修改来料检测检测项
 * @param {object} data 
 * @returns {object}
 */
export const editIncomingTestItems = (data) => {
    return request({
        url: '/incoming/inspection/items/save',
        method: 'post',
        data
    })
}

/**
 * @description 删除来料检测检测项
 * @param {object} data 
 * @returns {object}
 */
export const deleteIncomingTestItems = (data) => {
    return request({
        url: '/incoming/inspection/items/delete',
        method: 'post',
        data
    })
}

/**
 * @description 来料、过程、出货检测单根据产品编码获取检测项列表
 * @param {object} data 
 * @returns {object}
 */
export const getInspectionItemsList = (data) => {
    return request({
        url: '/incoming/inspection/items/list',
        method: 'post',
        data
    })
}

/**
 * @description 新增或修改来料检测单
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditIncomingTest = (data) => {
    return request({
        url: '/incoming/inspection/save',
        method: 'post',
        data
    })
}

/**
 * @description 删除来料检测单
 * @param {object} data 
 * @returns {object}
 */
export const deleteIncomingTest = (data) => {
    return request({
        url: '/incoming/inspection/delete',
        method: 'post',
        data
    })
}

/**
 * @description 获取来料检测详情
 * @param {object} data 
 * @returns {object}
 */
export const getIncomingTestDetail = (data) => {
    return request({
        url: '/incoming/inspection/show',
        method: 'post',
        data
    })
}