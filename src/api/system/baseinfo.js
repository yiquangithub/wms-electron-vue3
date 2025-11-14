import request from '@/utils/request'
// 获取系统设置基本信息
export function getSystemBaseInfoData() {
  return request({
    url: '/System/Systemset/Get_Systemset',
    method: 'post',
    headers: {
      skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
    },
  })
}

// 保存修改系统设置基本信息
export function saveSystemBaseInfoData(data) {
  return request({
    url: '/System/Systemset/Save',
    method: 'post',
    data: data,
  })
}
