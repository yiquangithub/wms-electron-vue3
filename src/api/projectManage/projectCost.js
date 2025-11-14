import request from '@/utils/request'

// 查询项目成本列表
export function listProjectCost(query) {
  return request({
    url: '/project/cost/list',
    method: 'get',
    params: query
  })
}

// 获取项目成本详细信息
export function getProjectCost(id) {
  return request({
    url: '/project/cost/' + id,
    method: 'get'
  })
}

// 新增项目成本
export function addProjectCost(data) {
  return request({
    url: '/project/cost',
    method: 'post',
    data: data
  })
}

// 修改项目成本
export function updateProjectCost(data) {
  return request({
    url: '/project/cost',
    method: 'put',
    data: data
  })
}

// 删除项目成本
export function delProjectCost(ids) {
  return request({
    url: '/project/cost/' + ids,
    method: 'delete'
  })
}

// 获取成本汇总信息
export function getCostSummary(id) {
  return request({
    url: '/project/cost/summary/' + id,
    method: 'get'
  })
}

// 获取人力成本汇总信息
export function getHumanCostSummary(id) {
  return request({
    url: '/project/cost/summary/human/' + id,
    method: 'get'
  })
}

// 获取成本类型
export function getCostType() {
  return request({
    url: '/system/dict/data/type/project_cost_type',
    method: 'get',
  })
}

// 获取支付类型
export function getPayType() {
  return request({
    url: '/system/dict/data/type/project_cost_pay_status',
    method: 'get',
  })
}

// 成本构成分析
export function getCostCompositionAnalysis(id) {
  return request({
    url: '/project/cost/composition/analysis/' + id,
    method: 'get',
  })
}

// 预算与实际成本
export function getCostComparison(id) {
  return request({
    url: '/project/cost/comparison/' + id,
    method: 'get',
  })
}

// 项目团队人力成本明细
export function getHumanCostDetail(id, query) {
  return request({
    url: '/project/cost/human/resources/' + id,
    method: 'get',
    params: query
  })
}
