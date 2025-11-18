<template>
  <footer class="status-bar">
    <div class="status-left">
      <div class="status-info">
        <span class="status-label">货柜编号:</span>
        <span class="status-value primary">A01</span>
      </div>
      <div class="status-info">
        <span class="status-label">运行:</span>
        <span class="status-value success">0时11分</span>
      </div>
      <div class="status-info">
        <span class="status-label">PLC通信:</span>
        <span class="status-value success">
          <span class="status-indicator"></span>
          正常
        </span>
      </div>
    </div>
    <div class="status-right">
      <div class="status-info">
        <span class="status-label">库存量:</span>
        <span class="status-value">12547</span>
      </div>
      <div class="status-info">
        <span class="status-label">今日入库量:</span>
        <span class="status-value info">100</span>
      </div>
      <div class="status-info">
        <span class="status-label">今日出库量:</span>
        <span class="status-value warning">125</span>
      </div>
    </div>
  </footer>
</template>
<style type="scss" scoped>
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #304156;
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(71, 85, 105, 0.5);
  font-size: 16px;

  .status-left,
  .status-right {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-label {
      color: #94a3b8;
    }

    .status-value {
      font-weight: 600;
      color: #e2e8f0;

      &.primary {
        color: #00d9ff;
      }

      &.success {
        color: #00ff88;
      }

      &.info {
        color: #0095ff;
      }

      &.warning {
        color: #ffa500;
      }
    }

    .status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00ff88;
      animation: pulse 2s infinite;
      margin-right: 4px;
    }
  }
}
</style>
