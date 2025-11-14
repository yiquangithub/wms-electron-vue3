import request from '@/utils/request';

/**
 * @description 分页查询工单
 * @param {object} data 
 * @returns {object}
 */
export const getWorkOrderList = (data) => {
    return request({
        url: '/workorder/list',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改工单
 * @param {object} data 
 * @returns {object}
 */
export const saveWorkOrder = (data) => {
    return request({
        url: '/workorder/save',
        method: 'post',
        data
    })
}

/**
 * @description 获取工单信息
 * @param {object} data 
 * @returns {object}
 */
export const getWorkOrderInfo = (data) => {
    return request({
        url: '/workorder/show',
        method: 'post',
        data
    })
}

/**
 * @description 工单批量删除
 * @param {object} data 
 * @returns {object}
 */
export const batchDeleteWorkOrder = (data) => {
    return request({
        url: '/workorder/batch/delete',
        method: 'post',
        data
    })
}

/**
 * @description 查询所有工单信息
 * @param {object} data 
 * @returns {object}
 */
export const getAllWorkOrders = (data) => {
    return request({
        url: '/workorder/all',
        method: 'post',
        data
    })
}

/**
 * @description 分页查询工单下达列表
 * @param {object} data 
 * @returns {object}
 */
export const getWorkOrderIssueList = (data) => {
    return request({
        url: '/workorder/issue/list',
        method: 'post',
        data
    })
}

/**
 * @description 根据生产线查询所有工位
 * @param {object} data 
 * @returns {object}
 */
export const getStationsByLine = (data) => {
    return request({
        url: '/workorder/station/by/line',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改工单下达
 * @param {object} data 
 * @returns {object}
 */
export const saveWorkOrderIssue = (data) => {
    return request({
        url: '/workorder/issue/save',
        method: 'post',
        data
    })
}

/**
 * @description 查看任务详情
 * @param {object} data 
 * @returns {object}
 */
export const getWorkOrderIssueDetail = (data) => {
    return request({
        url: '/workorder/issue/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除工单下达
 * @param {object} data 
 * @returns {object}
 */
export const deleteWorkOrderIssue = (data) => {
    return request({
        url: '/workorder/delete',
        method: 'post',
        data
    })
}

/**
 * @description 数量统计
 * @param {object} data 
 * @returns {object}
 */
export const getWorkOrderSchedulingCount = (data) => {
    return request({
        url: '/workorder/scheduling/count',
        method: 'post',
        data
    })
}

/**
 * @description 分页查询产线
 * @param {object} data 
 * @returns {object}
 */
export const getWorkOrderSchedulingList = (data) => {
    return request({
        url: '/workorder/scheduling/list',
        method: 'post',
        data
    })
}

/**
 * @description 查看任务列表
 * @param {object} data 
 * @returns {object}
 */
export const getWorkOrderSchedulingTasks = (data) => {
    return request({
        url: '/workorder/scheduling/show',
        method: 'post',
        data
    })
}

/**
 * @description 上线操作
 * @param {object} data 
 * @returns {object}
 */
export const workOrderSchedulingOnline = (data) => {
    return request({
        url: '/workorder/scheduling/online',
        method: 'post',
        data
    })
}

/**
 * @description 完成操作
 * @param {object} data 
 * @returns {object}
 */
export const workOrderSchedulingComplete = (data) => {
    return request({
        url: '/workorder/scheduling/compleate',
        method: 'post',
        data
    })
}


/**
 * @description 挂起操作
 * @param {object} data 
 * @returns {object}
 */
export const workOrderSchedulingPending = (data) => {
    return request({
        url: '/workorder/scheduling/pending',
        method: 'post',
        data
    })
}