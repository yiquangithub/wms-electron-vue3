import request from '@/utils/request';


/**
 * @description Excel导入
 * @param {url,data}
 */
export const postUploadExcel = (url, formData) => {
    return request({
        url: url,
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
}

/**
 * @description 下载模板
 * @param {url,data}
 */
export const downloadTemplate = (url, data) => {
    return request({
        url: url,
        method: 'post',
        data: data,
        responseType: 'blob'
    })
}