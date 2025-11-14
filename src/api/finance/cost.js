import request from '@/utils/request'

// 01.收支明细
export const getCostDetails = (data) => {
  return request({
    url: '/cost/details/list',
    method: 'get',
    params: data,
  })
}
//01.收支汇总
export const getCostSummary = (data) => {
  return request({
    url: '/cost/summary',
    method: 'get',
    params: data,
  })
}
//01.按类型汇总
export const getCostType = (data) => {
  return request({
    url: '/cost/by/type',
    method: 'get',
    params: data,
  })
}
// 04.应付款项趋势
export const trendType = (id) => {
  return request({
    url: '/cost/trend/' + id,
    method: 'get',
  })
}
// 01.所有项目
export const getAlls = () => {
  return request({
    url: '/project/info/all',
    method: 'get',
  })
}

// 01.查询设置的参数
export const getSettingQuery = () => {
  return request({
    url: '/accounts/setting/query',
    method: 'get',
  })
}

// 02.保存设置的参数
export const saveSettingQuery = (data) => {
  return request({
    url: '/accounts/setting',
    data: data,
    method: 'post',
  })
}
