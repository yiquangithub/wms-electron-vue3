import request from '@/utils/request'

// 获取项目数统计信息
export const getSummary = () => {
    return request({
        url: '/project/showboard/summary',
        method: 'get'
    })
}

// 根据项目类型获取任务列名称
export const getTaskListColumnName = (type) => {
    return request({
        url: '/project/showboard/field/' + type,
        method: 'get'
    })
}

// 项目信息列表
export const getProjectList = (params) => {
    return request({
        url: '/project/showboard/list',
        method: 'get',
        params
    })
}