import request from '@/utils/request';


/**
 * @description 查询流程列表
 * @returns {object}
 */
export const getFlowList = (data) => {
    return request({
        url: '/flow/list',
        method: 'post',
        data
    })
}

/**
 * @description 根据流程查询所有节点信息
 * @returns {object}
 */
export const getFlowNodes = (data) => {
    return request({
        url: '/flow/nodes',
        method: 'post',
        data
    })
}

/**
 * @description 查询流程角色
 * @returns {object}
 */
export const getFlowRole = (data) => {
    return request({
        url: '/flow/find/role',
        method: 'post',
        data
    })
}

/**
 * @description 保存或修改单个审核流程节点
 * @returns {object}
 */
export const saveFlowNode = (data) => {
    return request({
        url: '/flow/node/save',
        method: 'post',
        data
    })
}

/**
 * @description 显示单个审核流程节点
 * @returns {object}
 */
export const showFlowNode = (data) => {
    return request({
        url: '/flow/node/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除审核流程节点
 * @returns {object}
 */
export const deleteFlowNode = (data) => {
    return request({
        url: '/flow/node/delete',
        method: 'post',
        data
    })
}

/**
 * @description 查看用户能审核的记录
 * @returns {object}
 */
export const getAuditRecords = (query) => {
    return request({
        url: '/flow/check/list',
        method: 'get',
        params: query
    })
}

/**
 * @description 批量审核通过或审核不通过
 * @returns {object}
 */
export const batchAudit = (data) => {
    return request({
        url: '/flow/check/bacth/update',
        method: 'post',
        data
    })
}


// 所有流程列表
export function getAllFlowList() {
  return request({
    url: '/flow/all',
    method: 'get',
  })
}

// 获取审核状态类型
export function getCheckStatus() {
  return request({
    url: '/system/dict/data/type/flow_check_status',
    method: 'get',
  })
}

/**
 * @description 根据id查看审核详情
 * @param {string} id - 文件审批节点ID
 * @returns {object}
 */
export const getFileApprovalDetail = (id) => {
    return request({
        url: '/flow/check/' +id,
        method: 'get',
    })
}