<template>
  <div ref="bubbleChart" class="bio-bubble-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import Plotly from "plotly.js-dist";

const bubbleChart = ref(null);
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
// 模拟富集分析数据
const enrichmentData = ref(props.data);
// 数据预处理.
const processedData = ref([]);

console.log(processedData.value);

// 轨迹配置
const generateTrace = () => ({
  type: "scatter",
  mode: "markers",
  x: processedData.value.map((d) => d.x),
  y: processedData.value.map((d) => d.y),
  text: processedData.value.map((d) => d.name),
  hoverinfo: "text+x+name",
  marker: {
    size: processedData.value.map((d) => 1 * 1),
    sizemode: "diameter",
    sizeref: 0.1,
    color: processedData.value.map((d) => d.pvalue),
    colorscale: [
      [0, "rgb(147,112,219)"], // 紫色
      [1, "rgb(255,0,0)"], // 红色
    ],
    colorbar: {
      title: "p-value",
      tickvals: [0.1, 0.2, 0.3, 0.4, 0.5],
      ticktext: ["0.1", "0.2", "0.3", "0.4", "0.5"],
    },
    opacity: 0.8,
    line: {
      color: "white",
      width: 1,
    },
  },
  hovertemplate: `
    Gene count: %{x}
  `,
});

// 专业级布局配置
const layout = {
  xaxis: {
    title: "Gene Count",
    gridcolor: "#eee",
    showspikes: true,
    spikethickness: 1,
  },
  yaxis: {
    title: "Reactome Pathway",
    type: "category",
    categoryorder: "array",
    categoryarray: processedData.value.map((d) => d.y).reverse(), // 保持原顺序
    gridcolor: "#eee",
    automargin: true,
  },
  margin: {
    l: 80, // 左间距
    r: 120, // 右间距（为图例留空间）
    t: 80, // 上间距
    b: 60, // 下间距
    pad: 10, // 内边距
  },
  legend: {
    x: 1,
    xanchor: "left",
    y: 10,
  },
  modebar: {
    orientation: "v", // 垂直排列模式栏
    bgcolor: "rgba(255,255,255,0.7)",
  },
};

const addBioInteractions = () => {
  // 通路分类高亮
  bubbleChart.value.on("plotly_click", (data) => {
    const category = processedData.value[data.points[0].pointNumber].category;
    const filtered = processedData.value.filter((d) => d.category === category);

    Plotly.restyle(
      bubbleChart.value,
      {
        "marker.opacity": [
          processedData.value.map((d) => (d.category === category ? 0.9 : 0.2)),
        ],
      },
      [0]
    );
  });

  // 双击重置视图
  bubbleChart.value.on("plotly_doubleclick", () => {
    Plotly.restyle(
      bubbleChart.value,
      {
        "marker.opacity": [0.8],
      },
      [0]
    );
  });
};

onMounted(() => {});
watch(
  () => props.data,
  () => {
    processedData.value = props.data.pathways.map((d) => ({
      x: d.geneCount,
      y: d.name,
      size: -Math.log10(d.pvalue),
      pvalue: d.pvalue,
      category: d.category,
    }));
    Plotly.newPlot(bubbleChart.value, [generateTrace()], layout, {
      displayModeBar: true,
      modeBarButtonsToAdd: [
        {
          name: "导出SVG",
          icon: Plotly.Icons.camera,
          click: () => {
            Plotly.downloadImage(bubbleChart.value, {
              format: "svg",
              width: 1600,
              height: 1200,
            });
          },
        },
      ],
      scrollZoom: true,
    }).then(addBioInteractions);
  },
  { deep: true }
);
</script>

<style>
.bio-bubble-container {
  height: 500px;
}
</style>