import request from "@/utils/request";


/**
 * @description 获取报损单类型
 * @returns {Promise}
 */
export const getLossWareHouseTypes = (data) => {
    return request({
        url: '/inventory/loss/types',
        method: 'post',
        data
    })
}

/**
 * @description 获取报损列表
 * @returns {Promise}
 */
export const getLossWareHouseList = (data) => {
    return request({
        url: '/inventory/loss/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取关联的产品信息
 * @returns {Promise}
 */
export const getLossWareHouseProducts = (data) => {
    return request({
        url: '/inventory/loss/products',
        method: 'post',
        data
    })
}

/**
 * @description 添加/修改报损单
 * @returns {Promise}
 */
export const saveLossWareHouse = (data) => {
    return request({
        url: '/inventory/loss/save',
        method: 'post',
        data
    })
}

/**
 * @description 获取报损单详细信息
 * @returns {Promise}
 */
export const getLossWareHouseDetail = (data) => {
    return request({
        url: '/inventory/loss/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除报损单
 * @returns {Promise}
 */
export const deleteLossWareHouse = (data) => {
    return request({
        url: '/inventory/loss/delete',
        method: 'post',
        data
    })
}

/**
 * @description 提审或取消提审记录
 * @returns {Promise}
 */
export const publishLossWareHouse = (data) => {
    return request({
        url: '/inventory/loss/published',
        method: 'post',
        data
    })
}