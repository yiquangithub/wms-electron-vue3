import request from '@/utils/request';


/**
 * @description 不合格统计-数量统计
 * @returns {object}
 */
export const getUnqualifiedCount = (data) => {
    return request({
        url: '/unqualified/inspection/count',
        method: 'post',
        data
    })
}

/**
 * @description 不合格统计-不合格趋势图
 * @returns {object}
 */
export const getUnqualifiedTrend = (data) => {
    return request({
        url: '/unqualified/inspection/trend',
        method: 'post',
        data
    })
}

/**
 * @description 不合格统计-不合格检测项分布
 * @returns {object}
 */
export const getUnqualifiedItems = (data) => {
    return request({
        url: '/unqualified/inspection/items',
        method: 'post',
        data
    })
}

/**
 * @description 不合格统计-不合格详情列表
 * @returns {object}
 */
export const getUnqualifiedList = (data) => {
    return request({
        url: '/unqualified/inspection/list',
        method: 'post',
        data
    })
}