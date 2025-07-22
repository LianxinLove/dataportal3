<template>
  <v-container>
    <v-card>
      <v-btn variant="text" @click="$router.push('/project')">
        <v-icon style="color: #222">mdi-arrow-expand-left</v-icon>
        Back
      </v-btn>
    </v-card>
    <!-- project 信息 -->
    <v-main class="mt-3">
      <h3>
        Project Information
        <v-btn
          variant="outlined"
          size="small"
          class="ml-3"
          @click="(edit = false), (variant = 'outlined')"
        >
          Edit
        </v-btn>
      </h3>
    </v-main>
    <v-main class="mt-3">
      <h3 class="mb-3">Information</h3>
      <v-text-field
        :disabled="edit"
        class="custom-disabled"
        density="compact"
        label="Project Name"
        :variant="variant"
        v-model="project.projectName"
      ></v-text-field>
      <v-text-field
        :disabled="edit"
        density="compact"
        label="DOI"
        :variant="variant"
        v-model="project.DOI"
      ></v-text-field>
      <v-textarea
        :disabled="edit"
        density="compact"
        label="Project Description"
        :variant="variant"
        rows="1"
        v-model="project.projectDescription"
      ></v-textarea>
    </v-main>
    <v-main class="mt-6 tag">
      <h3>
        Project data collection and display
        <template v-if="!edit">
          <v-btn
            variant="outlined"
            size="small"
            class="ml-3"
            @click="tableDialog = true"
          >
            Add
          </v-btn>
          <v-btn class="upload-btn" color="primary" depressed>
            <v-icon left>mdi-cloud-upload</v-icon>
            <v-file-input
              label="Upload"
              variant="outlined"
              @change="onTemplateFileChange"
              v-model="expfile"
              hide-details
              class="file-input"
            ></v-file-input>
          </v-btn>
          <v-btn class="getTemplate" color="primary" @click="getExpTemplate">
            Get Template
          </v-btn>
          <!-- <v-btn
            size="x-small"
            icon="mdi-file-document-plus-outline"
            rounded="sm"
            variant="outlined"
            class="ml-3"
            @click="dialog = true"
          >
          </v-btn> -->
        </template>
        <!-- <template v-if="edit">
          <v-btn
            variant="outlined"
            size="small"
            class="ml-3"
            @click="tableDialog = true"
          >
            Add
          </v-btn>
          <v-btn
            size="x-small"
            icon="mdi-file-document-plus-outline"
            rounded="sm"
            variant="outlined"
            class="ml-3"
            @click="dialog = true"
          >
          </v-btn>
        </template> -->
      </h3>
      <template v-if="!edit">
        <v-expansion-panels v-model="panel" multiple class="mt-3">
          <v-expansion-panel title="Exps" value="exps">
            <v-expansion-panel-text>
              <v-chip
                v-for="(item, index) in expsList"
                class="ma-2"
                color="cyan"
                :closable="true"
                label
                :key="index"
                @click:close="tagClose(item)"
              >
                {{ item }}
              </v-chip>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel title="Exps Table" value="table">
            <v-expansion-panel-text>
              <TableComponents
                ref="EXPTableRef"
                class="table"
                :items="expdata"
                :headers="tableColumns"
                :showSelect="true"
                :selectList="selectedItemsEXP"
                @sort-changed="handleSortChangeEXP"
                @select-changed="handleSelectionEXP"
                @filter-changed="filterChangeEXP"
                :loading="false"
              >
              </TableComponents>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <v-card class="mt-3 mb-3" v-if="edit">
        <v-chip
          v-for="(item, index) in expsList"
          class="ma-2"
          color="cyan"
          :closable="!edit"
          label
          :key="index"
        >
          {{ item }}
        </v-chip>
      </v-card>
    </v-main>
    <!-- firmiana 数据表格 -->
    <v-main class="mt-6">
      <h3>Meta Data</h3>
      <div class="template mt-3" v-if="!edit">
        <div class="tag">
          <v-chip
            v-for="(item, index) in project.metadata"
            class="ma-2"
            color="cyan"
            label
            :closable="true"
            :key="index"
            @click="getTagInfo(item)"
          >
            {{ item.name }}
          </v-chip>
        </div>
        <v-btn color="primary" @click="getMetaDataFile"> Get Template </v-btn>
        <v-file-input
          label="Upload File"
          variant="outlined"
          density="compact"
          show-size
          prepend-icon="mdi-upload"
          @change="onFileChange"
          v-model="file"
          multiple
        ></v-file-input>
      </div>
      <div v-else>
        <v-chip
          v-for="(item, index) in project.metadata"
          class="ma-2"
          color="cyan"
          label
          :key="index"
          @click="getTagInfo(item)"
        >
          {{ item.name }}
        </v-chip>
      </div>
    </v-main>
    <v-main class="mt-6">
      <h3>Other Data</h3>

      <div v-if="!edit">
        <div class="tag">
          <v-chip
            v-for="(item, index) in project.otherFiles"
            class="ma-2"
            color="cyan"
            label
            :closable="true"
            :key="index"
            @click="getTagInfo(item)"
          >
            <span>{{ item.type }} : {{ item.name }}</span>
          </v-chip>
        </div>
        <div
          v-for="(item, index) in otherFiles"
          :key="index"
          class="d-flex align-center mt-3 template"
        >
          <!-- 文件类型选择 -->
          <v-select
            label="Type"
            :items="['genome', 'transcriptome', 'metabolome', 'other']"
            variant="outlined"
            v-model="item.type"
            density="compact"
            class="mr-2"
            :max-width="200"
          ></v-select>

          <!-- 文件上传 -->
          <v-file-input
            label="Upload File"
            variant="outlined"
            density="compact"
            show-size
            prepend-icon="mdi-upload"
            v-model="item.file"
            @change="onOtherFileChange(item)"
            class="mr-2"
          ></v-file-input>

          <!-- 加号按钮 (仅最后一行显示) -->
          <v-btn
            v-if="index === otherFiles.length - 1"
            icon="mdi-plus"
            variant="tonal"
            color="primary"
            @click="addRow"
            class="mr-2 btn"
          ></v-btn>

          <!-- 减号按钮 (首行不显示) -->
          <v-btn
            v-if="index > 0"
            icon="mdi-minus"
            variant="tonal"
            color="error"
            class="btn"
            @click="removeRow(index)"
          ></v-btn>
        </div>
      </div>

      <div v-else>
        <v-chip
          v-for="(item, index) in project.otherFiles"
          class="ma-2"
          color="cyan"
          label
          :key="index"
          @click="getTagInfo(item)"
        >
          <span>{{ item.type }} : {{ item.name }}</span>
        </v-chip>
      </div>
    </v-main>
    <v-main class="mt-6">
      <h3>Workflow</h3>
      <div class="search mt-3">
        <v-text-field
          clearable
          density="compact"
          v-model="searchInput"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          @input="searchMethod"
          style="flex: 1"
        ></v-text-field>
        <v-btn v-if="desserts.length" color="primary" @click="navigateTo"
          >Create</v-btn
        >
      </div>
      <v-data-table
        v-if="desserts.length"
        :headers="headers"
        :items="desserts"
        :items-per-page="-1"
        :loading="loading"
        fixed-header
        hide-default-footer
        class="tabel"
      >
        <template v-slot:[`item.projectId`]="{ item }">
          <span>{{ item.projectId.toString().padStart(6, "0") }}</span>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <span v-if="item.status === 'success'">
            <v-icon
              color="green-darken-2"
              icon="mdi-check-circle-outline"
              size="large"
            ></v-icon>
          </span>
          <span v-else-if="item.status === 'failed'">
            <v-icon
              color="red-darken-2"
              icon="mdi-alert-circle-outline"
              size="large"
            ></v-icon>
          </span>
          <span v-else>
            <v-icon
              color="orange-darken-2"
              icon="mdi-clock-time-eight-outline"
              size="large"
            ></v-icon>
          </span>
        </template>
        <template v-slot:[`item.operation`]="{ item }">
          <div class="buttonGroup">
            <v-tooltip text="Analysis Result" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-information-outline"
                  variant="text"
                  color="primary"
                  size="small"
                  v-bind="props"
                  @click="changePage(item, 'analysisDetail')"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Workflow Modify" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  color="primary"
                  size="small"
                  v-bind="props"
                  @click="changePage(item, 'analysisModify')"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Download Result" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-download"
                  variant="text"
                  color="primary"
                  size="small"
                  v-bind="props"
                  @click="downloadAnalysis(item)"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Delete Workflow" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  v-bind="props"
                  @click="deleteAnalysis(item)"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
      <v-alert
        v-if="desserts.length === 0 && !loading"
        type="warning"
        class="mt-4"
        dismissible
        :style="{ textAlign: 'center' }"
      >
        <p>No workflow found. Please create a new workflow.</p>
        <v-btn class="mt-4" color="primary" @click="navigateTo">Create</v-btn>
      </v-alert>
    </v-main>
    <v-main v-if="!edit">
      <div class="submitButton">
        <v-btn
          color="white"
          @click="(edit = true), getExp(), getProject()"
          class="mt-4 mr-4"
        >
          Cancel
        </v-btn>
        <v-btn color="primary" @click="submitProject" class="mt-4">
          Submit Project
        </v-btn>
      </div>
    </v-main>

    <!-- 弹出框 -->
    <v-dialog v-model="dialog" width="auto">
      <v-card :title="fileName">
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

          <v-btn
            color="primary"
            text="Confirm"
            variant="tonal"
            @click="dialog = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="tableDialog" width="1200">
      <v-card title="Data">
        <TableComponents
          ref="FirmianaTableRef"
          class="table"
          :items="data"
          :headers="tableColumns"
          :showSelect="true"
          :selectList="selectedItems"
          @sort-changed="handleSortChange"
          @select-changed="handleSelection"
          @filter-changed="filterChange"
          :loading="firmianaLoading"
        >
        </TableComponents>
        <v-pagination
          v-model="page"
          :length="Math.ceil(count / 10)"
          :total-visible="7"
          :disabled="firmianaLoading"
          @update:model-value="getExp"
        ></v-pagination>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="Close"
            variant="plain"
            @click="tableDialog = false"
          ></v-btn>

          <v-btn
            color="primary"
            text="Confirm"
            variant="tonal"
            @click="tableDialog = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { projectApi, analysisApi } from "@/api";

import { useProjectStore } from "@/stores/project";
import TableComponents from "@/components/table/index.vue";

import { useOverlayStore } from "@/stores/overlay";
import { useSnackbarStore } from "@/stores/snackbar.js";
import { useRouter } from "vue-router";
import { saveAs } from "file-saver";
const snackbar = useSnackbarStore();
const overlayStore = useOverlayStore();

const router = useRouter();
const projectStore = useProjectStore();
const projectId = ref(projectStore.project.projectId);
const project = ref({});
const filter = ref([]);
const sort = ref([]);
const data = ref([]);
const expdata = ref([]);
const page = ref(1);
const count = ref(0);
const selectedItems = ref([]);
const selectedList = ref([]);
const selectedItemsEXP = ref([]);
const file = ref([]);
const expfile = ref([]);
const otherFiles = ref([{ type: "other", file: null, value: "" }]);
const expsList = ref([]);
const sourceExpsList = ref([]);
const dialog = ref(false);
const tableDialog = ref(false);
const firmianaLoading = ref(false);
const edit = ref(true);
const variant = ref("underlined");
const panel = ref(["exps"]);
const temp_locale = ref();
const fileName = ref("");

const FirmianaTableRef = ref(null);

// table表头
const headers = [
  {
    align: "start",
    key: "id",
    title: "ID",
    width: "100px",
  },
  { key: "name", title: "Name" },
  { key: "createDate", title: "Create Date" },
  { key: "startDate", title: "Start Date" },
  { key: "endDate", title: "End Date" },
  { key: "status", title: "Status" },
  { key: "operation", title: "OPERATION", width: "300px" },
];
// 渲染数据
const desserts = ref([]);
// 原始数据
const sourceData = ref([]);
// loading状态
const loading = ref(true);
// 搜索输入
const searchInput = ref("");

const tableColumns = ref([
  {
    value: "expname",
    title: "Name",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "description",
    title: "Description",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "bait",
    title: "Bait",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "numGene",
    title: "Num Gene",
    type: "number",
    filterData: [{ gt: "", lt: "", eq: "" }],
  },
  {
    value: "numFraction",
    title: "Num Fraction",
    type: "number",
    filterData: [{ gt: "", lt: "", eq: "" }],
  },
  {
    value: "numSpectrum",
    title: "Num Spectrum",
    type: "number",
    filterData: [{ gt: "", lt: "", eq: "" }],
  },
  {
    value: "numPeptide",
    title: "Num Peptide",
    type: "number",
    filterData: [{ gt: "", lt: "", eq: "" }],
  },
  {
    value: "numIsoform",
    title: "Num Isoform",
    type: "number",
    filterData: [{ gt: "", lt: "", eq: "" }],
  },
  {
    value: "numRepeat",
    title: "Num Repeat",
    type: "number",
    filterData: [{ gt: "", lt: "", eq: "" }],
  },
  {
    value: "operator",
    title: "Operator",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "instrument",
    title: "Instrument",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "cellType",
    title: "Cell Type",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "experimentDate",
    title: "Experiment Date",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "fluid",
    title: "Fluid",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "lab",
    title: "Lab",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "organ",
    title: "Organ",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "species",
    title: "Species",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "stage",
    title: "Stage",
    type: "number",
    filterData: [{ gt: "", lt: "", eq: "" }],
  },
  {
    value: "tissue",
    title: "Tissue",
    type: "string",
    filterData: [{ data: "" }],
  },
  {
    value: "type",
    title: "Type",
    type: "string",
    filterData: [{ data: "" }],
  },
]);

const navigateTo = () => {
  router.push({
    path: "/analysis/analysisCreate",
  });
};

// 获取analysis列表
const getAnalysisList = async () => {
  try {
    const response = await analysisApi.getAnalysisList(
      projectStore.project.projectId
    );
    sourceData.value = response;
    desserts.value = response;
  } catch (error) {
    console.error("Error fetching project list:", error);
  } finally {
    loading.value = false;
  }
};
// 本体搜索方法
const searchMethod = () => {
  if (searchInput.value !== "") {
    desserts.value = sourceData.value.filter((item) => {
      return (
        item.name.toUpperCase().indexOf(searchInput.value.toUpperCase()) !== -1
      );
    });
  } else {
    desserts.value = sourceData.value;
  }
};
// 获取project 信息
const getProject = async () => {
  try {
    const response = await projectApi.getProjectInfo({
      projectId: projectId.value,
    });
    expsList.value = [];
    selectedItemsEXP.value = [];
    project.value = response.projectInfo;
    expdata.value = response.projectInfo.exps;
    response.projectInfo.exps.forEach((element) => {
      expsList.value.push(element.expname);
      sourceExpsList.value.push(element.expname);
      selectedItemsEXP.value.push(element);
    });
    console.log(selectedItemsEXP.value);
    // expsList.value = [...new Set([...expsList.value, ...selectedItems.value])];
  } catch (error) {
    console.error("Error fetching project data:", error);
  }
};
// 添加新行
const addRow = () => {
  otherFiles.value.push({ type: "other", file: null, value: "" });
};

// 删除当前行
const removeRow = (index) => {
  otherFiles.value.splice(index, 1);
};
// 获取标签信息
const getTagInfo = (item) => {
  fileName.value = item.name;
  dialog.value = true;
  console.log("Tag Info:", item);
};
// 获取exp列表
const getExp = async () => {
  firmianaLoading.value = true;
  data.value = [];
  count.value = 0;
  try {
    const response = await projectApi.getExp({
      from: "iproteome",
      blockSize: 10,
      blockNum: page.value,
      access_token: JSON.parse(localStorage.getItem("user")).firmianaToken
        .access_token,
      token_type: "Bearer",
      filter_list: JSON.stringify(filter.value),
      sort_list: JSON.stringify(sort.value),
    });
    data.value = response.exps || [];
    count.value = response.count || 0;
    data.value.forEach((res) => {
      expsList.value.forEach((element) => {
        if (element == res.expname) {
          selectedItems.value.push(res);
        }
      });
    });
    firmianaLoading.value = false;
  } catch (error) {
    console.error("Error fetching experiment data:", error);
    firmianaLoading.value = false;
  }
};
// 处理排序变化事件
const handleSortChange = (newSort) => {
  sort.value[0] = newSort;
  getExp(); // 重新获取数据
  // 这里可以触发远程排序，或者使用本地排序函数
};
// 处理选择变化
const handleSelection = (selection) => {
  expsList.value = [];
  expdata.value = [];
  selectedItemsEXP.value = [];
  selectedItems.value = [];
  selectedList.value = [];
  selection.forEach((element) => {
    selectedItems.value.push(element);
    selectedList.value.push(element.expname);
    selectedItemsEXP.value.push(element);
    expdata.value.push(element);
  });
  expsList.value = [
    ...new Set([...sourceExpsList.value, ...selectedList.value]),
  ];
  console.log(expsList.value);
};
// 处理排序变化事件
const handleSortChangeEXP = (newSort) => {};
// 处理选择变化
const handleSelectionEXP = (selection) => {
  // expdata.value = expdata.value.filter((res) => {
  //   return selection.some((sel) => sel.expname === res.expname);
  // });
  expsList.value = selection.map((item) => item.expname);
  selectedItemsEXP.value = selection;
};
const onFileChange = async () => {
  // FirmianaTableRef.value.componentSelectList = [];
  overlayStore.openOverlay(true);
  temp_locale.value = [];
  try {
    const uploadPromises = file.value.map((res) => {
      const formData = new FormData();
      formData.append("file", res);
      basicApi.uploadTemplateFile(res);
    });
    const responses = await Promise.all(uploadPromises);
    temp_locale.value = responses.map((r) => r);
    overlayStore.openOverlay(false);
  } catch {
    overlayStore.openOverlay(false);
  }
};
const onOtherFileChange = async (item) => {
  try {
    overlayStore.openOverlay(true);
    const formData = new FormData();
    formData.append("file", item.file);
    const response = await basicApi.uploadTemplateFile(formData);
    item.value = response;
    overlayStore.openOverlay(false);
  } catch {
    overlayStore.openOverlay(false);
  }
};
const onTemplateFileChange = async () => {
  overlayStore.openOverlay(true);
  try {
    selectedItemsEXP.value = [];
    selectedItems.value = [];
    expsList.value = [];
    const formData = new FormData();
    formData.append("file", expfile.value);
    formData.append(
      "token_type",
      JSON.parse(localStorage.getItem("user")).firmianaToken.token_type
    );
    formData.append(
      "access_token",
      JSON.parse(localStorage.getItem("user")).firmianaToken.access_token
    );
    const response = await projectApi.uploadExp(formData);
    response.forEach((res) => {
      selectedItemsEXP.value.push(res);
      selectedItems.value.push(res);
      expsList.value.push(res.expname);
    });
    expdata.value = response;
    overlayStore.openOverlay(false);
  } catch {
    overlayStore.openOverlay(false);
  }
};
// getMetaDataFile
const getMetaDataFile = async () => {
  try {
    const response = await projectApi.getMetaDataFile(expdata.value);
    const blob = new Blob([response], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "metadata.xlsx");
  } catch {}
};
// 筛选
const filterChange = (filterData) => {
  if (filterData.type == "number") {
    filter.value[0] = {
      key: filterData.value,
      value: filterData.filterData[0],
      type: filterData.type,
    };
  } else {
    filter.value[0] = {
      key: filterData.value,
      value: filterData.filterData[0].data,
      type: filterData.type,
    };
  }
  page.value = 1;
  getExp(); // 重新获取数据
};
// 筛选
const filterChangeEXP = (filterData) => {};
// 关闭tag
const tagClose = (res) => {
  expdata.value = expdata.value.filter((r) => {
    return r.expname != res;
  });
  selectedItemsEXP.value = selectedItemsEXP.value.filter((r) => {
    return r.expname != res;
  });
};
const getExpTemplate = () => {
  window.open(
    "https://phenomics.fudan.edu.cn/firmiana/DP/static/excel/Exps.xlsx"
  );
};
// 提交信息
const submitProject = async () => {
  overlayStore.openOverlay(true);
  let arr = [];
  otherFiles.value.forEach((item) => {
    if (item.file) {
      arr.push({
        type: item.type,
        value: item.value,
      });
    }
  });
  const data = {
    projectInfo: {
      iproteomeToken: JSON.parse(localStorage.getItem("user")).firmianaToken,
      DOI: project.value.DOI,
      projectDescription: project.value.projectDescription,
      projectName: project.value.projectName,
      exps: expsList.value,
      metadata: temp_locale.value,
      otherFiles: arr,
    },
  };
  const response = await projectApi.updateProject(projectId.value, data);
  snackbar.openSnackbar({
    text: "Success",
    color: "success",
  });
  overlayStore.openOverlay(false);
  router.push({
    path: "/project",
  });
  try {
    // expsList.value = [...new Set([...expsList.value, ...selectedItems.value])];
  } catch (error) {
    console.error("Error fetching project data:", error);
  }
};
getExp();
getProject();
getAnalysisList();
</script>

<style lang="less" scoped>
.v-main {
  padding: 12px;
  background-color: #fff !important;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  .custom-disabled :deep(.v-input__control input) {
    opacity: 1 !important;
  }
  :deep(.v-field--disabled) {
    opacity: 1 !important;
  }
  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  .tag {
    width: 100%;
    h3 {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      margin-bottom: 10px;
      button {
        border-radius: 4px !important;
        height: 24px !important;
      }
      .upload-btn {
        position: relative; /* 确保按钮作为相对定位容器 */
        left: 15px;
      }
      .getTemplate {
        margin-left: 30px;
      }
      .file-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0; /* 隐藏原生输入框 */
        cursor: pointer;
        :deep(.v-input__prepend) {
          display: none;
        }
        :deep(.v-input__control) {
          height: 24px !important;
        }
      }
    }
  }
  .template {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    button {
      height: 40px !important;
    }
    .btn {
      width: 40px !important;
    }
    .v-input {
      height: 40px !important;
    }
  }
  p {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .table {
    margin-top: 20px;
    border-radius: 4px;
  }
  .submitButton {
    display: flex;
    justify-content: center;
  }
}
.dialogContent {
  padding: 0 18px;
}
</style>