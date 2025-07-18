<template>
  <div ref="chartRef" style="width: 100%; height: 600px"></div>
</template>
   
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
// import * as echarts from "echarts";
import Plotly from "plotly.js-dist";
// import boxData from "./box.json";
// const props = defineProps(["data", "secondData"]);
let resizeObserver = null;
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
const chartRef = ref(null);
const colors = ref([]);
let chart = null;
console.log(props.data);
// const dataset = [...boxData.source, ...boxData.transform];
// const seriesData = [...boxData.data];
// console.log(dataset);

// 初始化图表
const initChart = () => {
  Plotly.newPlot(
    chartRef.value,
    [
      {
        z: props.data.data,
        x: props.data.xaxis,
        y: props.data.yaxis,
        type: "heatmap",
        // 颜色控制
        zmin: props.data.min, // 色标最小值 (强制)
        zmax: props.data.max, // 色标最大值 (强制)
        colorscale: "Viridis", // 内置色标 (Viridis, Jet, Hot, Greys 等)
        zauto: true,
        // 或自定义色标:
        // colorscale: [
        //   [0, 'rgb(5, 10, 172)'],
        //   [0.5, 'rgb(40, 200, 255)'],
        //   [1, 'rgb(255, 255, 0)']
        // ],

        // 高级配置
        showscale: true, // 显示色标条
        // zsmooth: "best", // 平滑模式
        hoverongaps: false, // 禁止空值悬停
        connectgaps: false, // 连接缺失数据点
        transpose: false, // 转置矩阵

        // 文本标注
        // text: [
        //   ["高", "中", "高", "极高", "低"],
        //   ["中", "低", "中", "极高", "中"],
        //   ["高", "中", "低", "极高", "高"],
        //   ["低", "低", "中", "低", "中"],
        // ],
        hoverinfo: "x+y+z", // 悬停显示内容
        texttemplate: "%{z}", // 单元格文本显示

        // // 色标配置
        // colorbar: {
        //   title: "热度值",
        //   titleside: "right",
        //   tickvals: [0, 25, 50, 75, 100],
        //   ticktext: ["低", "中低", "中", "中高", "高"],
        // },
      },
    ],
    {
      // title: "多数据集箱线图示例",
      // xaxis: {
      //   title: "数据组",
      //   tickvals: [0, 1, 2],
      //   ticktext: ["组A", "组B", "组C"],
      // },
      // yaxis: {
      //   title: "数值范围",
      //   gridcolor: "#eee",
      //   zeroline: false,
      // },
      // paper_bgcolor: "rgba(255,255,255,0.9)", // 背景色
      // plot_bgcolor: "rgba(240,240,240,0.8)", // 绘图区背景
      // showlegend: false,
      // margin: { l: 60, r: 30, t: 60, b: 40 },
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
    },
    {
      responsive: true, // 响应式
      displaylogo: false, // 隐藏plotly logo
    }
  );
};

// 处理窗口大小变化
// const setupResizeObserver = () => {
//   resizeObserver = new ResizeObserver(() => {
//     Plotly.Plots.resize(chartRef.value);
//   });
//   resizeObserver.observe(chartRef.value);
// };

// 监听数据变化更新图表
watch(
  () => props.data,
  (newData) => {
    Plotly.react(chartRef.value, newData, props.layout);
  },
  { deep: true }
);

// 生命周期钩子
onMounted(() => {
  initChart();

  //   setupResizeObserver();
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (chartRef.value) {
    Plotly.purge(chartRef.value);
  }
});
</script>