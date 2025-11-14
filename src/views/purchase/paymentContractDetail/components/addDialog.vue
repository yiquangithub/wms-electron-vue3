<template>
  <el-dialog
    v-model="dialogVisible"
    @close="closeDialog"
    :title="`${dialogProps.title}付款计划`"
    :destroy-on-close="true"
    width="40%"
    draggable
  >
    <div class="main-content">
      <el-form
        ref="ruleFormRef"
        label-width="130px"
        :model="formData"
        :rules="rules"
        :disabled="dialogProps.isView"
      >
        <el-form-item label="付款阶段" prop="payPhase">
          <el-select v-model="formData.payPhase" placeholder="请选择付款阶段">
            <el-option
              v-for="dict in contract_pay_phase"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="付款比例" prop="percent">
          <el-input v-model="formData.percent" placeholder="请输入付款比例"
            ><template #append>%</template></el-input
          >
        </el-form-item>
        <el-form-item label="付款金额" prop="planAmount">
          <el-input v-model="formData.planAmount" placeholder="请输入付款金额">
            <template #append>元</template></el-input
          >
        </el-form-item>
        <el-form-item label="计划付款日期" prop="planDate">
          <el-date-picker
            v-model="formData.planDate"
            type="date"
            placeholder="请选择日期"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="payRemark">
          <el-input
            v-model="formData.payRemark"
            placeholder="请输入备注"
            type="textarea"
            rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="handleSubmit()"
        v-if="!dialogProps.isView"
        >提交</el-button
      >
      <el-button @click="closeDialog">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { ref } from "vue";
import { addPayment, updatePayment } from "@/api/purchase/payment";
const { proxy } = getCurrentInstance();
const { contract_pay_phase } = proxy.useDict("contract_pay_phase");
const dialogVisible = ref(false);
const dialogProps = ref({
  isView: false,
  title: "",
  row: {},
});
const rules = reactive({
  percent: [{ required: true, message: "请输入付款比例", trigger: "blur" }],
  planAmount: [{ required: true, message: "请输入付款金额", trigger: "blur" }],
  planDate: [{ required: true, message: "请选择日期", trigger: "change" }],
  payPhase: [{ required: true, message: "请选择付款阶段", trigger: "change" }],
});
const formData = ref({
  contractId: null,
  id: 0,
  payPhase: null,
  payRemark: "",
  percent: "",
  planAmount: null,
  planDate: "",
});
const emits = defineEmits(["getTableData"]);
const ruleFormRef = ref();
const acceptParams = async (params) => {
  dialogProps.value = params;
  dialogVisible.value = true;
  console.log(params);
  formData.value.contractId = params.contractId;
  if (params.row.id) {
    formData.value = params.row;
    formData.value.payPhase = params.row.payPhase
      ? String(params.row.payPhase)
      : null;
  }
};
const handleSubmit = async () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      let res;
      if (formData.value.id) {
        // 修改操作
        res = await updatePayment(formData.value);
      } else {
        // 新增操作
        res = await addPayment(formData.value);
      }
      if (res.code === 200) {
        ElMessage.success(formData.value.id ? "修改成功" : "新增成功");
        closeDialog();
        emits("getTableData");
      } else {
        ElMessage.error(res.msg);
      }
    } else {
      ElMessage.error("请完整填写表单必填项");
    }
  });
};
const closeDialog = () => {
  // 重置表单为默认值
  formData.value = {
    contractId: null,
    id: 0,
    payPhase: null,
    payRemark: "",
    percent: "",
    planAmount: null,
    planDate: "",
  };
  dialogVisible.value = false;
};
defineExpose({
  acceptParams,
});
</script>

<style scoped lang="scss"></style>
