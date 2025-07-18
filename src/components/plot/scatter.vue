<template>
  <div ref="chartContainer" class="plotly-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import Plotly from "plotly.js-dist";

const props = defineProps({
  data: { type: Object, required: true }, // 对应你的JSON结构
  config: { type: Object, default: () => ({ responsive: true }) },
});

const chartContainer = ref(null);
let plotInstance = null;

// 渲染/更新图表
const renderPlot = () => {
  if (!chartContainer.value) return;

  if (plotInstance) {
    // 动态更新数据（避免全量重绘）
    Plotly.react(
      chartContainer.value,
      props.data.data,
      props.data.layout,
      props.config
    );
  } else {
    // 初始化渲染
    plotInstance = Plotly.newPlot(
      chartContainer.value,
      props.data.data,
      props.data.layout,
      props.config
    );
  }
};

// 监听数据变化
watch(() => props.data, renderPlot, { deep: true });

// 响应窗口大小变化（防抖优化）
window.addEventListener("resize", () => {
  if (plotInstance) Plotly.Plots.resize(chartContainer.value);
});

// 销毁时释放资源
onBeforeUnmount(() => {
  if (plotInstance) Plotly.purge(chartContainer.value);
});

onMounted(renderPlot);
</script>

<style scoped>
.plotly-container {
  min-height: 65vh;
  width: 100%;
}
</style>