<template>
  <!-- 采购合同 -->
  <el-dialog
    v-model="dialogVisible"
    :title="`${dialogProps.title}采购合同`"
    :destroy-on-close="true"
    width="60%"
    draggable
    class="quotation-dialog"
  >
    <div
      v-loading="pdfLoading"
      element-loading-text="正在生成PDF，请稍候..."
      class="main-content contract-container"
    >
      <div id="contract-content">
        <div class="contract-header">
          <img
            v-if="contractData?.logo"
            ref="sealImage"
            :src="contractData?.logo"
            alt="logo"
            class="logo"
          />
          <p class="title">产品购销合同</p>
          <div class="header-layout">
            <div class="left-section">
              <div class="info-item">
                <span class="label">&nbsp;</span>
                <span class="value"></span>
              </div>
              <div class="info-item">
                <span class="label">供方：</span>
                <span class="value">{{ contractData.supplierName }}</span>
              </div>
              <div class="info-item">
                <span class="label">需方：</span>
                <span class="value">{{ contractData.buyerName }}</span>
              </div>
            </div>
            <div class="right-section">
              <div class="info-item">
                <span class="label">合同编号：</span>
                <span class="value">{{ contractData.code || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">签订时间：</span>
                <span class="value">{{ contractData.signingDate || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">签订地点：</span>
                <span class="value">{{
                  contractData.supplierAddress || '-'
                }}</span>
              </div>
            </div>
          </div>
          <div class="header-row">
            <p>
              依照中华人民共和国经济合同法，经供需双方友好协商，签订本合同，具体条款如下：
            </p>
          </div>
        </div>

        <div class="contract-body">
          <p class="section-title">一、产品名称、型号、数量、单价、金额：</p>

          <div class="material-section">
            <table class="material-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>物料名称</th>
                  <th>型号</th>
                  <th>单位</th>
                  <th>单价</th>
                  <th>数量</th>
                  <th>货期 (天)</th>
                  <th>税率</th>
                  <th>含税单价 (元)</th>
                  <th>含税总价 (元)</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in contractData.meterials"
                  :key="item.id"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.specifications }}</td>
                  <td>{{ item.unitName }}</td>
                  <td>{{ item.price }}</td>
                  <!-- 采购数量 -->
                  <td>{{ item.purchaseQuantity }}</td>
                  <td>{{ item.deliveryDate }}</td>
                  <td v-if="!dialogProps.isPreview">
                    {{ item.taxRate * 100 }}%
                  </td>
                  <td v-else>{{ item.taxRateType }}%</td>
                  <td v-if="!dialogProps.isPreview">
                    {{ item.priceIncludeTax }}
                  </td>
                  <td v-else>
                    {{
                      (
                        parseFloat(item.price || 0) *
                        (1 + parseFloat(item.taxRateType || 0) / 100)
                      ).toFixed(2)
                    }}
                  </td>
                  <td v-if="!dialogProps.isPreview">
                    {{ item.priceTotalIncludeTax }}
                  </td>
                  <td v-else>
                    {{
                      (
                        parseFloat(item.price || 0) *
                        parseFloat(item.demandQuantity || 0) *
                        (1 + parseFloat(item.taxRateType || 0) / 100)
                      ).toFixed(2)
                    }}
                  </td>
                  <td>{{ item.remark }}</td>
                </tr>
              </tbody>
            </table>

            <div class="price-summary">
              <span class="price-total" v-if="!dialogProps.isPreview">
                {{ contractData.chineseQuotePrice }}
                <span class="price-remark">
                  {{ contractData.priceRemark }}
                </span>
              </span>
              <span class="price-total" v-else>
                合计：{{ calculateTotalWithTax() }}元（含税）
                <span class="price-remark">
                  {{ contractData.priceRemark }}
                </span>
              </span>
            </div>
          </div>

          <div class="contract-clauses">
            <p class="section-title">
              二、交货地点：<span class="clause-content"
                >双方协商指定交货地点。</span
              >
            </p>
            <p class="section-title">
              三、交货时间：<span class="clause-content">{{
                contractData.deliveryTime
              }}</span>
            </p>
            <p class="section-title">
              四、运输方式：<span class="clause-content"
                >除非双方另有约定，在满足合同交付时间并保证产品安全前提下，乙方应按照甲方要求货运方式将产品送达甲方。</span
              >
            </p>

            <p class="section-title">
              五、运输费用：<span class="clause-content"
                >由乙方承担，货物需要保险的，保险费用由甲方承担。</span
              >
            </p>
            <p class="section-title">
              六、结算方式：<span class="clause-content">{{
                contractData.paymentTypeStr
              }}</span>
            </p>
            <p class="section-title">
              七、质量要求、技术标准：<span class="clause-content"
                >产品质量须符合国家或行业标准。如合同附件对产品质量有特别约定，以合同附件的特别约定为准，合同附件具
                有同等法律效力。</span
              >
            </p>
            <p class="section-title">
              八、验收标准及质量问题处理：<span class="clause-content"
                >甲方提出质量异议的期限为产品到货后 3
                天内以书面形式通知乙方，逾期未验收或未提出书面异议，则视为已
                验收合格，质保期内如有质量问题，甲方应书面通知乙方。甲方因使用、保管、保养不善等造成产品质量下降，不得提出异议。</span
              >
            </p>
            <p class="section-title">
              九、违约责任：<span class="clause-content"
                >双方友好协商解决，协商不成时，按合同法有关条款执行。</span
              >
            </p>
            <p class="section-title">
              十、解决合同纠纷方式：<span class="clause-content"
                >由当事人双方协商解决，协商不成，双方均可向供方所在地人民法院提起诉讼。</span
              >
            </p>
            <p class="section-title">
              十一、合同生效：<span class="clause-content"
                >自双方签字盖章之日起生效，本合同一式二份，双方各执一份，传真件和扫描件均有效。</span
              >
            </p>
            <p class="section-title">
              十二、其他约定事项：<span class="clause-content"
                >如何一方因不可抗力因素被迫推迟或推迟该合同执行，须双方书面形式确认生效。</span
              >
            </p>
          </div>
        </div>
        <div class="contract-signatures">
          <div class="signature-section">
            <div class="signature-table">
              <div class="signature-row">
                <div class="signature-cell">
                  供方 ：{{ contractData?.supplierName || '-' }}
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell signature-height">
                  单位名称（盖章）：
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">经办人（签字）：</div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">
                  公司地址：{{ contractData?.supplierAddress || '-' }}
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">
                  联系电话：{{ contractData?.supplierContacts }}-{{
                    contractData?.supplierContactsPhone
                  }}
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">
                  公司税号：{{ contractData?.supplierCreditCode || '-' }}
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">
                  开户银行：{{ contractData?.supplierAccountBank || '-' }}
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">
                  银行账号：{{ contractData?.supplierAccountNum || '-' }}
                </div>
              </div>
            </div>
          </div>
          <div class="signature-section">
            <div class="signature-table">
              <div class="signature-row">
                <div class="signature-cell">
                  需方：{{ contractData?.buyerName }}
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell signature-height">
                  单位名称（盖章）：
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">经办人（签字）：</div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">
                  公司地址：{{ contractData?.buyerAddress || '-' }}
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">
                  联系电话：{{ contractData?.buyerContacts }}-{{
                    contractData?.buyerContactsPhone
                  }}
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">
                  公司税号：{{ contractData?.buyerCreditCode || '-' }}
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">
                  开户银行：{{ contractData?.buyerAccountBank || '-' }}
                </div>
              </div>
              <div class="signature-row">
                <div class="signature-cell">
                  银行账号：{{ contractData?.buyerAccountNum || '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="closeDialog">返回</el-button>
      <el-button
        type="primary"
        @click="exportPdfAdvanced"
        :loading="pdfLoading"
        v-if="!dialogProps.isPreview"
        >导出PDF</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { contactDetails } from '@/api/purchase/contract.js'
import html2pdf from 'html2pdf.js'
import { ElMessage } from 'element-plus'
const dialogVisible = ref(false)
const pdfLoading = ref(false)
const contractData = ref({})
const dialogProps = ref({
  isView: false,
  isAudit: false,
  title: '',
  isPreview: false,
  row: {},
})
const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true
  if (params.isPreview) {
    contractData.value = params.row
  } else {
    contactDetails(params.row.id).then((res) => {
      contractData.value = res.data
    })
  }
}
const closeDialog = () => {
  dialogVisible.value = false
}

const calculateTotalWithTax = () => {
  let total = 0
  if (contractData.value.meterials && contractData.value.meterials.length > 0) {
    total = contractData.value.meterials.reduce((sum, item) => {
      // 确保数据类型正确
      const price = parseFloat(item.price || 0)
      const quantity = parseFloat(item.demandQuantity || 0)
      // 在预览模式下使用taxRateType，非预览模式使用taxRate
      const taxRate = parseFloat(item.taxRateType || item.taxRate || 0)
      const itemTotal = price * quantity * (1 + taxRate / 100)
      return sum + itemTotal
    }, 0)
  }
  return total.toFixed(2)
}
const sealImage = ref(null)
const exportPdfAdvanced = async () => {
  const element = document.getElementById('contract-content')
  if (!element) return
  pdfLoading.value = true
  try {
    await new Promise((resolve) => {
      const imgElement = sealImage.value
      if (imgElement && imgElement.complete) {
        resolve(true)
      } else if (imgElement) {
        imgElement.onload = () => resolve(true)
        imgElement.onerror = () => {
          console.error('公章图片加载失败')
          resolve(true)
        }
      } else {
        resolve(true)
      }
    })
    const opt = {
      margin: [10, 10, 10, 10],
      filename: contractData.value.name + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }
    await html2pdf().set(opt).from(element).save()
  } catch (error) {
    console.error('导出PDF失败:', error)
    ElMessage.error('导出PDF失败，请重试')
  } finally {
    pdfLoading.value = false
  }
}
defineExpose({
  acceptParams,
})
</script>

<style scoped>
.contract-container {
  /* font-family: '宋体', 'SimSun', serif; */
  font-size: 14px;
  line-height: 1.8;
  color: #000;
  padding: 20px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: -70px;
}
.title {
  font-size: 24px;
  text-align: center;
  font-weight: bold;
}

.contract-header h1 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

.header-layout {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 40px;
}

.left-section {
  flex: 1;
}

.right-section {
  flex: 1;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  color: #000;
  text-align: left;
}

.value {
  color: #555;
}

.header-row {
  margin-bottom: 10px;
}

.header-row p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.section-title {
  font-weight: bold;
  margin: 15px 0 10px 0;
  font-size: 14px;
}

.clause-content {
  font-weight: normal;
  color: #555;
}

.contract-clauses {
  margin: 20px 0;
}

.material-section {
  margin: 0;
}

.material-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0;
  font-size: 14px;
}

.material-table th,
.material-table td {
  border: 1px solid #000;
  padding: 8px 12px;
  text-align: center;
  vertical-align: middle;
  line-height: 1.4;
}

.material-table th {
  background-color: #f5f7fa;
  font-weight: bold;
  color: #303133;
}

.material-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.material-table tbody tr:hover {
  background-color: #f0f9ff;
}

.price-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  padding: 12px 15px;
  border: 1px solid #000;
  border-top: none;
  margin-bottom: 20px;
}

.price-total {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.price-remark {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

.contract-signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  gap: 40px;
}

.signature-section {
  flex: 1;
}

.signature-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #000;
  padding: 8px;
  background-color: #f5f5f5;
}

.signature-row:last-child {
  border-bottom: 1px solid #000;
}

.signature-cell {
  padding: 12px 15px;
  font-size: 14px;
  line-height: 1.4;
  background-color: #fff;
  min-height: 20px;
  border: 1px solid #000;
  border-bottom: none;
}
.signature-height {
  padding: 20px 15px;
}
</style>
```
