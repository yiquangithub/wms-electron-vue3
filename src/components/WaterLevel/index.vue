<template>
  <div class="water-level">
    <div class="water-level-container">
      <div class="wave" :style="waveStyle"></div>
      <div class="percentage-text">{{ percentage }}%</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  percentage: {
    type: [Number, String],
    required: true,
    validator: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 100;
    },
  },
  color: {
    type: String,
    default: "#4CAF50",
  },
});

const waveStyle = computed(() => {
  const percentageNum = Math.min(Math.max(Number(props.percentage), 0), 100);
  return {
    height: `${percentageNum}%`,
    bottom: 0,
    background: props.color,
  };
});
</script>

<style scoped>
.water-level {
  display: inline-block;
  width: 60px;
  height: 60px;
  position: relative;
}

.water-level-container {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #99abc5;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.wave {
  width: 200%;
  position: absolute;
  left: -50%;
  animation: wave 3s ease-in-out infinite; /* 动画时长和缓动优化 */
  transition: height 0.3s ease;
  border-top-left-radius: 50%; /* 增加顶部弧度，模拟波浪 */
  border-top-right-radius: 50%;
}

.percentage-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  color: black;
}

@keyframes wave {
  0% {
    transform: translateX(0) translateY(0);
  }
  25% {
    transform: translateX(-10%) translateY(-2%); /* 轻微上下波动 */
  }
  50% {
    transform: translateX(-20%) translateY(0);
  }
  75% {
    transform: translateX(-10%) translateY(2%); /* 轻微上下波动 */
  }
  100% {
    transform: translateX(0) translateY(0);
  }
}
</style>
