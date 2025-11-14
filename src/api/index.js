import request from '@/utils/request'

// 01.项目数统计信息
export const getSummary = () => {
  return request({
    url: '/index/summary',
    method: 'get',
  })
}
// 02.项目进度趋势
export const getProgress = () => {
  return request({
    url: '/index/projects/progress',
    method: 'get',
  })
}
// 03.项目状态分布
export const getProjectsStatus = () => {
  return request({
    url: '/index/project/status',
    method: 'get',
  })
}
// 04.财务收支趋势
export const getFinancialStatus = () => {
  return request({
    url: '/index/financial/status',
    method: 'get',
  })
}

