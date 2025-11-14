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
 * @description 审批报工列表
 * @returns {object}
 */
export const getCheckTaskList = (data) => {
    return request({
        url: '/report/work/checktask',
        method: 'post',
        data
    })
}

/**
 * @description 批量审核通过或审核不通过
 * @returns {object}
 */
export const batchUpdateCheck = (data) => {
    return request({
        url: '/report/work/bacth/update',
        method: 'post',
        data
    })
}

/**
 * @description 查看审核详情
 * @returns {object}
 */
export const showFlowCheckDetail = (data) => {
    return request({
        url: '/report/work/flow/check/show',
        method: 'post',
        data
    })
}



/**
 * @description 获取报工统计
 * @param {object} data
 * @returns {object}
 */
export const getReportStatistics = (data) => {
    return request({
        url: '/report/work/statistics',
        method: 'post',
        data
    })
}


/**
 * @description 查看详细报工
 * @param {object} data
 * @returns {object}
 */
export const getReportStatisticsDetail = (data) => {
    return request({
        url: '/report/work/statistics/by/user',
        method: 'post',
        data
    })
}




