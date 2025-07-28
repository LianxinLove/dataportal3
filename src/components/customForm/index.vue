<template>
  <v-container>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-expansion-panels v-if="msg">
        <v-expansion-panel>
          <v-expansion-panel-title
            collapse-icon="mdi-information"
            expand-icon="mdi-information"
          >
            <v-text-field
              variant="outlined"
              density="compact"
              label="Name"
              v-model="formName.name"
            ></v-text-field>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p v-for="(item, i) in msg" :key="i" :class="item.type" class="msg">
              <span class="title">{{ item.title }}</span
              >{{ item.msg }}
            </p>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-text-field
        v-else
        variant="outlined"
        density="compact"
        label="Name"
        v-model="formName.name"
      ></v-text-field>

      <!-- <h3>File</h3> -->
      <!-- <template v-for="(data, index) in fileData" :key="index">
        <div class="template mt-3 mb-8">
          <p>
            {{ data.file.split(".")[0] }}
            <span v-if="!data.optional" class="dangerText">*</span>
          </p>
          <v-btn
            color="primary"
            density="compact"
            @click="downloadTemplate(data)"
          >
            Get Template
          </v-btn>
          <v-btn
            color="primary"
            density="compact"
            @click="openSelectFileDialog(data)"
          >
            Select File
          </v-btn>
          <p v-if="data.params">
            {{ data.params.file.name }}
            <v-btn
              v-if="data.params.file.name"
              icon="mdi-delete"
              variant="text"
              color="error"
              @click="deleteFile(data)"
            ></v-btn>
          </p>
        </div>
      </template> -->
      <template v-for="(data, index) in formData" :key="index">
        <template v-if="!data.onChange">
          <template v-if="data.type == 'upload_files'">
            <div class="template mt-3 mb-8">
              <p>
                {{ data.file.split(".")[0] }}
                <span v-if="!data.optional" class="dangerText">*</span>
              </p>
              <v-btn
                color="primary"
                density="compact"
                @click="openSelectFileDialog(data)"
              >
                File
              </v-btn>
              <v-btn
                color="primary"
                density="compact"
                @click="downloadTemplate(data)"
              >
                Template
              </v-btn>

              <p v-if="data.params">
                {{ data.params.file.name }}
                <v-btn
                  v-if="data.params.file.name"
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  @click="deleteFile(data)"
                ></v-btn>
              </p>
            </div>
          </template>
          <v-text-field
            v-if="data.type === 'text'"
            variant="outlined"
            density="compact"
            label="Name"
            v-model="data.value"
          ></v-text-field>
          <v-select
            v-if="data.type === 'select'"
            density="compact"
            :label="data.name"
            item-title="label"
            item-value="value"
            :items="data.options"
            variant="outlined"
            v-model="data.value"
            class="mt-4"
          ></v-select>
          <p v-if="data.type === 'boolean'">{{ data.name }}</p>
          <v-radio-group
            inline
            v-if="data.type === 'boolean'"
            v-model="data.value"
          >
            <v-radio label="true" :value="true"></v-radio>
            <v-radio label="false" :value="false"></v-radio>
          </v-radio-group>

          <v-number-input
            v-if="data.type === 'number'"
            variant="outlined"
            density="compact"
            :reverse="false"
            controlVariant="default"
            :label="data.name"
            :hideInput="false"
            :inset="false"
            v-model="data.value"
          ></v-number-input>
          <v-number-input
            v-if="data.type === 'float'"
            variant="outlined"
            density="compact"
            :reverse="false"
            controlVariant="default"
            :label="data.name"
            :hideInput="false"
            :inset="false"
            precision="2"
            v-model="data.value"
          ></v-number-input>
          <template v-if="data.type === 'color'">
            <div class="mb-3">
              <v-text-field
                variant="outlined"
                density="compact"
                :label="data.name"
                v-model="data.value"
                type="color"
              ></v-text-field>
            </div>
          </template>
        </template>
        <template v-else>
          <v-select
            v-if="data.type === 'select'"
            density="compact"
            :label="data.name"
            item-title="label"
            item-value="value"
            :items="data.options"
            variant="outlined"
            v-model="data.value"
            class="mt-4"
          ></v-select>
          <template v-for="(item, i) in data.value" :key="i">
            <template v-for="(form, j) in data.children" :key="j">
              <div v-if="form.name == item" class="template mt-3 mb-8">
                <p>
                  {{ form.file.split(".")[0] }}
                  <!-- <span v-if="!data.optional" class="dangerText">*</span> -->
                </p>
                <v-btn
                  color="primary"
                  density="compact"
                  @click="openSelectFileDialog(form)"
                >
                  File
                </v-btn>
                <v-btn
                  color="primary"
                  density="compact"
                  @click="downloadTemplate(form)"
                >
                  Template
                </v-btn>

                <p v-if="form.params">
                  {{ form.params.file.name }}
                  <v-btn
                    v-if="form.params.file.name"
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    @click="deleteFile(form)"
                  ></v-btn>
                </p>
              </div>
            </template>
          </template>
        </template>
      </template>
      <!-- <v-btn color="primary" @click="submitMethod"> Submit </v-btn> -->
    </v-form>
  </v-container>
  <v-dialog v-model="tableDialog" width="1200" height="670">
    <v-card :title="title">
      <p class="mb-3">
        <v-btn
          variant="text"
          @click="status = 'folder'"
          v-if="status === 'file'"
        >
          <v-icon style="color: #222">mdi-arrow-expand-left</v-icon>
          Back
        </v-btn>
        <v-file-input
          ref="fileInput"
          style="display: none"
          :model-value="selectedFile"
          @update:model-value="onFileChange"
        />
        <!-- 自定义按钮 -->
        <v-btn
          v-if="status == 'file'"
          variant="outlined"
          icon="mdi-upload"
          class="ml-2 uploadBtn"
          color="primary"
          @click="triggerFileSelect"
        ></v-btn>
        <v-btn
          v-if="status == 'folder'"
          variant="outlined"
          icon="mdi-upload"
          class="ml-6 uploadBtn"
          color="primary"
          @click="uploadFolderDialog = true"
        ></v-btn>
      </p>
      <v-divider></v-divider>
      <v-data-table
        height="500"
        v-model="selected"
        :headers="tableColumns"
        :items="data"
        item-key="id"
        :items-per-page="-1"
        hide-default-footer
        :show-select="status === 'file'"
        @update:model-value="logSelection"
        class="folderTable"
      >
        <template v-slot:[`item.data-table-select`]="{ item }">
          <v-radio-group v-model="selected" :value="[item]">
            <v-radio :value="[item]" color="primary" />
          </v-radio-group>
        </template>
        <template v-slot:[`item.name`]="{ item }">
          <span>
            <v-btn variant="text" class="link" @click="fileClick(item)">
              {{ item.name }}
            </v-btn>
          </span>
        </template>
        <template v-slot:[`item.size`]="{ item }">
          <span>
            {{ unitConversion(item.size) }}
          </span>
        </template>
      </v-data-table>

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
          @click="selectFile"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="uploadFolderDialog" width="600" height="300">
    <v-card title="Create Folder" class="pa-4">
      <v-form @submit.prevent>
        <v-text-field
          variant="outlined"
          v-model="folderName"
          :rules="
            (value) => {
              if (value) return true;
              return 'You must enter a folder name.';
            }
          "
          label="Folder Name"
        ></v-text-field>
        <v-btn
          class="mt-2"
          type="submit"
          color="primary"
          block
          @click="createFolder"
          >Submit</v-btn
        >
      </v-form>
    </v-card>
  </v-dialog>
  <v-dialog
    v-model="uploading"
    :close-on-back="false"
    :persistent="true"
    width="400"
  >
    <v-card title="Uploading" class="pa-4 uploading-card">
      <v-progress-circular
        :model-value="progress"
        color="primary"
        class="mb-3"
        :rotate="360"
        :size="100"
        :width="10"
      >
        <template v-slot:default> {{ progress }} % </template>
      </v-progress-circular>
      <p>Uploading file: {{ selectedFile.name }}</p>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { dataApi } from "@/api";
import { useSnackbarStore } from "@/stores/snackbar.js";
import { unitConversion } from "@/utils/utils.js";
const snackbar = useSnackbarStore();
const props = defineProps({
  formData: {},
  fileData: {},
  formName: {
    type: String,
    default: "customForm",
  },
  msg: {
    type: Boolean,
    default: false,
  },
});

const filter = ref([]);
const sort = ref([]);
const tableDialog = ref(false);
const status = ref("folder");
const selected = ref([]);
const fileTemplate = ref();
const title = ref("Folder");
const uploadFolderDialog = ref(false);
const folderName = ref("");
const uploading = ref(false);
const progress = ref(0);
const folderData = ref();

const tableColumns = ref([
  { title: "Name", value: "name", type: "string", filterData: [{ data: "" }] },
  {
    title: "Update Time",
    value: "update_time",
    type: "string",
    filterData: [{ data: "" }],
  },
  { title: "Size", value: "size", type: "string", filterData: [{ data: "" }] },
]);
const data = ref([]);

const emit = defineEmits(["submit"]);

const valid = ref(false);

// 触发父组件提交
const submitMethod = () => {
  if (checkFile()) {
    emit("submit", {
      formName: props.formName,
      formData: props.formData,
      fileData: props.fileData,
    });
  }
};
// 打开选择文件对话框并保存临时状态
const openSelectFileDialog = (data) => {
  tableDialog.value = true;
  status.value = "folder";
  fileTemplate.value = data;
  console.log(fileTemplate.value);
};

const logSelection = (selectedItems) => {
  if (selectedItems.length > 0) {
    console.log("Selected:", selectedItems[0]);
  }
};
// 选择文件方法
const selectFile = () => {
  console.log(selected.value);
  if (selected.value.length === 0) {
    snackbar.openSnackbar({
      text: "Please select a file.",
      color: "warning",
    });
    return;
  }
  fileTemplate.value.params.file = selected.value[0];
  console.log(fileTemplate.value);
  tableDialog.value = false;
  props.formData.forEach((item) => {
    if (item.file == fileTemplate.value.file) {
      item = fileTemplate.value;
    }
  });
};
// downloadTemplate
const downloadTemplate = (data) => {
  console.log(data);
  window.open(
    "https://phenomics.fudan.edu.cn/firmiana/DP/static/excel/" + data.file
  );
  //
};
const deleteFile = (data) => {
  delete data.params;
};
// 点击文件夹方法
const fileClick = (item) => {
  filter.value = [];
  sort.value = [];
  folderData.value = item; // 保存当前文件夹数据
  if (status.value == "folder") {
    status.value = "file";
    title.value = item.name; // 更新标题为当前文件夹名称
    getFileListMethod(item.id);
    if (!fileTemplate.value.params) {
      fileTemplate.value.params = {
        folder: item.id,
        file: {},
      };
    } else {
      fileTemplate.value.params.folder = item.id;
    }
  }
  // Handle file click logic here
};

// 文件上传相关
const fileInput = ref(null);
const selectedFile = ref(null);

const onFileChange = (event) => {
  if (event) {
    selectedFile.value = event;
    uploading.value = true; // 显示上传对话框
    console.log(selectedFile.value);
    loop();
    // uploadFile(); // 自动上传或手动触发
  }
};
const loop = () => {
  progress.value = 0;
  const promise = new Promise((resolve, reject) => {
    ShardUpload(0, selectedFile.value);
  });
  return promise;
};
const ShardUpload = (index, file) => {
  console.log(file);
  const Size = 1024 * 1000;
  const start = index * Size;
  if (start > file.size) {
    dataApi.combineFile(folderData.value.id, file.name).then((res) => {
      getFileListMethod(folderData.value.id).then(() => {
        progress.value = 100; // 重置进度
        uploading.value = false;
        snackbar.openSnackbar({
          text: "File upload successfully",
          color: "success",
        });
      });
    });
    return;
  }
  const blob = file.slice(start, start + Size);
  const blobName = `${file.name}.tmp.${index}`;
  const blobFile = new File([blob], blobName);
  const formData = new FormData();
  formData.append("file", blobFile);
  dataApi.uploadFile(folderData.value.id, formData).then((res) => {
    ShardUpload(++index, file);
    progress.value = Math.floor(100 / (file.size / start));
  });
};
const triggerFileSelect = () => {
  fileInput.value.$el.querySelector('input[type="file"]').click();
};

// 创建文件夹
const createFolder = async () => {
  try {
    await dataApi.createFolder({ name: folderName.value });
    uploadFolderDialog.value = false;
    folderName.value = "";
    snackbar.openSnackbar({
      text: "success",
      color: "success",
    });
    getFolderMethod(); // 刷新文件夹列表
  } catch (error) {
    console.error("Error creating folder:", error);
  }
};
// 获取文件列表
const getFileListMethod = async (id) => {
  try {
    const response = await dataApi.getFileList(id, {
      filter_list: JSON.stringify(filter.value),
      sort_list: JSON.stringify(sort.value),
    });
    data.value = response;
  } catch (error) {
    console.error("Error fetching file list:", error);
  }
};

// 获取文件夹列表
const getFolderMethod = async () => {
  try {
    const response = await dataApi.getFolderList({
      filter_list: JSON.stringify(filter.value),
      sort_list: JSON.stringify(sort.value),
    });
    data.value = response;
  } catch (error) {
    console.error("Error fetching folder list:", error);
  }
};

const selectChange = (e) => {
  console.log(e);
};

onMounted(() => {
  //   getFolderMethod();
});

watch(
  () => status.value,
  (newVal) => {
    if (newVal == "folder") {
      getFolderMethod();
    }
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
.dangerText {
  color: red;
}
.v-expansion-panel-title {
  display: flex;
  gap: 10px;
  .v-input {
    height: 40px;
  }
}
.msg {
  line-height: 30px;
  .title {
    font-weight: bold;
  }
}
.info {
}
.blue {
  color: #1867c0;
}
.template {
  display: flex;
  align-items: top;
  gap: 10px;
  flex-wrap: wrap;
  p {
    width: 100%;
  }
  button {
    height: 40px !important;
  }
}
.folderTable {
  .v-input {
    display: flex;
    align-items: center;
  }
  .link {
    color: #1976d2;
    text-decoration: none;
  }
}
.uploadBtn {
  border-radius: 8px;
  width: 50px;
  height: 35px;
  :deep(.v-icon--size-default) {
    font-size: 18px !important;
  }
}
.uploading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>