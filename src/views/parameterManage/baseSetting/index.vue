<template>
  <div class="unit-container layout-padding">
    <div class="unit-padding layout-padding-view layout-padding-auto">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        class="config-form"
      >
        <el-card class="box-card" shadow="never">
          <!-- 基本信息设置 -->
          <div class="section-title">基本信息设置</div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="货柜编码" prop="cabinetCode">
                <el-input
                  v-model="form.cabinetCode"
                  placeholder="请输入货柜编码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="货柜名称" prop="cabinetName">
                <el-input
                  v-model="form.cabinetName"
                  placeholder="请输入货柜名称"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 其他信息设置 -->
          <div class="section-title">其他信息设置</div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="货柜层数" prop="layers">
                <el-input-number
                  v-model="form.layers"
                  :min="1"
                  :max="50"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="货柜每层格子数" prop="gridsPerLayer">
                <el-input-number
                  v-model="form.gridsPerLayer"
                  :min="1"
                  :max="50"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="每层最大载重" prop="maxLoadPerLayer">
                <el-input
                  v-model.number="form.maxLoadPerLayer"
                  style="width: 100%"
                >
                  <template #append>kg</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="过载门限" prop="overloadThreshold">
                <el-input-number
                  v-model="form.overloadThreshold"
                  :min="0"
                  :precision="0"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="偷窥门限" prop="peekThreshold">
                <el-input-number
                  v-model="form.peekThreshold"
                  :min="0"
                  :precision="0"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 层、格子、料盒号编写规则 -->
          <div class="section-title">
            层、格子、料盒号编写规则：
            <span class="rule-example">(XX01-YY01-ZZ01)</span>
          </div>

          <el-row :gutter="20" class="rule-row">
            <el-col :span="3" :offset="3">
              <el-input
                v-model="form.layerPrefix"
                maxlength="1"
                placeholder="L"
              />
            </el-col>
            <el-col :span="1" class="separator">-</el-col>
            <el-col :span="3">
              <el-input
                v-model="form.gridPrefix"
                maxlength="1"
                placeholder="B"
              />
            </el-col>
            <el-col :span="1" class="separator">-</el-col>
            <el-col :span="3">
              <el-input
                v-model="form.boxPrefix"
                maxlength="1"
                placeholder="C"
              />
            </el-col>
          </el-row>

          <div class="submit-bar">
            <el-button type="primary" :loading="saving" @click="handleSave">
              保存配置
            </el-button>
          </div>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";

const formRef = ref<FormInstance>();

// 表单数据
const form = reactive({
  cabinetCode: "A01",
  cabinetName: "一号仓库",
  layers: 22,
  gridsPerLayer: 22,
  maxLoadPerLayer: 50,
  overloadThreshold: 50,
  peekThreshold: 50,
  layerPrefix: "L",
  gridPrefix: "B",
  boxPrefix: "C",
});

const saving = ref(false);

// 表单校验规则
const rules = reactive<FormRules>({
  cabinetCode: [{ required: true, message: "请输入货柜编码", trigger: "blur" }],
  cabinetName: [{ required: true, message: "请输入货柜名称", trigger: "blur" }],
  layers: [{ required: true, message: "请输入货柜层数", trigger: "change" }],
  gridsPerLayer: [
    { required: true, message: "请输入每层格子数", trigger: "change" },
  ],
  maxLoadPerLayer: [
    { required: true, message: "请输入每层最大载重", trigger: "blur" },
    { type: "number", min: 1, message: "载重必须大于0", trigger: "blur" },
  ],
  overloadThreshold: [
    { required: true, message: "请输入过载门限", trigger: "change" },
  ],
  peekThreshold: [
    { required: true, message: "请输入偷窥门限", trigger: "change" },
  ],
});

// 保存
const handleSave = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true;
      try {
        // 这里替换成真实的接口
        // await api.saveCabinetConfig(form)
        console.log("提交的数据：", form);
        ElMessage.success("保存成功");
      } catch (error) {
        ElMessage.error("保存失败");
      } finally {
        saving.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.unit-padding {
  padding: 15px;
}

.box-card {
  border-radius: 8px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  margin: 30px 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.rule-example {
  margin-left: 10px;
  color: #909399;
  font-weight: normal;
}

.rule-row {
  align-items: center;
  margin-top: 10px;
}

.separator {
  text-align: center;
  line-height: 40px;
  color: #999;
  font-size: 18px;
}

.submit-bar {
  margin-top: 40px;
  text-align: center;
}
</style>
