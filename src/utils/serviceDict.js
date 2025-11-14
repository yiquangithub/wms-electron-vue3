/**
 * @description: 入库单据类型
 */
export const documentTypeIn = [
    { label: '采购收货入库', value: 1 },
    { label: '销售退货入库', value: 2 },
    { label: '生产产品入库', value: 3 },
    { label: '领用退还入库', value: 4 },
    { label: '借货入库', value: 5 },
    { label: '借出还入', value: 6 },
];

/**
 * @description: 出库单据类型
 */
export const documentTypeOut = [
    { label: '采购收货出库', value: 1 },
    { label: '销售退货出库', value: 2 },
    { label: '生产产品出库', value: 3 },
    { label: '领用退还出库', value: 4 },
    { label: '借货出库', value: 5 },
    { label: '借入还出', value: 6 },
];

/**
 * @description: 移库单据类型
 */
export const documentTypeMove = [
    { label: '移库上架', value: 1 },
    { label: '仓库移库', value: 2 },
    { label: '报损移库', value: 3 },
];

/**
 * @description: 报损单据类型
 */
export const documentTypeLose = [
    { label: '损坏报损', value: 1 },
    { label: '丢失报损', value: 2 },
    { label: '其他报损', value: 3 },
];

/**
 * @description: 单据状态
 */
export const inventoryStatus = [
    { label: '待审核', value: -2 },
    { label: '审核不通过', value: -1 },
    { label: '审核通过', value: 1 },
    { label: '审核中', value: 2 },
];

/**
 * @description: 仓库类型
 */
export const warehouseType = [
    { label: '产品仓库', value: 1 },
    { label: '原料仓库', value: 2 },
    { label: '半成品仓库', value: 3 },
    { label: '废品仓库', value: 4 },
];

/**
 * @description: 仓位类型
 */
export const locationType = [
    { label: '正式库区', value: 1 },
    { label: '带入库区', value: 2 },
    { label: '待检库区', value: 3 },
    { label: '待出库区', value: 4 },
];

/**
 * @description: 供应商类型
 */
export const supplierType = [
    { label: '成品供应商', value: 1 },
    { label: '零件供应商', value: 2 },
    { label: '集合供应商', value: 3 },
];

/**
 * @description: 采购状态
 */
export const purchaseStatus = [
    { label: '全部入库', value: 1 },
    { label: '部分入库', value: 2 },
    { label: '订单取消', value: 3 },
    { label: '采购中', value: 4 },
];

/**
 * @description: 退货状态
 */
export const returnStatus = [
    { label: '订单确定', value: 1 },
    { label: '创建订单', value: 2 },
    { label: '订单取消', value: 3 },
];

/**
 * @description: 财务审核状态
 */
export const financeStatus = [
    { label: '待审核', value: 1 },
    { label: '审核通过', value: 2 },
    { label: '审核失败', value: 3 },
    { label: '部分付款', value: 4 },
    { label: '全部付款', value: 5 },
];

export const deviceType = [
    { label: 'RTSP', value: 'RTSP' },
    { label: 'RTMP', value: 'RTMP' },
    { label: 'HTTP', value: 'HTTP' },
];

export function getLabelByValue(list, value) {
    const item = list.find((item) => item.value === value);
    return item ? item.label : undefined;
}