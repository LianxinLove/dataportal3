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
      <h3>Project Information</h3>
    </v-main>
    <v-main class="mt-3">
      <h3 class="mb-3">Information</h3>
      <v-text-field
        class="custom-disabled"
        density="compact"
        label="Project Name"
        :variant="variant"
        v-model="project.projectName"
      ></v-text-field>
      <v-text-field
        density="compact"
        label="DOI"
        :variant="variant"
        v-model="project.DOI"
      ></v-text-field>
      <v-textarea
        density="compact"
        label="Project Description"
        :variant="variant"
        v-model="project.projectDescription"
      ></v-textarea>
    </v-main>
    <v-main class="mt-6 tag">
      <h3>
        Project data collection and display
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
            v-model="file"
            hide-details
            class="file-input"
          ></v-file-input>
        </v-btn>
        <v-btn class="getTemplate" color="primary" @click="getMetaDataFile">
          Get Template
        </v-btn>
      </h3>
      <v-expansion-panels v-model="panel" multiple>
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
    </v-main>
    <!-- firmiana 数据表格 -->
    <v-main class="mt-6">
      <h3>Meta Data</h3>
      <div class="template mt-3">
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
    </v-main>
    <v-main>
      <div class="submitButton">
        <v-btn color="primary" @click="submitProject" class="mt-4">
          Submit
        </v-btn>
      </div>
    </v-main>

    <!-- 弹出框 -->
    <v-dialog v-model="dialog" width="auto">
      <v-card title="Tips">
        <v-card-text>
          Try to copy exp000001, exp000002 into the input box , Then hit
          enter.(Please use English comma!)
        </v-card-text>
        <div class="dialogContent">
          <v-text-field variant="outlined" density="compact"></v-text-field>
          <div title="SUCCESS:">
            <p>SUCCESS:</p>
            <v-chip
              v-for="(item, index) in expsList"
              class="ma-2"
              color="cyan"
              closable
              label
              :key="index"
            >
              {{ item }}
            </v-chip>
          </div>
          <div title="ERROR:">
            <p>ERROR:</p>
            <v-chip
              v-for="(item, index) in expsList"
              class="ma-2"
              color="red"
              label
              :key="index"
            >
              {{ item }}
            </v-chip>
          </div>
        </div>
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
import { projectApi, basicApi } from "@/api";

import { useProjectStore } from "@/stores/project";
import TableComponents from "@/components/table/index.vue";

import { useOverlayStore } from "@/stores/overlay";
import { useSnackbarStore } from "@/stores/snackbar.js";

import { useRouter } from "vue-router";

// file-saver
import { saveAs } from "file-saver";
const snackbar = useSnackbarStore();
const overlayStore = useOverlayStore();

const router = useRouter();

const projectStore = useProjectStore();
const project = ref({});
const filter = ref([]);
const sort = ref([]);
const data = ref([]);
const expdata = ref([]);
const page = ref(1);
const count = ref(0);
const sampleNum = ref(0);
const selectedItems = ref([]);
const selectedList = ref([]);
const selectedItemsEXP = ref([]);
const file = ref([]);
const expsList = ref([]);
const sourceExpsList = ref([]);
const dialog = ref(false);
const tableDialog = ref(false);
const firmianaLoading = ref(false);
const variant = ref("underlined");
const panel = ref(["exps"]);
const temp_locale = ref();

const FirmianaTableRef = ref(null);

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
    // expdata.value = response.exps;
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
// 清除选择
const onFileChange = async () => {
  // FirmianaTableRef.value.componentSelectList = [];
  overlayStore.openOverlay(true);
  temp_locale.value = [];
  try {
    const uploadPromises = file.value.map((res) => {
      const formData = new FormData();
      formData.append("file", res);
      return basicApi.uploadTemplateFile(formData);
    });
    const responses = await Promise.all(uploadPromises);
    temp_locale.value = responses.map((r) => r.temp_locale);
    console.log(temp_locale.value);
    file.value = [];
    overlayStore.openOverlay(false);
  } catch {}
};
const onTemplateFileChange = async () => {
  overlayStore.openOverlay(true);
  try {
    selectedItemsEXP.value = [];
    selectedItems.value = [];
    expsList.value = [];
    const formData = new FormData();
    formData.append("file", file.value);
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
// 关闭tag
const tagClose = (res) => {
  expdata.value = expdata.value.filter((r) => {
    return r.expname != res;
  });
  selectedItemsEXP.value = selectedItemsEXP.value.filter((r) => {
    return r.expname != res;
  });
};
// 提交信息
const submitProject = async () => {
  const data = {
    projectInfo: {
      iproteomeToken: JSON.parse(localStorage.getItem("user")).firmianaToken,
      DOI: project.value.DOI,
      projectDescription: project.value.projectDescription,
      projectName: project.value.projectName,
      exps: expsList.value,
      metadata: temp_locale.value,
    },
  };
  const response = await projectApi.createProject(data);
  snackbar.openSnackbar({
    text: "Success",
    color: "success",
  });
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
  .tag {
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
    align-items: top;
    gap: 10px;
    button {
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