import request from '@/utils/request';

/**
 * @description 获取检测类型
 * @returns {object}
 */
export const getInspectionType = () => {
    return request({
        url: '/pending/inspection/types',
        method: 'get',
    })
}

/**
 * @description 获取检测任务列表
 * @param {object} data 
 * @returns {object}
 */
export const getTestTaskList = (data) => {
    return request({
        url: '/pending/inspection/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取检测任务详情
 * @param {object} data 
 * @returns {object}
 */
export const getTestTaskDetail = (data) => {
    return request({
        url: '/pending/inspection/show',
        method: 'post',
        data
    })
}

/**
 * @description 添加或修改检测任务
 * @param {object} data 
 * @returns {object}
 */
export const addOrEditTestTask = (data) => {
    return request({
        url: '/pending/inspection/save',
        method: 'post',
        data
    })
}