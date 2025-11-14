import request from '@/utils/request';

/**
 * @description 自动获取检测模板编码
 * @param {object} data 
 * @returns {object}
 */
export const autoTestTemplateCode = (data) => {
    return request({
        url: '/check/template/autoCode',
        method: 'post',
        data
    })
}

/**
 * @description 获取检测模板列表
 * @param {object} data 
 * @returns {object}
 */
export const getTestTemplateList = (data) => {
    return request({
        url: '/check/template/list',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改检测模板
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditTestTemplate = (data) => {
    return request({
        url: '/check/template/save',
        method: 'post',
        data
    })
}

/**
 * @description 批量删除检测模板
 * @param {object} data 
 * @returns {object}
 */
export const batchDeleteTestTemplate = (data) => {
    return request({
        url: '/check/template/delete',
        method: 'post',
        data
    })
}

/**
 * @description 获取检测模板详情
 * @param {object} data 
 * @returns {object}
 */
export const getTestTemplateDetail = (data) => {
    return request({
        url: '/check/template/show',
        method: 'post',
        data
    })
}

/**
 * @description 获取检测模板检测项
 * @param {object} data 
 * @returns {object}
 */
export const getTestTemplateTestItem = (data) => {
    return request({
        url: '/check/template/items/list',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改检测模板检测项
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditTestTemplateTestItem = (data) => {
    return request({
        url: '/check/template/items/save',
        method: 'post',
        data
    })
}

/**
 * @description 批量删除检测模板检测项
 * @param {object} data 
 * @returns {object}
 */
export const batchDeleteTestTemplateTestItem = (data) => {
    return request({
        url: '/check/template/items/delete',
        method: 'post',
        data
    })
}

/**
 * @description 获取检测模板检测项详情
 * @param {object} data 
 * @returns {object}
 */
export const getTestTemplateTestItemDetail = (data) => {
    return request({
        url: '/check/template/items/show',
        method: 'post',
        data
    })
}

/**
 * @description 获取检测模板物料产品
 * @param {object} data 
 * @returns {object}
 */
export const getTestTemplateMaterialProduct = (data) => {
    return request({
        url: '/check/template/products/list',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改检测模板物料产品
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditTestTemplateMaterialProduct = (data) => {
    return request({
        url: '/check/template/products/save',
        method: 'post',
        data
    })
}

/**
 * @description 批量删除检测模板物料产品
 * @param {object} data 
 * @returns {object}
 */
export const batchDeleteTestTemplateMaterialProduct = (data) => {
    return request({
        url: '/check/template/products/delete',
        method: 'post',
        data
    })
}

/**
 * @description 获取检测模板物料产品详情
 * @param {object} data 
 * @returns {object}
 */
export const getTestTemplateMaterialProductDetail = (data) => {
    return request({
        url: '/check/template/products/show',
        method: 'post',
        data
    })
}