import request from '@/utils/request'

// 查询项目列表
export function listProject(query) {
  return request({
    url: '/project/info/list',
    method: 'get',
    params: query
  })
}

// 新增项目
export function addProject(data) {
  return request({
    url: '/project/info',
    method: 'post',
    data: data
  })
}

// 编辑项目
export function updateProject(data) {
  return request({
    url: '/project/info',
    method: 'put',
    data: data
  })
}

// 获取项目详细信息
export function getProject(id) {
  return request({
    url: '/project/info/' + id,
    method: 'get'
  })
}

// 删除项目
export function delProject(ids) {
  return request({
    url: '/project/info/' + ids,
    method: 'delete'
  })
}

// 获取所有项目
export function getAllProject() {
  return request({
    url: '/project/info/all',
    method: 'get'
  })
}

// 获取类型
export function getProjectType() {
  return request({
    url: '/system/dict/data/type/project_type',
    method: 'get',
  })
}