<template>
  <div ref="lineChart" style="width: 100%; height: 600px"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Plotly from "plotly.js-dist";

const lineChart = ref(null);
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});
console.log(props.data)
// 折线图配置
const layout = {
  margin: {
    l: 80, // 左间距
    r: 120, // 右间距（为图例留空间）
    t: 80, // 上间距
    b: 60, // 下间距
    pad: 10, // 内边距
  },
  legend: {
    x: 1.05, // 横向位置（1=右边界）
    y: 0.95, // 纵向位置（1=顶部）
    xanchor: "left", // 锚点对齐方式
    yanchor: "top",
    bgcolor: "rgba(255,255,255,0.9)",
    bordercolor: "#ddd",
  },
  modebar: {
    orientation: "v", // 垂直排列模式栏
    bgcolor: "rgba(255,255,255,0.7)",
  },
  // title: "实验组阶段数据趋势",
  // width: 1000,
  // height: 600,
  // margin: { l: 80, r: 80, t: 80, b: 80 },

  // xaxis: {
  //   type: "category",
  //   gridcolor: "#eee",
  //   tickangle: -30,
  //   automargin: true,
  // },

  // yaxis: {
  //   range: [0.35, 1.05], // 匹配热力图数值范围
  //   gridcolor: "#f5f5f5",
  //   // tickvals: [0.4, 0.6, 0.8, 1.0],
  //   // ticktext: ["低阈值", "基准值", "优化值", "峰值"],
  // },

  // // 热力图风格继承
  // paper_bgcolor: "#f9f9f9",
  // plot_bgcolor: "white",
  // font: {
  //   family: "Arial",
  //   size: 12,
  // },

  // // 交互优化
  // hovermode: "x unified",
  // hoverlabel: {
  //   bgcolor: "rgba(255,255,255,0.9)",
  //   bordercolor: "#ddd",
  // },
};

// 初始化图表
onMounted(() => {
  console.log(props.data);
  const traces = [
    {
      x: props.data.x_list,
      y: props.data.y_list,
      // name: series.name,
      mode: "lines+markers",
      line: {
        color: "red",
        width: 2,
        // shape: "spline", // 平滑曲线
      },
      marker: {
        size: 8,
        symbol: "diamond-open",
      },
    },
  ];
  // const traces = chartData.value.series.map((series) => ({

  // }));
  Plotly.newPlot(lineChart.value, traces, layout, {
    responsive: true, // 响应式
    displaylogo: false, // 隐藏plotly logo
  });
});
</script>

<style>
.line-chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>