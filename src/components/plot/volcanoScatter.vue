<template>
  <div class="volcano-container">
    <!-- 过滤控制表单 -->
    <div class="filter-controls">
      <div class="filter-group">
        <label>Log2(FC) ≥</label>
        <input v-model.number="filter.minFC" type="number" step="0.1" />
      </div>
      <div class="filter-group">
        <label>Log2(FC) ≤</label>
        <input v-model.number="filter.maxFC" type="number" step="0.1" />
      </div>
      <div class="filter-group">
        <label>-Log10(P) ≥</label>
        <input v-model.number="filter.minP" type="number" step="0.1" />
      </div>
      <div class="filter-group">
        <label>-Log10(P) ≤</label>
        <input v-model.number="filter.maxP" type="number" step="0.1" />
      </div>
      <div class="filter-group">
        <label>Highlight Color</label>
        <input v-model="highlightColor" type="color" />
      </div>
    </div>

    <!-- 火山图容器 -->
    <div ref="volcanoPlot" class="volcano-plot"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import Plotly from "plotly.js-dist";
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
const volcanoPlot = ref(null);
const highlightColor = ref("#FF0000");
const filter = ref({
  minFC: props.data.minX,
  maxFC: props.data.maxX,
  minP: props.data.minY,
  maxP: props.data.maxY,
});

// 示例数据结构（替换为您的实际数据）
const dataset = ref(props.data);

// 原始颜色缓存
const originalColors = new Map();

// 初始化图表
onMounted(() => {
  const traces = Object.entries(dataset.value.data).map(([group, points]) => {
    // 缓存原始颜色
    originalColors.set(
      group,
      points.map(() => dataset.value.colors[group])
    );

    return {
      x: points.map((p) => p[0]),
      y: points.map((p) => p[1]),
      text: points.map((p) => p[2]),
      name: group,
      mode: "markers",
      type: "scattergl",
      marker: {
        color: originalColors.get(group),
        size: 8,
        line: { width: 1, color: "rgba(0,0,0,0.3)" },
      },
    };
  });
  console.log(traces);

  Plotly.newPlot(volcanoPlot.value, traces, {
    xaxis: {
      title: "Log2(FC)",
      range: [dataset.value.minX, dataset.value.maxX],
    },
    yaxis: {
      title: "-Log10(PValue)",
      range: [dataset.value.minY, dataset.value.maxY],
    },
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
  });
});

// 更新高亮状态（带防抖）
let updateTimeout;
const updateHighlight = () => {
  const traces = Object.entries(dataset.value.data)
    .map(([group, points]) => {
      // 1. 确保原始数据存在
      if (!points || points.length === 0) return null;

      // 2. 生成高亮蒙版
      const highlightMask = points.map((p) => {
        const fc = p[0]; // Log2(FC)
        const pval = p[1]; // -Log10(PValue)
        return (
          (filter.value.minFC === null || fc >= filter.value.minFC) &&
          (filter.value.maxFC === null || fc <= filter.value.maxFC) &&
          (filter.value.minP === null || pval >= filter.value.minP) &&
          (filter.value.maxP === null || pval <= filter.value.maxP)
        );
      });

      // 3. 保留原始颜色结构
      const baseColor = dataset.value.colors[group] || "#CCCCCC";

      return {
        x: points.map((p) => p[0]), // 必须保留原始数据
        y: points.map((p) => p[1]),
        text: points.map((p) => p[2]),
        name: group,
        type: "scattergl",
        mode: "markers",
        marker: {
          color: points.map((_, i) =>
            highlightMask[i] ? highlightColor.value : baseColor
          ),
          size: points.map((_, i) => (highlightMask[i] ? 12 : 8)),
          line: {
            color: points.map((_, i) =>
              highlightMask[i] ? "#333" : "rgba(0,0,0,0.3)"
            ),
            width: points.map((_, i) => (highlightMask[i] ? 2 : 1)),
          },
        },
      };
    })
    .filter(Boolean); // 过滤空数据组

  // 4. 保留布局配置
  const layout = {
    xaxis: {
      title: "Log2(FC)",
      range: [dataset.value.minX, dataset.value.maxX],
    },
    yaxis: {
      title: "-Log10(PValue)",
      range: [dataset.value.minY, dataset.value.maxY],
    },
    margin: {
      l: 80, // 左间距
      r: 200, // 右间距（为图例留空间）
      t: 80, // 上间距
      b: 60, // 下间距
      pad: 10, // 内边距
    },
    legend: {
      x: 1.05, // 横向位置（1=右边界）
      y: 15, // 纵向位置（1=顶部）
      xanchor: "left", // 锚点对齐方式
      yanchor: "top",
      bgcolor: "rgba(255,255,255,0.9)",
      bordercolor: "#ddd",
    },
    modebar: {
      orientation: "v", // 垂直排列模式栏
      bgcolor: "rgba(255,255,255,0.7)",
    },
    showlegend: true,
  };
  console.log(traces);
  // 5. 使用Plotly.react正确更新
  Plotly.react(volcanoPlot.value, traces, layout);
};

// 监听过滤条件变化
watch(
  [filter, highlightColor],
  () => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateHighlight, 300);
  },
  { deep: true }
);
</script>

<style>
.volcano-container {
  padding: 20px;
  /* background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #495057;
  min-width: 80px;
}

.filter-group input[type="number"] {
  width: 100px;
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.filter-group input[type="color"] {
  width: 40px;
  height: 36px;
  padding: 3px;
  cursor: pointer;
}

.volcano-plot {
  height: 600px;
  width: 100%;
}
</style>