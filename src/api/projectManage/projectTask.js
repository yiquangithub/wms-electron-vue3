import request from '@/utils/request'

// 查询项目任务列表
export function listProjectTask(query) {
  return request({
    url: '/project/task/list',
    method: 'get',
    params: query
  })
}

// 获取项目任务
export function getProjectTask(id) {
  return request({
    url: '/project/task/' + id,
    method: 'get'
  })
}

// 新增项目任务
export function addProjectTask(data) {
  return request({
    url: '/project/task',
    method: 'post',
    data: data
  })
}

// 修改项目任务
export function updateProjectTask(data) {
  return request({
    url: '/project/task',
    method: 'put',
    data: data
  })
}

// 删除项目任务
export function delProjectTask(ids) {
  return request({
    url: '/project/task/' + ids,
    method: 'delete'
  })
}

// 查询我的任务列表
export function listMyTask(query) {
  return request({
    url: '/project/task/mytask/list',
    method: 'get',
    params: query
  })
}

// 编辑我的任务
export function editMyTask(data) {
  return request({
    url: '/project/task/mytask/edit',
    method: 'put',
    data: data
  })
}

// 获取进度汇总信息
export function getTaskSummary(id) {
  return request({
    url: '/project/task/summary/' + id,
    method: 'get'
  })
}

// 获取任务状态分布
export function getTaskStatusDistribution(id) {
  return request({
    url: '/project/task/status/' + id,
    method: 'get'
  })
}

// 项目进度趋势
export function getProjectProgressTrend(id) {
  return request({
    url: '/project/task/trend/' + id,
    method: 'get'
  })
}
