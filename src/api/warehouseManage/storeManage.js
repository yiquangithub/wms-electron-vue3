import request from "@/utils/request";

/**
 * @description 获取入库单类型
 * @returns {Promise}
 */
export const getStoreTypes = (data) => {
    return request({
        url: '/inventory/store/types',
        method: 'post',
        data
    })
}

/**
 * @description 查询入库列表
 * @returns {Promise}
 */
export const getStoreList = (data) => {
    return request({
        url: '/inventory/store/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取关联的产品信息
 * @returns {Promise}
 */
export const getStoreProducts = (data) => {
    return request({
        url: '/inventory/store/products',
        method: 'post',
        data
    })
}

/**
 * @description 添加/修改入库单
 * @returns {Promise}
 */
export const saveStore = (data) => {
    return request({
        url: '/inventory/store/save',
        method: 'post',
        data
    })
}

/**
 * @description 查询入库单详细信息
 * @returns {Promise}
 */
export const getStoreDetail = (data) => {
    return request({
        url: '/inventory/store/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除入库单
 * @returns {Promise}
 */
export const deleteStore = (data) => {
    return request({
        url: '/inventory/store/delete',
        method: 'post',
        data
    })
}

/**
 * @description 提审或取消提审记录
 * @returns {Promise}
 */
export const publishStore = (data) => {
    return request({
        url: '/inventory/store/published',
        method: 'post',
        data
    })
}


/**
 * @description 根据多个物料查询所在仓库信息
 * @returns {Promise}
 */
export const getMaterialAndStore= (data) => {
    return request({
        url: '/inventory/warehouse/infos',
        method: 'post',
        data
    })
}