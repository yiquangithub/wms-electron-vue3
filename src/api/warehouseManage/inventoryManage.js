import request from "@/utils/request";


/**
 * @description 获取盘点类型
 * @returns {Promise}
 */
export const getInventoryTypes = (data) => {
    return request({
        url: '/inventory/stocktaking/types',
        method: 'post',
        data
    })
}

/**
 * @description 获取盘点计划列表
 * @returns {Promise}
 */
export const getInventoryList = (data) => {
    return request({
        url: '/inventory/stocktaking/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取关联的产品信息
 * @returns {Promise}
 */
export const getInventoryProducts = (data) => {
    return request({
        url: '/inventory/stocktaking/products',
        method: 'post',
        data
    })
}

/**
 * @description 添加/修改盘点计划
 * @returns {Promise}
 */
export const saveInventory = (data) => {
    return request({
        url: '/inventory/stocktaking/save',
        method: 'post',
        data
    })
}

/**
 * @description 获取盘点计划详细信息
 * @returns {Promise}
 */
export const getInventoryDetail = (data) => {
    return request({
        url: '/inventory/stocktaking/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除盘点计划
 * @returns {Promise}
 */
export const deleteInventory = (data) => {
    return request({
        url: '/inventory/stocktaking/delete',
        method: 'post',
        data
    })
}

/**
 * @description 盘点
 * @returns {Promise}
 */
export const updateInventoryQuantity = (data) => {
    return request({
        url: '/inventory/stocktaking/quantity',
        method: 'post',
        data
    })
}

/**
 * @description 提审或取消提审记录
 * @returns {Promise}
 */
export const publishInventory = (data) => {
    return request({
        url: '/inventory/stocktaking/published',
        method: 'post',
        data
    })
}
