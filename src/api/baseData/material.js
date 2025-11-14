import request from '@/utils/request';

/**
 * @description 获取物料分类树
 * @param {object} data 
 * @returns {object}
 */
export const getMaterialTreeList = (data) => {
    return request({
        url: '/material/category/tree',
        method: 'post',
        data,
        headers: {
            skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
        },
    })
}

/**
 * @description 添加/编辑物料分类树节点
 * @param {object} data 
 * @returns {object}
 */
export const addEditMaterialTypeNode = (data) => {
    return request({
        url: '/material/category/save',
        method: 'post',
        data
    })
}

/**
 * @description 获取物料分类信息
 * @param {object} data 
 * @returns {object}
 */
export const getMaterialTypeList = (data) => {
    return request({
        url: '/material/category/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除物料分类节点
 * @param {object} data 删除参数
 * @returns {object} 返回结果
 */
export const deleteMaterialTypeNode = (data) => {
    return request({
        url: '/material/category/delete',
        method: 'post',
        data
    })
}

/**
 * @description 导出物料分类信息
 * @returns {object}
 */
export const exportMaterialCategory = () => {
    return request({
        url: '/material/category/export',
        method: 'post',
        data: {}
    })
}

/**
 * @description 导入物料分类信息
 * @param {object} data 导入参数
 * @returns {object}
 */
export const importMaterialCategory = (data) => {
    return request({
        url: '/material/category/importData',
        method: 'post',
        data
    })
}

/**
 * @description 导出物料分类模版
 * @returns {object}
 */
export const exportMaterialCategoryTemplate = () => {
    return request({
        url: '/material/category/importTemplate',
        method: 'post',
        data: {}
    })
}

/**
 * @description 根据分类查询物料列表
 * @param {object} data 查询参数
 * @returns {object}
 */
export const getMaterialList = (data) => {
    return request({
        url: '/material/list',
        method: 'post',
        data,
        headers: {
            skipRepeatSubmit: true, // 添加跳过重复提交检查的标识
        },
    })
}

/**
 * @description 添加/修改物料或产品
 * @param {object} data 物料/产品信息
 * @returns {object}
 */
export const saveOrUpdateMaterial = (data) => {
    return request({
        url: '/material/save',
        method: 'post',
        data
    })
}

/**
 * @description 获取物料信息
 * @param {object} data 查询参数
 * @returns {object}
 */
export const getMaterialInfo = (data) => {
    return request({
        url: '/material/show',
        method: 'post',
        data
    })
}

/**
 * @description 删除物料
 * @param {object} data 删除参数
 * @returns {object}
 */
export const deleteMaterial = (data) => {
    return request({
        url: '/material/delete',
        method: 'post',
        data
    })
}

/**
 * @description 导出物料信息
 * @param {object} data 导出参数
 * @returns {object}
 */
export const exportMaterial = (data) => {
    return request({
        url: '/material/export',
        method: 'post',
        data
    })
}

/**
 * @description 导入物料信息
 * @param {object} data 导入参数
 * @returns {object}
 */
export const importMaterial = (data) => {
    return request({
        url: '/material/importData',
        method: 'post',
        data
    })
}

/**
 * @description 导出物料模版
 * @returns {object}
 */
export const exportMaterialTemplate = () => {
    return request({
        url: '/material/importTemplate',
        method: 'post',
        data: {}
    })
}


/**
 * @description 根据产品id查询bom清单
 * @param {string|number} id 查询参数
 * @returns {object}
 */
export const getBomList = (id, params) => {
    return request({
        url: '/products/ref/materials/list/' + id,
        method: 'get',
        params
    })
}



/**
 * 添加物料清单(BOM)列表
 * @param {Object} data - 要添加的BOM数据
 */
export const addBomList = (data) => {
    return request({  // 发送HTTP请求到服务器
        url: '/products/ref/materials',  // 请求的URL路径
        method: 'post',  // 请求方法为POST
        data
    })
}

/**
 * 删除物料清单(BOM)列表
 * @param {id}  id 删除参数
 */
export const deleteBomList = (id) => {
    return request({
        url: '/products/ref/materials/' + id,
        method: 'delete',
    })
}

/**
 * 修改关联物料数量
 * @param {Object} data - 要修改的关联物料数量数据
 */
export const updateBomList = (data) => {
    return request({
        url: '/products/ref/materials',
        method: 'put',
        data
    })
}


/**
 * 查询单个关联的物料
 * @param {id}  id 
 */
export const getIdBomList = (id) => {
    return request({
        url: '/products/ref/materials/' + id,
        method: 'get',
    })
}