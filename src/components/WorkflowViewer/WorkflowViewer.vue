<template>
  <div class="workflow-container">
    <svg ref="svg" class="workflow-svg"></svg>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import * as d3 from "d3";
import dagre from "dagre";
const emit = defineEmits(["nodeClick"]);
const props = defineProps({
  workflowData: {
    type: Object,
    required: true,
    default: () => ({
      lineList: [
        { source: "00001", target: "00002", markerEnd: "arrowclosed" },
        { source: "00002", target: "00003", markerEnd: "arrowclosed" },
      ],
      nodeList: [
        {
          id: "00001",
          data: { label: "GQM", functionName: "GQM" },
          state: "success",
        },
        {
          id: "00002",
          data: { label: "DEG", functionName: "DEG" },
          state: "success",
        },
        {
          id: "00003",
          data: { label: "Volcano Plot", functionName: "volcanoPlot" },
          state: "success",
        },
      ],
    }),
  },
});

const svg = ref(null);
const container = ref(null);

// 创建虚拟文本元素用于尺寸测量
const createTextMeasure = () => {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  el.style.whiteSpace = "nowrap";
  el.style.fontFamily = "Roboto, sans-serif";
  el.style.fontSize = "24px";
  el.style.fontWeight = "bold";
  document.body.appendChild(el);
  return (text) => {
    el.textContent = text;
    return el.offsetWidth;
  };
};

// 新增：节点点击处理函数
const handleNodeClick = (node) => {
  emit("nodeClick", node); // 触发自定义事件
};

// 修复后的渲染函数（按连接关系布局）
const renderWorkflow = () => {
  if (!svg.value || !props.workflowData) return;

  // 清空现有元素
  d3.select(svg.value).selectAll("*").remove();

  const svgEl = d3.select(svg.value);
  const measureText = createTextMeasure();

  // 1. 创建布局图
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "LR",
    ranksep: 200,
    nodesep: 50,
    marginx: 50,
    marginy: 50,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // 2. 添加节点（根据文本内容动态计算尺寸）
  props.workflowData.nodeList.forEach((node) => {
    const labelWidth = measureText(node.data.label);
    const fullName = getFullName(node.data.functionName);
    const fullWidth = measureText(fullName);
    // 节点状态颜色

    // 取最大值+边距
    const width = Math.max(260, labelWidth, fullWidth) + 60;
    const height = 90;

    g.setNode(node.id, {
      id: node.id,
      label: node.data.label,
      fullName: node.data.functionName,
      width: width,
      height: height,
      status: node.state,
      plotType: node.data.plotType,
    });
  });

  // 3. 添加连线（按lineList指定关系）
  props.workflowData.lineList.forEach((edge) => {
    g.setEdge(edge.source, edge.target, {
      id: edge.source + "-" + edge.target,
      arrowhead: edge.markerEnd || "arrowclosed",
    });
  });

  // 4. 执行布局计算
  dagre.layout(g);

  // 5. 设置容器尺寸
  const graph = g.graph();
  const svgWidth = graph.width + 200;
  const svgHeight = graph.height + 100;

  svgEl
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // 6. 添加定位组
  const mainGroup = svgEl.append("g").attr("transform", `translate(100, 50)`);

  // 7. 渲染连线（根据连接关系）
  mainGroup
    .append("g")
    .attr("class", "edges")
    .selectAll("path")
    .data(g.edges())
    .enter()
    .each(function (edge) {
      const edgeData = g.edge(edge);
      const points = edgeData.points;
      // 平滑曲线路径
      const line = d3
        .line()
        .curve(d3.curveBasis)
        .x((d) => d.x)
        .y((d) => d.y);

      d3.select(this)
        .append("path")
        .attr("d", line(points))
        .attr("class", "edge-path")
        .attr("marker-end", `url(#${edgeData.arrowhead})`)
        .attr("fill", "none")
        .attr("stroke", "#3d5a80")
        .attr("stroke-width", 3);
    });

  // 8. 定义箭头标记
  const defs = svgEl.append("defs");
  ["arrowclosed"].forEach((markerId) => {
    defs
      .append("marker")
      .attr("id", markerId)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 9)
      .attr("refY", 5)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,0 L10,5 L0,10 Z")
      .attr("fill", "#3d5a80");
  });

  // 9. 渲染节点（匹配图片样式）
  // 修改：为节点组添加类名和点击事件
  mainGroup
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(
      g.nodes().map((id) => {
        const node = g.node(id); // 获取节点完整对象
        return { ...node, id }; // 保留原始数据并添加ID
      })
    )
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.x},${d.y})`) // 确保事件区域正确
    .on("click", (event, d) => {
      // 添加点击事件处理
      handleNodeClick(event);
    })
    .each(function (node) {
      const nodeGroup = d3.select(this);
      const statusColors = {
        success: "#4CAF50",
        failed: "#F44336",
        upstream_failed: "#F44336",
        processing: "#FFC107",
      };
      const nodeColor = statusColors[node.status] || "#4CAF50";
      // 节点背景（调整了坐标计算方式）
      nodeGroup
        .append("rect")
        .attr("x", -node.width / 2) // 使用相对坐标
        .attr("y", -node.height / 2)
        .attr("width", node.width)
        .attr("height", node.height)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", nodeColor) // 图片中的绿色
        .attr("stroke", "#388E3C") // 深绿色边框
        .attr("stroke-width", 2);

      // 第一行文本（调整了坐标计算方式）
      nodeGroup
        .append("text")
        .attr("x", 0) // 使用相对坐标
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text(node.label);

      // 第二行文本（调整了坐标计算方式）
      nodeGroup
        .append("text")
        .attr("x", 0) // 使用相对坐标
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "white")
        .text(node.fullName);
    });
};

// 根据功能名获取完整描述（匹配图片文本）
const getFullName = (functionName) => {
  const mappings = {
    GQM: "Generate Quantitive Matrix",
    DEG: "Differential Expressed Genes",
    volcanoPlot: "Volcano Plot",
  };
  return mappings[functionName] || functionName;
};

// 初始化渲染和响应数据变化
onMounted(() => {
  renderWorkflow();
  // 添加窗口大小变化监听
  window.addEventListener("resize", renderWorkflow);
});

watch(
  () => props.workflowData,
  () => {
    nextTick(renderWorkflow);
  },
  { deep: true }
);
</script>

<style scoped>
/* 更新节点样式 */
.workflow-container {
  width: 100%;
  height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.workflow-svg {
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 4px;
}

/* 新增指针区域设置 */
.workflow-container :deep(.node) {
  cursor: pointer;
  pointer-events: all;
  transition: all 0.3s ease;
}

/* 悬停效果增强 */
/* .workflow-container :deep(.node:hover) {
  filter: drop-shadow(0 5px 15px rgba(76, 175, 80, 0.5));
  transform: translateY(-3px);
} */

.edge-path {
  transition: stroke 0.3s ease;
}

.edge-path:hover {
  stroke: #ff7043;
  stroke-width: 4px;
}
</style>