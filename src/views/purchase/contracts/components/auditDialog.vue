<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`${dialogProps.title}`"
    :destroy-on-close="true"
    width="50%"
    draggable
    class="audit-dialog"
  >
    <div class="audit-record-container">
      <el-timeline class="audit-timeline">
        <el-timeline-item
          v-for="(record, index) in auditRecords"
          :key="index"
          :type="getType(record)"
          :hollow="false"
          :timestamp="record.checkTime"
          placement="top"
        >
          <template #dot>
            <div
              class="timeline-icon"
              :class="getIconClass(record)"
            >
              <component :is="getIcon(record)" />
            </div>
          </template>
          <el-card class="record-card" :class="getCardClass(record)">
            <div class="record-header">
              <div class="record-title">{{ record.nodeName }}</div>
              <div class="record-status" :class="getStatusClass(record)">
                {{ getStatusText(record) }}
              </div>
            </div>
            <div class="record-content">
              <div class="record-auditor">
                <span class="auditor-label">处理人：</span>
                <span class="auditor-name">{{ record.creatorName || '待分配' }}</span>
              </div>
              <div v-if="record.checkRemark" class="record-comment">
                <div class="comment-label">审核意见：</div>
                <div class="comment-text">{{ record.checkRemark }}</div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button   @click="closeDialog">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Document, SuccessFilled,Clock } from '@element-plus/icons-vue'
import { checkContact } from '@/api/purchase/contract.js'
const dialogVisible = ref(false)
const dialogProps = ref({
  isView: false,
  title: '',
  row: {},
})
const auditRecords = ref([])
const getIcon = (record) => {
  if (record.nodeName && record.nodeName.includes('提交申请')) {
    return Document
  }
  if (record.checkStatus === 1) {
    return SuccessFilled
  }
  return Clock
}
const getType = (record) => {
  if (record.checkStatus === 1) {
    return 'success'
  }
  if (record.nodeName && record.nodeName.includes('提交申请')) {
    return 'primary'
  }
  return 'info'
}
const getIconClass = (record) => {
  if (record.nodeName && record.nodeName.includes('提交申请')) {
    return 'timeline-icon--submitted'
  }
  if (record.checkStatus === 1) {
    return 'timeline-icon--approved'
  }
  return 'timeline-icon--pending'
}
const getCardClass = (record) => {
  if (record.nodeName && record.nodeName.includes('提交申请')) {
    return 'record-card--submitted'
  }
  if (record.checkStatus === 1) {
    return 'record-card--approved'
  }
  return 'record-card--pending'
}
const getStatusClass = (record) => {
  if (record.nodeName && record.nodeName.includes('提交申请')) {
    return 'status--submitted'
  }
  if (record.checkStatus === 1) {
    return 'status--approved'
  }
  return 'status--pending'
}
const getStatusText = (record) => {
  if (record.checkStatusStr) {
    return record.checkStatusStr
  }
  if (record.nodeName && record.nodeName.includes('提交申请')) {
    return '已提交'
  }
  return '待处理'
}
const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true
  dialogProps.value.title = params.row.name + ' 审核记录'
  try {
    const res = await checkContact(params.row.id)
    auditRecords.value = res.data || []
  } catch (error) {
    console.error('获取审核记录失败:', error)
    auditRecords.value = []
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}

defineExpose({
  acceptParams,
})
</script>

<style scoped>
.audit-record-container {
  padding: 20px 30px;
  min-height: 300px;
}

.audit-timeline {
  max-width: 100%;
  padding-left: 0;
}

.audit-timeline :deep(.el-timeline-item__tail) {
  left: 15px;
  border-left: 2px dashed #dcdfe6;
}

.audit-timeline :deep(.el-timeline-item__node) {
  left: 15px;
}

.audit-timeline :deep(.el-timeline-item__wrapper) {
  padding-left: 30px;
}

.audit-timeline :deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 14px;
}

.timeline-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.timeline-icon--submitted {
  background-color: #409eff;
}

.timeline-icon--approved {
  background-color: #67c23a;
}

.timeline-icon--pending {
  background-color: #909399;
}

.record-card {
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: none;
  transition: all 0.2s ease-in-out;
}

.record-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.record-card--submitted {
  border-left: 4px solid #409eff;
}

.record-card--approved {
  border-left: 4px solid #67c23a;
}

.record-card--pending {
  border-left: 4px solid #909399;
}

.record-card :deep(.el-card__body) {
  padding: 16px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
  margin: 0;
}

.record-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status--submitted {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.status--approved {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status--pending {
  background-color: #fafafa;
  color: #909399;
  border: 1px solid #d9d9d9;
}

.record-auditor {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.auditor-label {
  color: #909399;
  margin-right: 4px;
  font-weight: 500;
}

.auditor-name {
  color: #303133;
  font-weight: 500;
}

.record-comment {
  background-color: #f8f9fa;
  border-left: 3px solid #e4e7ed;
  padding: 10px 12px;
  border-radius: 4px;
  margin-top: 8px;
}

.comment-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  margin-bottom: 4px;
}

.comment-text {
  font-size: 13px;
  color: #303133;
  line-height: 1.5;
  word-break: break-all;
} 
</style>
