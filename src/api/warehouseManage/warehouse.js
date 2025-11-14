import request from "@/utils/request";


/**
 * @description 获取仓库树结构
 * @returns {Promise}
 */
export const getWarehouseTree = (data) => {
    return request({
        url: '/inventory/warehouse/tree',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改仓库
 * @param {object} data 仓库信息
 * @returns {Promise}
 */
export const saveWarehouse = (data) => {
    return request({
        url: '/inventory/warehouse/save',
        method: 'post',
        data
    })
}

/**
 * @description 获取仓库详细信息
 * @param {object} data 查询参数
 * @returns {Promise}
 */
export const getWarehouseInfo = (data) => {
    return request({
        url: '/inventory/warehouse/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除仓库
 * @param {object} data 删除参数
 * @returns {Promise}
 */
export const deleteWarehouseCategory = (data) => {
    return request({
        url: '/inventory/warehouse/category/delete',
        method: 'post',
        data
    })
}

/**
 * @description 导出仓库信息
 * @param {object} data 导出参数
 * @returns {Promise}
 */
export const exportWarehouse = (data) => {
    return request({
        url: '/inventory/warehouse/export',
        method: 'post',
        data
    })
}

/**
 * @description 导入仓库信息
 * @param {object} data 导入数据
 * @returns {Promise}
 */
export const importWarehouseData = (data) => {
    return request({
        url: '/inventory/warehouse/importData',
        method: 'post',
        data
    })
}

/**
 * @description 导出仓库模板
 * @returns {Promise}
 */
export const exportWarehouseTemplate = () => {
    return request({
        url: '/inventory/warehouse/importTemplate',
        method: 'post'
    })
}

/**
 * @description 根据仓库分页查询物料产品库存
 * @param {object} data 查询参数
 * @returns {Promise}
 */
export const getWarehouseProducts = (data) => {
    return request({
        url: '/inventory/warehouse/products',
        method: 'post',
        data
    })
}

/**
 * @description 根据物料查询所在仓库信息
 * @param {object} data 查询参数
 * @returns {Promise}
 */
export const getWarehouseInfoByProduct = (data) => {
    return request({
        url: '/inventory/warehouse/info',
        method: 'post',
        data
    })
}

/**
 * @description 导出仓库关联物料产品信息
 * @param {object} data 导出参数
 * @returns {Promise}
 */
export const exportWarehouseProducts = (data) => {
    return request({
        url: '/inventory/warehouse/products/export',
        method: 'post',
        data
    })
}

/**
 * @description 导入仓库关联物料产品信息
 * @param {object} data 导入数据 long term support
 * @returns {Promise}
 */
export const importWarehouseProducts = (data) => {
    return request({
        url: '/inventory/warehouse/products/importData',
        method: 'post',
        data
    })
}

/**
 * @description 导出仓库关联物料产品模版
 * @returns {Promise}
 */
export const exportWarehouseProductsTemplate = () => {
    return request({
        url: '/inventory/warehouse/products/importTemplate',
        method: 'post'
    })
}