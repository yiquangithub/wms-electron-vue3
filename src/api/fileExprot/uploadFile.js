import axios from 'axios';
import { getToken } from '@/utils/auth'

let httpURL = window.httpURL;
const request = axios.create({
	baseURL: import.meta.env.MODE == 'development' ? import.meta.env.VITE_APP_BASE_API : httpURL,
	// 请求超时
	timeout: 5000,
});

/**
 * @description 单个文件上传
 * @params {data} object
 */
export const postUploadAdd = (formData) => {
	return request({
		url: '/System/Upload/UploadAdd',
		method: 'post',
		data: formData,
		headers: {
			token: getToken(),
			'Content-Type': 'multipart/form-data',
		}
	});
};

/**
 * @description 单个文件上传含文件格式
 * @params {data} object
 */
export const postUploadFiles = (formData) => {
	return request({
		url: '/System/Upload/files',
		method: 'post',
		data: formData,
		headers: {
			token: getToken(),
			'Content-Type': 'multipart/form-data',
		}
	});
};


/**
 * @description 多个文件上传
 * @params {data} object
 */
export const postUploadMultipleAdd = (data) => {
	return request({
		url: '/System/Upload/UploadsAdd',
		method: 'post',
		data,
		headers: {
			token: getToken(),
			'Content-Type': 'multipart/form-data',
		}
	});
};

/**
 * @description 上传Excel文件（通用版本，只需传入参数）
 * @param {string} url 
 * @param {boolean} checkedStatus 
 * @param {object} formData 
 * @returns {object}
 */
export const postUploadExcel = (url, formData, params) => {
	return request({
		url,
		method: 'post',
		data: formData,
		params: params,
		headers: {
			token: getToken(),
			'Content-Type': 'multipart/form-data',
		}
	})
}
