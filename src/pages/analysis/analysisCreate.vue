<template>
  <v-toolbar color="primary">
    <v-toolbar-title
      >Create Workflow
      <div class="workflowname">
        <v-text-field
          placeholder="Workflow Name"
          density="compact"
          :width="300"
          v-model="workflowname"
        ></v-text-field>
      </div>
      <v-btn variant="text" @click="submit">
        <v-icon>mdi-upload</v-icon>
        submit
      </v-btn></v-toolbar-title
    >
  </v-toolbar>

  <div>
    <v-row class="container">
      <!-- 侧边工具栏 -->
      <div class="nav-col">
        <v-list density="compact" nav v-model:opened="open" class="nav-list">
          <template v-for="category in navItems" :key="category.name">
            <!-- 第一层：分类标题 -->
            <v-list-group :value="category.name">
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :title="category.name"
                ></v-list-item>
              </template>

              <!-- 第二层：工具组 -->
              <v-list-group
                v-for="toolGroup in category.children"
                :key="toolGroup.name"
                :value="toolGroup.name"
              >
                <template v-slot:activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    :title="toolGroup.name"
                  ></v-list-item>
                </template>

                <!-- 第三层：具体工具项 -->
                <v-list-item
                  v-for="tool in toolGroup.children"
                  :key="tool.name"
                  :title="tool.name"
                  :draggable="true"
                  @dragstart="onDragStart($event, 'default', tool)"
                  class="tool-item"
                ></v-list-item>
              </v-list-group>
            </v-list-group>
          </template>
        </v-list>
      </div>
      <!-- 拖拽工作流 -->
      <v-col class="flow-col">
        <VueFlow
          :nodes="nodes"
          :edges="edges"
          @dragover="onDragOver"
          :apply-default="false"
          :connectionMode="'loose'"
          :default-node-config="{ draggable: true }"
          class="custom-node-flow"
          @drop="addNode"
        >
          <!-- <Background pattern-color="#aaa" :gap="16" /> -->
          <template #node-custom-node="props">
            <ColorSelectorNode
              :id="props.id"
              :deleteMethod="deleteNode"
              :data="props.data"
            />
          </template>
          <DropzoneBackground
            :style="{
              backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
              transition: 'background-color 0.2s ease',
            }"
          >
            <p v-if="isDragOver">Drop here</p>
          </DropzoneBackground>
        </VueFlow>
      </v-col>
      <div class="form">
        <CustomForm
          v-if="nodeData.name"
          :formData="formData"
          :fileData="fileData"
          :formName="formName"
          :msg="msg"
        ></CustomForm>
      </div>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useConfirmDialog } from "@/stores/confirmDialog.js";
import { useAnalysisStore } from "@/stores/analysis";

import {
  VueFlow,
  useVueFlow,
  Handle,
  Position,
  MarkerType,
} from "@vue-flow/core";
import { analysisApi } from "@/api";

import CustomForm from "@/components/customForm/index.vue";
import ColorSelectorNode from "@/components/flow//Node.vue";
import DropzoneBackground from "@/components/flow/DropzoneBackground.vue";
import useDragAndDrop from "@/utils/useDnD.js";
import cloneDeep from "lodash/cloneDeep";
import "@/components/flow/css/style.css";
import "@/components/flow/css/theme-default.css";
import "@/components/flow/css/controls.css";
import "@/components/flow/css/minimap.css";
import "@/components/flow/css/resizer.css";

// import { useDialog } from "vuetify-dialog";
// const dialog = useDialog();
const confirmDialog = useConfirmDialog();
const analysisStore = useAnalysisStore();

// flow
const {
  onConnect,
  addEdges,
  onNodeClick,
  onEdgeClick,
  screenToFlowCoordinate,
  onNodesChange,
  onEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} = useVueFlow();
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

// 导航数据（单层结构）
const navItems = ref();
const open = ref([]);
// 节点数据
const nodes = ref([]);
const edges = ref([]);
const dragNodeData = ref([]);
const nodeData = ref({});
const selectData = ref({});

const formData = ref();
const formName = ref();
const msg = ref([]);
const analysisData = ref(analysisStore.analysis);

const workflowname = ref("workflow");

// 拖拽函数
const onDragStart = (event, type, tool) => {
  if (isDragOver) {
    console.log(tool);
    dragNodeData.value = cloneDeep(tool);
  }
};
// 连线
onConnect((event) => {
  edges.value.push({
    id: event.source + "-" + event.target,
    source: event.source,
    target: event.target,
    markerEnd: MarkerType.ArrowClosed,
  });
});
// node id
const nodeId = ref(0);
if (nodes.value[0]) {
  nodeId.value = nodes.value[nodes.value.length - 1].id;
}
// get id
const getId = () => {
  let num = parseInt(nodeId.value);
  num++;
  return "0000" + num;
};
// 添加node
const addNode = (event, node) => {
  const position = screenToFlowCoordinate({
    x: event.clientX,
    y: event.clientY,
  });
  const id = getId();
  const newNode = {
    id: id,
    position,
    data: dragNodeData.value,
    type: "custom-node",
  };
  nodes.value.push(newNode);
  console.log("添加节点", nodes.value);
  nodeId.value = nodes.value[nodes.value.length - 1].id;
};
// node 数据变化
onNodesChange(async (changes) => {
  const nextChanges = [];
  for (const change of changes) {
    if (change.type === "remove") {
      return;
    } else if (change.type === "position" && change.dragging == true) {
      nodes.value.forEach((element) => {
        if (element.id == change.id) {
          element.position = change.position;
        }
      });
      nextChanges.push(change);
    } else {
      nextChanges.push(change);
    }
  }
  applyNodeChanges(nextChanges);
});
// edge 数据变化
onEdgesChange(async (changes) => {
  const nextChanges = [];
  for (const change of changes) {
    if (change.type === "remove") {
      return;
    } else {
      nextChanges.push(change);
    }
  }
  applyEdgeChanges(nextChanges);
  console.log("edge changes", edges.value);
});
// node 点击
onNodeClick((event) => {
  // if (event.node.data.functionName == "Filter") {
  //   edges.value.forEach((element) => {
  //     if (element.target == event.node.id) {
  //       nodes.value.forEach((res) => {
  //         if (element.source == res.id) {
  //           console.log(res)
  //           if (res.data.columns) {
  //             event.node.data.columns = res.data.columns;
  //           }
  //         }
  //       });
  //     }
  //   });
  // }
  // infoShow.value = false;
  nodeData.value = event.node.data;
  // compentName.value = componentsList[nodeData.value.functionName];
  selectData.value = {
    type: "node",
    id: event.node.id,
  };
  msg.value = nodeData.value.msg;
  formData.value = nodeData.value.subplots;
  formName.value = {
    name: nodeData.value.name,
  };
  console.log(nodeData.value);
});
// delete method
const deleteMethod = async () => {
  if (selectData.value.id) {
    if (selectData.value.type == "node") {
      ElMessageBox.confirm("Do you want to delete this node?", "confirm", {
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
        type: "warning",
      })
        .then(() => {
          nodes.value = nodes.value.filter((res) => {
            return res.id != selectData.value.id;
          });
          edges.value = edges.value.filter((res) => {
            return !res.id.includes(selectData.value.id);
          });
          selectData.value = {};
          nodeData.value = {
            allName: "",
          };
        })
        .catch(() => {});
    } else {
      ElMessageBox.confirm("Do you want to delete this line?", "confirm", {
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
        type: "warning",
      })
        .then(() => {
          edges.value = edges.value.filter((res) => {
            return res.id != selectData.value.id;
          });
          selectData.value = {};
          ElMessage({
            message: "success",
            type: "success",
          });
        })
        .catch(() => {});
    }
  }
};
// delete node
const deleteNode = async (data) => {
  const confirmed = await confirmDialog.openConfirmDialog({
    text: `Are you sure you want to delete ${data.name}?`,
  });
  if (confirmed) {
    nodes.value = nodes.value.filter((res) => {
      return res.id != selectData.value.id;
    });
    edges.value = edges.value.filter((res) => {
      return !res.id.includes(selectData.value.id);
    });
    selectData.value = {};
    nodeData.value = {
      allName: "",
    };
  }
};
const getWorkflowTools = async () => {
  const response = await analysisApi.getWorkflowTools(
    analysisStore.project.projectId
  );
  navItems.value = response;
  open.value = navItems.value.map((item) => item.name);
};
const submit = async () => {
  try {
    const response = analysisApi.createAnalysis(
      analysisStore.project.projectId,
      {
        name: workflowname.value,
        node: nodes.value,
        edge: edges.value,
      }
    );
    router.push({
      path: "/analysis",
    });
  } catch {}
};
const getAnalysisDetail = async () => {
  const response = await analysisApi.getAnalysisInfo(analysisData.value.id);
  console.log(response);
  if (response) {
    nodes.value = response.node;
    edges.value = response.edge;
    workflowname.value = response.name;
  }
};
onMounted(() => {
  console.log(analysisData.value);
  setTimeout(() => {
    if (analysisData.value.id) {
      getAnalysisDetail();
    }
  }, 300);
  // 初始化导航状态
  getWorkflowTools();
});
</script>
<style lang="less" scoped>
.container {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
  padding: 8px;
  flex-wrap: nowrap;
  gap: 12px;
  > div {
    height: 770px;
  }
}
:deep(.v-toolbar__content) {
  height: 80px !important;
}
:deep(.v-toolbar-title__placeholder) {
  height: 80px;
  line-height: 80px;
  align-items: center;
  display: flex;
  .workflowname {
    width: 300px !important;
    margin-right: 50px;
  }
  .v-input {
    height: 40px;
    width: 300px !important;
    margin-left: 20px;
  }
  .v-input__control {
    width: 300px !important;
  }
}

.form {
  width: 300px;
  padding: 16px;
  background: #fff;
  margin-top: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 700px !important;
  overflow: auto;
}
.nav-col {
  padding: 16px;
  width: 250px;
  .nav-list {
    width: 250px;
    height: 770px;
    overflow-y: auto;
  }
}
.tool-item {
  cursor: grab;
  user-select: none;
  &:hover {
    background-color: #e0e0e0;
  }
}
.flow-col {
  height: 100%;
  .vue-flow {
    height: 100%;
    width: 100%;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .dropzone-background {
    position: relative;
    height: 100%;
    width: 100%;
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      pointer-events: none;
    }
  }
}
.vue-flow-wrapper {
  flex-grow: 1;
  height: 100%;
}
</style>