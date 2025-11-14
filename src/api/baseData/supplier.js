import request from '@/utils/request';

/**
 * @description 分页查询往来单位列表
 * @param {object} data 
 * @returns {object}
 */
export const getSupplierList = (data) => {
    return request({
        url: '/contact/units/list',
        method: 'post',
        data
    })
}

/**
 * @description 查询所有供应商 用于下拉框
 * @returns {object}
 */
export const getAllSuppliers = (data) => {
    return request({
        url: '/suppliers/all',
        method: 'post',
        data
    })
}

/**
 * @description 查询往来单位联系人列表
 * @param {object} data 
 * @returns {object}
 */
export const getContactList = (data) => {
    return request({
        url: '/contact/units/contacts/list',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改往来单位
 * @param {object} data 
 * @returns {object}
 */
export const saveSupplier = (data) => {
    return request({
        url: '/contact/units/save',
        method: 'post',
        data
    })
}

/**
 * @description 删除往来单位
 * @param {object} data 
 * @returns {object}
 */
export const deleteSupplier = (data) => {
    return request({
        url: '/contact/units/delete',
        method: 'post',
        data
    })
}

/**
 * @description 查询单个往来单位
 * @param {object} data 
 * @returns {object}
 */
export const getSupplierDetail = (data) => {
    return request({
        url: '/contact/units/show',
        method: 'post',
        data
    })
}

/**
 * @description 启用/禁用往来单位
 * @param {object} data 
 * @returns {object}
 */
export const toggleSupplierStatus = (data) => {
    return request({
        url: '/contact/units/enabled',
        method: 'post',
        data
    })
}

/**
 * @description 自动获取往来单位编码
 * @returns {object}
 */
export const getSupplierAutoCode = () => {
    return request({
        url: '/suppliers/autoCode',
        method: 'post',
        data: {}
    })
}

/**
 * @description 查询往来单位等级
 * @returns {object}
 */
export const getSupplierGrades = () => {
    return request({
        url: '/contact/units/grade',
        method: 'post',
        data: {}
    })
}

/**
 * @description 添加或修改往来单位联系人
 * @param {*} data 
 * @returns 
 */
export const saveCompanyContact = (data)=>{
    return request({
        url: '/contact/units/contacts/save',
        method: 'post',
        data
    })
}

/**
 * @description 删除往来单位联系人
 * @param {*} data 
 * @returns 
 */
export const deleteCompanyContact = (data)=>{
    return request({
        url: '/contact/units/contacts/delete',
        method: 'post',
        data
    })
}

/**
 * @description 查询往来单位联系人详情
 * @param {*} data 
 * @returns 
 */
export const searchCompanyContactDetail = (data) =>{
    return request({
        url: '/contact/units/contacts/show',
        method: 'post',
        data
    })
}


// 1. 获取往来单位分类树
export function getCategoryTree(data) {
    return request({
        url: '/contact/units/category/tree',
        method: 'post',
        data
    })
}

// 2. 添加或修改往来单位分类
export function saveCategory(data) {
    return request({
        url: '/contact/units/category/save',
        method: 'post',
        data
    })
}

// 3. 获取往来单位分类详情
export function showCategory(data) {
    return request({
        url: '/contact/units/category/show',
        method: 'post',
        data
    })
}

// 4. 删除往来单位分类
export function deleteCategory(data) {
    return request({
        url: '/contact/units/category/delete',
        method: 'post',
        data
    })
}

// 5. 导出往来单位分类信息
export function exportCategory(data) {
    return request({
        url: '/contact/units/category/export',
        method: 'post',
        data,
        responseType: 'blob' // 若导出为文件，通常需设置responseType为blob
    })
}

// 6. 导入往来单位分类信息
export function importCategoryData(data) {
    return request({
        url: '/contact/units/category/importData',
        method: 'post',
        data
    })
}

// 7. 导出往来单位分类模板
export function importCategoryTemplate(data) {
    return request({
        url: '/contact/units/category/importTemplate',
        method: 'post',
        data,
        responseType: 'blob' // 模板导出一般也为文件下载
    })
}


