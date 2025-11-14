<template>
  <el-dialog
    v-model="dialogVisible"
    title="报价单"
    :destroy-on-close="true"
    width="60%"
    draggable
    class="quotation-dialog"
  >
    <div
      v-loading="pdfLoading"
      element-loading-text="正在生成PDF，请稍候..."
      class="main-content"
    >
      <div id="quotation-content" class="quotation-form">
        <div class="company">
          <div class="company-log">
            <img
              ref="logoImage"
              :src="baseUrl + quotationSet?.logo"
              alt="logo"
              class="company-logo"
            />
          </div>
          <div class="company-info">
            <p>公司名称：{{ quotationSet?.name }}</p>
            <p>公司地址：{{ quotationSet?.address }}</p>
            <p>联系人：{{ quotationSet?.contacts }}</p>
            <p>其他联系人：{{ quotationSet?.otherContacts }}</p>
          </div>
        </div>
        <h2 class="title">报价单</h2>
        <div class="header-info">
          <div class="left-info">
            <p>
              询价单位: <span>{{ formData.inquiryUnitName }}</span>
            </p>
            <p>
              询价人员: <span>{{ formData.inquiryUnitContacts }}</span>
            </p>
            <p>
              联系方式: <span>{{ formData.inquiryUnitContactsPhone }}</span>
            </p>
            <p>
              询价日期: <span>{{ formData.inquiryDate }}</span>
            </p>
          </div>
          <div class="right-info">
            <p>
              报价单位: <span>{{ formData.quoteUnitName }}</span>
            </p>
            <p>
              报价人员: <span>{{ formData.quoteUnitContacts }}</span>
            </p>
            <p>
              联系方式: <span>{{ formData.quoteUnitContactsPhone }}</span>
            </p>
            <p>
              报价日期: <span>{{ formData.quoteDate }}</span>
            </p>
          </div>
        </div>
        <p class="greeting">
          首先感谢贵司对我司的大力支持,我司将以提供高性价比产品和优质服务为宗旨,竭诚为您服务！产品报价如下:
        </p>
        <table class="material-table">
          <thead>
            <tr>
              <th>物料名称</th>
              <th>品牌</th>
              <th>型号</th>
              <th>数量</th>
              <th>单位</th>
              <th>货期(天)</th>
              <th>税率</th>
              <th>含税单价(元)</th>
              <th>含税总价(元)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in formData.meterials" :key="index">
              <td>{{ item.name }}</td>
              <td>{{ item.brand }}</td>
              <td>{{ item.specifications }}</td>
              <td>{{ item.demandQuantity }}</td>
              <td>{{ item.unitName }}</td>
              <td>{{ item.deliveryDate }}</td>
              <td>{{ item.taxRate * 100 }}%</td>
              <td>{{ item.priceIncludeTax }}</td>
              <td>{{ item.priceTotalIncludeTax }}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-seal-container">
          <div class="total-info">
            <p class="total-amount">{{ formData.quotePriceStr }}</p>
            <p class="chinese-amount">
              <span>{{ formData.chineseQuotePrice }}</span>
            </p>
          </div>
          <div class="seal-placeholder">
            <img
              ref="sealImage"
              :src="baseUrl + quotationSet?.officialSeal"
              alt="公章"
              class="company-seal"
            />
          </div>
        </div>
        <div class="notes-section">
          <h3>备注:</h3>
          <div v-html="formData.remark"></div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="closeDialog">返回</el-button>
      <el-button type="primary" @click="exportPdfAdvanced" :loading="pdfLoading"
        >导出PDF</el-button
      >
      <el-button type="primary" @click="printQuotationAdvanced">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { getQuotationDetail } from '@/api/sales/myQuotation'
import { getQuotationSetting } from '@/api/sales/quotationSet'
import html2pdf from 'html2pdf.js'
import { ElMessage } from 'element-plus'
const baseUrl = ref(import.meta.env.VITE_APP_BASE_API)
const dialogVisible = ref(false)
const pdfLoading = ref(false)
const dialogProps = ref({
  isView: false,
  isAudit: false,
  title: '',
  row: {},
})
const formData = ref({
  inquiryUnitName: '',
  inquiryUnitContacts: '',
  inquiryUnitContactsPhone: '',
  inquiryDate: '',
  quoteUnitName: '',
  quoteUnitContacts: '',
  quoteUnitContactsPhone: '',
  quoteDate: '',
  meterials: [],
  quotePriceStr: '',
  chineseQuotePrice: '',
  remark: '',
})

const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true
  await getQuotationSettingHandle()
  console.log(params)
  await getQuotationDetail({ id: params.row.id }).then((res) => {
    formData.value = res.data
    if (formData.value.remark) {
      formData.value.remark = formData.value.remark.replace(/\n/g, '<br>')
    }
  })
}
const quotationSet = ref()
const getQuotationSettingHandle = async () => {
  const res = await getQuotationSetting()
  if (res.code === 200) {
    quotationSet.value = res.data
  }
}
const sealImage = ref < HTMLImageElement > null
const exportPdfAdvanced = async () => {
  const element = document.getElementById('quotation-content')
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
      filename: '报价单.pdf',
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
const printQuotationAdvanced = () => {
  // 获取要打印的元素
  const printContent = document.getElementById('quotation-content')
  if (!printContent) {
    ElMessage.warning('未找到打印内容')
    return
  }
  // 创建打印窗口
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    ElMessage.warning('浏览器阻止了弹出窗口，请允许弹出窗口后重试')
    return
  }
  // 获取当前样式
  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n')
      } catch (e) {
        return ''
      }
    })
    .join('\n')
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          /* 基础字体设置，确保中文显示 */
          * {
            font-family: "SimSun", "宋体", "Microsoft YaHei", "微软雅黑",
                         "Heiti SC", "黑体", "Arial Unicode MS", sans-serif !important;

          }

          @media print {
						@page {
              size: A4; /* 您可以继续使用 A4 或改为 auto */
              margin: 0 !important;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              /* 打印专用字体设置 */
              font-family: "SimSun", "宋体", serif !important;

            }
            .no-print { display: none !important; }
          }

          body {
            color: #000;
            line-height: 1.6;

          }

          /* 确保表格内容的字体设置 */
          .material-table, .material-table th, .material-table td {
            font-family: "SimSun", "宋体", serif !important;
          }

          /* 其他样式保持不变 */
          ${styles}
          .quotation-form { padding: 0;	height: 100%;padding-top:30px; }
          .material-table { page-break-inside: avoid; }
          .total-seal-container { page-break-inside: avoid; }
          .print-header, .print-footer { text-align: center; margin: 10px 0; }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
        <script>
          window.onload = function() {
            // 确保所有内容加载完成后再打印
            setTimeout(() => {
              window.print();
              window.onafterprint = function() { window.close(); };
            }, 500); // 延迟确保字体加载
          }
        <\/script>
      </body>
    </html>
  `

  // 写入并关闭文档
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // 双重保障触发打印
  printWindow.onload = function () {
    setTimeout(() => {
      printWindow.print()
      printWindow.onafterprint = function () {
        printWindow.close()
      }
    }, 500)
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}
defineExpose({
  acceptParams,
})
</script>

<style scoped lang="scss">
@media print {
  @page {
    size: A4;
  }
}
.main-content {
  color: #000;
  font-family: 'SimSun', '宋体', serif !important;
  min-height: calc(100vh - 100px);
}
.company {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  p {
    line-height: 1.6;
    margin: 8px 0;
  }
  .company-log {
    img {
      width: 100px;
      height: 100px;
    }
  }
}
.quotation-form {
  // padding: 0 10px;
  background-color: #fff;
  color: #000;
  line-height: 1.6;
}

.title {
  text-align: center;
  font-size: 30px;
  margin-bottom: 10px;
}

.header-info {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 14px;
  margin: 0 30px;
}

.left-info,
.right-info {
  width: 45%;
}

.header-info p {
  margin: 8px 0;
}

.greeting {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
}
.material-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #5b5c5d;
  font-size: 14px;
  th,
  td {
    border: 1px solid #5b5c5d;
    padding: 12px 8px;
    text-align: center;
    line-height: 1.5;
  }

  th {
    font-size: 16px;
    background-color: #f0f0f0;
  }
}

.total-seal-container {
  position: relative;
  page-break-inside: avoid;
  min-height: 120px;
}

.total-info {
  font-weight: bold;
  font-size: 14px;
  position: relative;
  z-index: 2;
}

.total-amount {
  color: #000;
  font-size: 16px;
  border: 1px solid #5b5c5d;
  text-align: center;
  border-top: none;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.chinese-amount {
  color: #000;
  font-size: 16px;
  border: 1px solid #5b5c5d;
  border-top: none;
  text-align: center;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.seal-placeholder {
  position: absolute;
  right: 0px;
  top: 5px;
  width: 200px;
  height: 200px;
  z-index: 1;
}

.company-seal {
  width: 200px;
  height: 200px;
}

.notes-section {
  font-size: 14px;
  page-break-inside: avoid;
}

.notes-section h3 {
  margin-bottom: 10px;
  font-size: 16px;
}
</style>
