import request from "@/utils/request";


/**
 * @description 查询仓库审核流程节点
 * @returns {Promise}
 */
export const getCheckNodes = () => {
    return request({
        url: '/inventory/check/query/nodes',
        method: 'post'
    })
}

/**
 * @description 查询出入库单审批列表
 * @returns {Promise}
 */
export const getCheckList = (data) => {
    return request({
        url: '/inventory/check/list',
        method: 'post',
        data
    })
}

/**
 * @description 批量审核通过或审核不通过
 * @returns {Promise}
 */
export const batchUpdateCheck = (data) => {
    return request({
        url: '/inventory/check/bacth/update',
        method: 'post',
        data
    })
}

/**
 * @description 催办
 * @returns {Promise}
 */
export const urgingCheck = (data) => {
    return request({
        url: '/inventory/check/urging',
        method: 'post',
        data
    })
}

/**
 * @description 保存或修改单个审核流程节点
 * @returns {Promise}
 */
export const saveCheckNode = (data) => {
    return request({
        url: '/inventory/check/node/save',
        method: 'post',
        data
    })
}

/**
 * @description 显示单个审核流程节点
 * @returns {Promise}
 */
export const showCheckNode = (data) => {
    return request({
        url: '/inventory/check/node/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除审核流程节点
 * @returns {Promise}
 */
export const deleteCheckNode = (data) => {
    return request({
        url: '/inventory/check/node/delete',
        method: 'post',
        data
    })
}

/**
 * @description 查询单据类型
 * @returns {Promise}
 */
export const getOrderTypeData = (data) => {
    return request({
        url: '/inventory/check/inventoryType',
        method: 'post',
        data
    })
}

/**
 * @description 查询审批类型
 * @returns {Promise}
 */
export const getAuditTypeData = (data) => {
    return request({
        url: '/inventory/check/recordType',
        method: 'post',
        data
    })
}
