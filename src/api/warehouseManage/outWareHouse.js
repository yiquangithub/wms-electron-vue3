import request from "@/utils/request";

/**
 * @description 获取出库单类型
 * @returns {Promise}
 */
export const getOutWareHouseTypes = (data) => {
    return request({
        url: '/inventory/outbound/types',
        method: 'post',
        data
    })
}

/**
 * @description 查询出库列表
 * @returns {Promise}
 */
export const getOutboundList = (data) => {
    return request({
        url: '/inventory/outbound/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取关联的产品信息
 * @returns {Promise}
 */
export const getOutboundProducts = (data) => {
    return request({
        url: '/inventory/outbound/products',
        method: 'post',
        data
    })
}

/**
 * @description 查询产品当前库存数量
 * @returns {Promise}
 */
export const getProductQuantity = (data) => {
    return request({
        url: '/inventory/outbound/query/quantity',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改出库单
 * @returns {Promise}
 */
export const saveOutbound = (data) => {
    return request({
        url: '/inventory/outbound/save',
        method: 'post',
        data
    })
}

/**
 * @description 查询出库单详细信息
 * @returns {Promise}
 */
export const getOutboundDetail = (data) => {
    return request({
        url: '/inventory/outbound/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除出库单
 * @returns {Promise}
 */
export const deleteOutbound = (data) => {
    return request({
        url: '/inventory/outbound/delete',
        method: 'post',
        data
    })
}

/**
 * @description 提审或取消提审记录
 * @returns {Promise}
 */
export const publishOutbound = (data) => {
    return request({
        url: '/inventory/outbound/published',
        method: 'post',
        data
    })
}