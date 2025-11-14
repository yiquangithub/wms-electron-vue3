import request from '@/utils/request';

/**
 * @description 自动获取编码
 * @param {object} data 
 * @returns {object}
 */
export const autoProcessTestCode = () => {
    return request({
        url: '/process/inspection/autoCode',
        method: 'post',
        data: {}
    })
}

/**
 * @description 获取过程检测列表
 * @param {object} data 
 * @returns {object}
 */
export const getProcessTestList = (data) => {
    return request({
        url: '/process/inspection/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取检验类型
 * @returns {object}
 */
export const getProcessTestTypes = () => {
    return request({
        url: '/process/inspection/types',
        method: 'get',
    })
}

/**
 * @description 新增或修改过程检测
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditProcessTest = (data) => {
    return request({
        url: '/process/inspection/save',
        method: 'post',
        data
    })
}

/**
 * @description 删除过程检测
 * @param {object} data 
 * @returns {object}
 */
export const deleteProcessTest = (data) => {
    return request({
        url: '/process/inspection/delete',
        method: 'post',
        data
    })
}

/**
 * @description 获取过程检测详情
 * @param {object} data 
 * @returns {object}
 */
export const getProcessTestDetail = (data) => {
    return request({
        url: '/process/inspection/show',
        method: 'post',
        data: data
    })
}