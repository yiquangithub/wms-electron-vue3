import request from "@/utils/request";


/**
 * @description 获取移库单类型
 * @returns {Promise}
 */
export const getMoveWareHouseTypes = (data) => {
    return request({
        url: '/inventory/move/types',
        method: 'post',
        data
    })
}

/**
 * @description 查询移库列表
 * @returns {Promise}
 */
export const getMoveWareHouseList = (data) => {
    return request({
        url: '/inventory/move/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取关联的产品信息
 * @returns {Promise}
 */
export const getMoveWareHouseProducts = (data) => {
    return request({
        url: '/inventory/move/products',
        method: 'post',
        data
    })
}

/**
 * @description 添加/修改移库单
 * @returns {Promise}
 */
export const saveMoveWareHouse = (data) => {
    return request({
        url: '/inventory/move/save',
        method: 'post',
        data
    })
}

/**
 * @description 查询移库单详细信息
 * @returns {Promise}
 */
export const getMoveWareHouseDetail = (data) => {
    return request({
        url: '/inventory/move/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除移库单
 * @returns {Promise}
 */
export const deleteMoveWareHouse = (data) => {
    return request({
        url: '/inventory/move/delete',
        method: 'post',
        data
    })
}

/**
 * @description 提审或取消提审记录
 * @returns {Promise}
 */
export const publishMoveWareHouse = (data) => {
    return request({
        url: '/inventory/move/published',
        method: 'post',
        data
    })
}