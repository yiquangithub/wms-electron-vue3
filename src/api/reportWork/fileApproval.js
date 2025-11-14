import request from '@/utils/request';

/**
 * @description 获取文件审批用户
 * @returns {object}
 */
export const getFileApprovalUsers = () => {
    return request({
        url: '/files/check/users',
        method: 'post',
    })
}

/**
 * @description 设置文件审批节点
 * @param {object} data 
 * @returns {object}
 */
export const setFileApprovalNode = (data) => {
    return request({
        url: '/files/check/set/nodes',
        method: 'post',
        data
    })
}

/**
 * @description 获取文件审批节点
 * @returns {object}
 */
export const getFileApprovalNode = () => {
    return request({
        url: '/files/check/query/nodes',
        method: 'post',
    })
}

/**
 * @description 删除文件审批节点
 * @param {object} data - 文件审批节点数据
 * @param {string} id - 文件审批节点ID
 * @returns {object}
 */
export const deleteFileApprovalNode = (data) => {
    return request({
        url: '/files/check/node/delete',
        method: 'post',
        data
    })
}

/**
 * @description 保存/修改文件审批节点
 * @param {object} data - 文件审批节点数据
 * @returns {object}
 */
export const saveFileApprovalNode = (data) => {
    return request({
        url: '/files/check/node/save',
        method: 'post',
        data
    })
}

/**
 * @description 查看文件审批节点
 * @param {object} data - 文件审批节点数据
 * @returns {object}
 */
export const showFileApprovalNode = (data) => {
    return request({
        url: '/files/check/node/show',
        method: 'post',
        data
    })
}

/**
 * @description 获取文件审批列表
 * @param {object} data - 文件审批节点数据
 * @returns {object}
 */
export const getFileApprovalList = (data) => {
    return request({
        url: '/files/check/list',
        method: 'post',
        data
    })
}

/**
 * @description 批量审核通过或审核不通过
 * @param {object} data - 文件审批节点数据
 * @param {string} userCheckId - 审核ID
 * @param {string} userCheckStatus - 审核状态
 * @returns {object}
 */
export const batchAudit = (data) => {
    return request({
        url: '/files/check/bacth/update',
        method: 'post',
        data
    })
}

/**
 * @description 催办
 * @param {object} data - 文件审批节点数据
 * @returns {object}
 */
export const urgeApproval = (data) => {
    return request({
        url: '/files/check/urging',
        method: 'post',
        data
    })
}