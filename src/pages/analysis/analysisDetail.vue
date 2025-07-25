<template>
  <v-container>
    <v-card>
      <v-btn variant="text" @click="$router.push('/analysis')">
        <v-icon style="color: #222">mdi-arrow-expand-left</v-icon>
        Back
      </v-btn>
    </v-card>
    <v-main class="mt-3">
      <h3>{{ analysisData.name }}</h3>
      <v-divider></v-divider>
      <WorkflowViewer
        v-if="workflowData.nodeList"
        :workflow-data="workflowData"
        @nodeClick="selectNode"
      />
    </v-main>
    <v-main class="mt-3">
      <h3 class="selectNodeName" v-if="selectNodeData.label">
        Result Chart --- {{ selectNodeData.label }}
        <!-- <v-btn
          prepend-icon="mdi-download"
          density="default"
          color="primary"
          variant="text"
          @click="save"
          class="saveBtn"
        >
          save as result
        </v-btn> -->
      </h3>
      <h3 class="selectNodeName" v-else>
        No nodes selected. Select a specific node.
      </h3>
    </v-main>
    <v-main class="mt-3 detailContent">
      <TableComponents
        v-if="type == 'table'"
        ref="TableRef"
        class="table"
        :items="data"
        :headers="tableColumns"
        @sort-changed="handleSortChange"
        @filter-changed="filterChange"
        :loading="tableLoading"
      >
      </TableComponents>
      <template v-if="type == 'plotly'">
        <!-- <component
          :is="currentComponent"
          v-memo="[currentComponent]"
          :data="plotData"
        /> -->
        <scatter :data="plotData" />
      </template>
      <template v-if="type == 'FAGL'">
        <div class="FAGLHeader">
          <div>
            <v-select
              label="Select"
              :items="fileName"
              variant="outlined"
              density="compact"
              :width="'300px'"
              v-model="FAGLFileName"
              @update:model-value="FAGLFileNameChange"
            ></v-select>
          </div>
          <div class="btnGroup">
            <v-switch
              v-model="switchMe"
              color="primary"
              @update:model-value="FAGLTypeChange"
            >
              <template v-slot:label>
                {{ FAGLType }}
              </template>
            </v-switch>
            <v-btn
              prepend-icon="mdi-download"
              density="default"
              color="primary"
              @click="downloadResult"
            >
              Download
            </v-btn>
          </div>
        </div>
        <BubblePlot :data="plotData"></BubblePlot>
      </template>
    </v-main>
  </v-container>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { analysisApi, projectApi } from "@/api";

import { useAnalysisStore } from "@/stores/analysis";
import { useOverlayStore } from "@/stores/overlay";
import WorkflowViewer from "@/components/WorkflowViewer/WorkflowViewer.vue";
import TableComponents from "@/components/table/index.vue";
import BubblePlot from "@/components/plot/bubble.vue";
import scatter from "@/components/plot/scatter.vue";
// plot components
// file-saver
import { saveAs } from "file-saver";
import { color } from "d3";
const router = useRouter();

const analysisStore = useAnalysisStore();
const overlayStore = useOverlayStore();
const analysisData = analysisStore.analysis;

const workflowData = ref({});
const selectNodeData = ref({});
const TableRef = ref(null);
const contentShow = ref(false);
const tableLoading = ref(false);
const fileName = ref("");
const data = ref([]);
const tableColumns = ref([]);
const type = ref("");
const currentComponent = shallowRef(null);
const plotData = ref();
const plotType = ref();
const switchMe = ref(true);
const FAGLType = ref("Plot");
const FAGLFileName = ref("");

// // 定义 plotType 与组件的映射关系
// const componentMap = {
//   line: defineAsyncComponent(() => import("../../components/plot/line.vue")),
//   scatter: defineAsyncComponent(() =>
//     import("../../components/plot/scatter.vue")
//   ),
//   PQDScatter: defineAsyncComponent(() =>
//     import("../../components/plot/PQDScatter.vue")
//   ),
//   //   venn: defineAsyncComponent(() => import("../../components/plot/venn.vue")),
//   heatMap: defineAsyncComponent(() =>
//     import("../../components/plot/heatMap.vue")
//   ),
//   volcanoScatter: defineAsyncComponent(() =>
//     import("../../components/plot/volcanoScatter.vue")
//   ),
//   bubble: defineAsyncComponent(() =>
//     import("../../components/plot/bubble.vue")
//   ),
// };
const getAnalysisDetail = async () => {
  try {
    const response = await analysisApi.getAnalysisDetail(
      analysisStore.analysis.id,
      {
        projectId: analysisStore.analysis.project.id,
      }
    );
    workflowData.value = response;
  } catch {}
};

const selectNode = async (node) => {
  console.log(node);
  if (node.status != "success") {
    return;
  }
  type.value = "";
  tableColumns.value = [];
  data.value = [];
  overlayStore.openOverlay(true);
  tableLoading.value = true;
  contentShow.value = true;
  selectNodeData.value = node;
  if (selectNodeData.value.plotType == "table") {
    const form = {
      projectId: analysisStore.analysis.project.id,
      workflowId: analysisStore.analysis.id,
      nodeName: node.fullName,
      file: false,
      start: 0,
      end: 0,
      all: false,
    };
    try {
      const response = await analysisApi.getAnalysisTableName(node.id, form);
      fileName.value = response;
      overlayStore.openOverlay(false);
      // getTabeData().then(() => {
      //   overlayStore.openOverlay(false);
      // });
      tableColumns.value = response.result.colnames.map((col) => ({
        value: col.value,
        title: col.title,
        type: "string",
        filterData: [{ data: "" }],
      }));
      data.value = response.result.result;
      type.value = "table";
      tableLoading.value = false;
      console.log(response);
    } catch {}
  } else if (selectNodeData.value.plotType == "FAGL") {
    type.value = "FAGL";
    const fileNameForm = {
      projectId: analysisStore.analysis.project.id,
      workflowId: analysisStore.analysis.id,
      nodeName: node.fullName,
      file: false,
      start: 0,
      end: 0,
      all: false,
    };
    const res = await analysisApi.getAnalysisTableName(node.id, fileNameForm);
    fileName.value = res;
    FAGLFileName.value = fileName.value[0];
    // currentComponent.value = [selectNodeData.value.plotType];
    getFAGLPlotData(FAGLFileName.value);
    overlayStore.openOverlay(false);
  } else {
    type.value = "plot";
    // currentComponent.value = [selectNodeData.value.plotType];
    const form = {
      projectId: analysisStore.analysis.project.id,
      workflowId: analysisStore.analysis.id,
      nodeName: node.fullName,
      file: false,
      png: false,
      0: "img",
    };
    const response = await analysisApi.getAnalisisPlotData(node.id, form);
    plotData.value = response.result;
    type.value = "plotly";
    overlayStore.openOverlay(false);
  }
};

const FAGLFileNameChange = () => {
  getFAGLPlotData(FAGLFileName.value);
};

const getFAGLPlotData = async (filename) => {
  try {
    const form = {
      projectId: analysisStore.analysis.project.id,
      workflowId: analysisStore.analysis.id,
      nodeName: selectNodeData.value.fullName,
      file: false,
      png: false,
      0: "img",
      filename: filename,
    };
    const response = await analysisApi.getAnalisisPlotData(
      selectNodeData.value.id,
      form
    );
    plotData.value = response;
    plotType.value = selectNodeData.value.plotType;
  } catch {}
};

const getTabeData = async () => {
  const form = {
    projectId: analysisStore.analysis.project.id,
    workflowId: analysisStore.analysis.id,
    nodeName: selectNodeData.value.fullName,
    file: false,
    start: 0,
    end: 10000,
    filename: fileName.value,
    all: false,
    filter_list: [],
    sort_list: [],
  };
  try {
    const response = await analysisApi.getAnalysisTableData(
      selectNodeData.value.id,
      form
    );
    response.colnames.forEach((element) => {
      tableColumns.value.push({
        value: element.value,
        title: element.title,
        type: "string",
        filterData: [{ data: "" }],
      });
    });
    data.value = response.result;
    type.value = "table";
    tableLoading.value = false;
  } catch {}
};

const filterChange = () => {};
const handleSortChange = (newSort) => {
  const { key, value: direction } = newSort;

  return data.value.sort((a, b) => {
    // 处理空值（undefined/null 置后）
    if (a[key] == null) return 1;
    if (b[key] == null) return -1;

    // 数字类型排序
    if (typeof a[key] === "number" && typeof b[key] === "number") {
      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    }

    // 字符串类型排序
    const compareResult = String(a[key]).localeCompare(String(b[key]));
    return direction === "asc" ? compareResult : -compareResult;
  });
};
onMounted(() => {
  getAnalysisDetail();
});
watch();
// plotType,
// (newType) => {
//   currentComponent.value = componentMap[newType];
// },
// { immediate: true }
</script>

<style lang="less" scoped>
.v-main {
  padding: 12px;
  background-color: #fff !important;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.selectNodeName {
  text-align: center;
  position: relative;
  .saveBtn {
    position: absolute;
    right: 30px;
    top: -3px;
  }
}
.FAGLHeader {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  height: 60px;
  .v-switch {
    height: 60px;
    margin-right: 30px;
  }
  .btnGroup {
    height: 60px;
    display: flex;
    align-items: center;
  }
}
.detailContent {
}
/* Add your custom styles here if needed */
</style>