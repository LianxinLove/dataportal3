<template>
  <div ref="plotlyChart" style="width: 100%; height: 600px"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Plotly from "plotly.js-dist";

const plotlyChart = ref(null);
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  layout: {
    type: Object,
    default: () => ({}),
  },
  config: {
    type: Object,
    default: () => ({}),
  },
});
// 数据预处理管道
const processData = (rawData) => {
  return rawData.map((exp) => ({
    ...exp,
    x: exp.x,
    y: exp.y,
  }));
};

// 生成轨迹配置
const generateTraces = () => {
  return processData(props.data.result).map((exp, index) => ({
    x: exp.x,
    y: exp.y,
    type: "scatterlg",
    mode: "lines",
    name: exp.name,
    line: {
      color: `hsl(${index * 45}, 70%, 50%)`, // 色相间隔45度
      width: 2,
      // shape: 'spline' // 平滑曲线
    },
    hoverinfo: "x+y+name",
    hovertemplate: `
      <b>%{fullData.name}</b><br>
      X: %{x:.2f}<br>
      Y: %{y:.2e}<extra></extra>
    `,
  }));
};

// 坐标轴配置
const layout = {
  // title: '实验数据趋势分析',
  // xaxis: {
  //   title: '参数值',
  //   tickformat: ',.2f',    // 保留两位小数
  //   showexponent: 'none',
  //   separatethousands: false,
  //   automargin: true,
  //   rangemode: 'tozero'     // 范围包含零点
  // },
  // yaxis: {
  //   title: '观测值',
  //   type: 'log',           // 对数坐标建议保留
  //   tickformat: ',r',
  //   separatethousands: false,
  //   exponentformat: 'e',   // 科学计数法显示
  //   automargin: true
  // },
  margin: {
    l: 80, // 左间距
    r: 200, // 右间距（为图例留空间）
    t: 80, // 上间距
    b: 60, // 下间距
    pad: 10, // 内边距
  },
  legend: {
    x: 1.05, // 横向位置（1=右边界）
    y: 1, // 纵向位置（1=顶部）
    xanchor: "left", // 锚点对齐方式
    yanchor: "top",
    bgcolor: "rgba(255,255,255,0.9)",
    bordercolor: "#ddd",
  },
  modebar: {
    orientation: "v", // 垂直排列模式栏
    bgcolor: "rgba(255,255,255,0.7)",
  },
};

onMounted(() => {
  console.log(generateTraces());
  Plotly.newPlot(plotlyChart.value, generateTraces(), layout, {
    scrollZoom: true, // 启用滚轮缩放
    doubleClick: "reset", // 双击复位
  });
});
</script>
