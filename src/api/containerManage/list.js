import request from '@/utils/request'

// 1.货柜汇总信息
export const getContainerSummary = () => {
    return request({
        url: '/warehouse/info/summary',
        method: 'get',
    })
}

// 2.查询垂直柜基本信息列表
export const getVerticalContainerList = (data) => {
    return request({
        url: '/warehouse/vertical/info/list',
        method: 'get',
        params: data,
    })
}

// 3.获取垂直柜基本信息详细信息
export const getVerticalContainerDetail = (data) => {
    return request({
        url: '/warehouse/info',
        method: 'get',
        params: data,
    })
}

// 4.新增垂直柜基本信息
export const addVerticalContainer = (data) => {
    return request({
        url: '/warehouse/info',
        method: 'post',
        data: data,
    })
}

// 5.修改垂直柜基本信息
export const updateVerticalContainer = (data) => {
    return request({
        url: '/warehouse/info',
        method: 'post',
        data: data,
    })
}

// 6.删除垂直柜基本信息
export const deleteVerticalContainer = (data) => {
    return request({
        url: '/warehouse/info',
        method: 'delete',
        params: data,
    })
}


// 7.导出垂直柜基本信息列表
export const exportVerticalContainerList = (data) => {
    return request({
        url: '/warehouse/info/export',
        method: 'get',
        params: data,
    })
}

// 8.获取垂直柜所有层数信息
export const getVerticalContainerLayerList = (data) => {
    return request({
        url: '/warehouse/info/layer',
        method: 'get',
        params: data,
    })
}

// 9.根据层获取格子信息
export const getVerticalContainerCellList = (data) => {
    return request({
        url: '/warehouse/info/grid',
        method: 'get',
        params: data,
    })
}

// 10.根据层和格子获取料盒信息
export const getVerticalContainerBoxList = (data) => {
    return request({
        url: 'warehouse/info/box',
        method: 'get',
        params: data,
    })
}
