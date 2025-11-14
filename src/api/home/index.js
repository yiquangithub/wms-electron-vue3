import request from '@/utils/request'

// 项目数统计信息
export function getProjectSummary() {
  return request({
    url: '/index/summary',
    method: 'get'
  })
}

// 项目进度趋势
export function getProjectProgress() {
  return request({
    url: '/index/projects/progress',
    method: 'get'
  })
}

// 项目状态分布
export function getProjectStatus() {
  return request({
    url: '/index/project/status',
    method: 'get'
  })
}

// 财务收支趋势
export function getFinancialStatus() {
  return request({
    url: '/index/financial/status',
    method: 'get'
  })
}