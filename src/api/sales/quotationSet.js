import request from '@/utils/request'

// 获取报价单基础信息
export function getQuotationSetting() {
  return request({
    url: '/quote/setting/show',
    method: 'post',
  })
}

// 保存报价单基础信息
export function saveQuotationSetting(data) {
  return request({
    url: '/quote/setting/save',
    method: 'post',
    data: data,
  })
}
