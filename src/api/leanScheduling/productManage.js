import request from '@/utils/request';

/**
 * @description 获取产品列表
 * @param {object} data 
 * @returns {object}
 */
export const getProductList = (data) => {
    return request({
        url: '/products/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取产品列表，用于下拉框
 * @returns {object}
 */
export const getProductDownList = () => {
    return request({
        url: '/products/all',
        method: 'post',
        data: {}
    })
}


/**
 * @description 添加或编辑产品
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditProduct = (data) => {
    return request({
        url: '/products/save',
        method: 'post',
        data
    })
}

/**
 * @description 获取产品详情
 * @param {object} data 
 * @param {string} id 产品id
 * @returns {object}
 */
export const getProductDetail = (data) => {
    return request({
        url: '/products/detail',
        method: 'post',
        data
    })
}

/**
 * @description 删除产品
 * @param {object} data 
 * @returns {object}
 */
export const deleteProduct = (data) => {
    return request({
        url: '/products/delete',
        method: 'post',
        data
    })
}
