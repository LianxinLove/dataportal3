<template>
  <v-container>
    <v-card :title="title">
      <p class="mb-3">
        <v-btn
          variant="text"
          @click="(status = 'folder'), (title = 'Folder')"
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
          @click="(uploadFolderDialog = true), (folderTitle = 'Create')"
        ></v-btn>
      </p>
      <v-divider></v-divider>
      <v-data-table
        height="700"
        :headers="tableColumns"
        :items="data"
        item-key="id"
        :items-per-page="-1"
        hide-default-footer
        class="folderTable"
        :loading="loading"
      >
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
        <template v-slot:[`item.handle`]="{ item }">
          <div class="buttonGroup">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              color="primary"
              size="small"
              @click="edit(item)"
            ></v-btn>
            <v-btn
              v-if="status == 'file'"
              icon="mdi-download"
              variant="text"
              color="primary"
              @click="downloadFile(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              color="error"
              @click="deleteFile(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
  <v-dialog v-model="uploadFolderDialog" width="600" height="250">
    <v-card :title="folderTitle" class="pa-4">
      <v-form @submit.prevent="createFolder" validate-on="submit lazy">
        <v-text-field
          variant="outlined"
          v-model="folderName"
          :rules="[
            (value) => {
              if (value) return true;
              return 'You must enter a first name.';
            },
          ]"
          label="Name"
        ></v-text-field>
        <v-btn class="mt-2" type="submit" color="primary" block>Submit</v-btn>
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
  <v-dialog v-model="fileContentDialog" width="1200">
    <v-card :title="fileName" class="pa-4 fileContentCard">
      <p v-if="fileContentShow">
        ​This table displays partial data for preview only. For the complete
        dataset, please download the file.​​
      </p>
      <TableComponents
        ref="tableRef"
        class="table mt-3"
        :items="fileContentData"
        :headers="fileContentColumns"
        :loading="fileContentLoading"
        v-if="fileContentShow"
      >
      </TableComponents>
      <div v-else>
        <p>Loading... Please Wait</p>
        <p>
          <v-progress-circular
            color="primary"
            indeterminate
          ></v-progress-circular>
        </p>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { dataApi } from "@/api";
import { useSnackbarStore } from "@/stores/snackbar.js";
import { unitConversion } from "@/utils/utils.js";
import TableComponents from "@/components/table/index.vue";
const snackbar = useSnackbarStore();

import { useConfirmDialog } from "@/stores/confirmDialog.js";
import { set } from "lodash";
import { reject } from "lodash";
import { get } from "lodash";

// file-saver
import { saveAs } from "file-saver";
const confirmDialog = useConfirmDialog();
const props = defineProps({
  formData: {},
  fileData: {},
  formName: {
    type: String,
    default: "customForm",
  },
});

const filter = ref([]);
const sort = ref([]);
const tableDialog = ref(false);
const status = ref("folder");
const fileTemplate = ref();
const title = ref("Folder");
const uploadFolderDialog = ref(false);
const folderName = ref("");
const folderData = ref({});
const progress = ref(0);
const fileContentDialog = ref(false);
const fileName = ref("");
const fileContentData = ref([]);
const fileContentColumns = ref([]);
const fileContentShow = ref(false);
const fileContentLoading = ref(false);
const start = ref(0);
const tableRef = ref(null);
const loading = ref(false);
const folderTitle = ref("Create");
const folderId = ref("");

const tableColumns = ref([
  { title: "Name", value: "name", type: "string", filterData: [{ data: "" }] },
  {
    title: "Update Time",
    value: "update_time",
    type: "string",
    filterData: [{ data: "" }],
  },
  { title: "Size", value: "size", type: "string", filterData: [{ data: "" }] },
  {
    title: "HANDLE",
    value: "handle",
    type: "string",
    filterData: [{ data: "" }],
  },
]);
const data = ref([]);

const uploading = ref(false);

const deleteFile = async (data) => {
  const confirmed = await confirmDialog.openConfirmDialog({
    text: `Are you sure you want to delete ${data.name}?`,
  });
  if (confirmed) {
    console.log(data);
    if (status.value == "folder") {
      await dataApi.deleteFolder(data.id);
      snackbar.openSnackbar({
        text: "Folder deleted successfully",
        color: "success",
      });
      getFolderMethod(); // 刷新文件夹列表
    } else {
      await dataApi.deleteFile({
        id: folderData.value.id,
        name: data.name,
      });
      snackbar.openSnackbar({
        text: "File deleted successfully",
        color: "success",
      });
      getFileListMethod(folderData.value.id); // 刷新文件列表
    }
  } else {
    console.log("用户取消操作");
  }
};
// 点击文件夹方法
const fileClick = (item) => {
  filter.value = [];
  sort.value = [];
  if (status.value == "folder") {
    status.value = "file";
    title.value = item.name; // 更新标题为当前文件夹名称
    folderData.value = item; // 保存当前文件夹数据
    getFileListMethod(item.id);
  } else {
    fileContentShow.value = false; // 隐藏加载状态
    fileName.value = item.name;
    fileContentDialog.value = true; // 打开文件内容对话框
    const form = {
      start: 0,
      end: 2000,
      filter_list: JSON.stringify(filter.value),
      sort_list: JSON.stringify(sort.value),
    };
    dataApi.getFileContent(folderData.value.id, item.name, form).then((res) => {
      fileContentData.value = res.result;
      getFileContent(res).then((data) => {
        fileContentShow.value = true;
      });
    });
  }
  // Handle file click logic here
};
const getFileContent = (data) => {
  return new Promise((resolve, reject) => {
    let arr = [];
    data.colnames.forEach((res) => {
      let d = {
        title: res.title,
        value: res.field,
        type: "string",
        filterData: [{ data: "" }],
      };
      arr.push(d);
    });
    fileContentColumns.value = arr;
    console.log(fileContentColumns.value);
    resolve(true);
  });
};
// 文件下载
const downloadFile = async (data) => {
  const response = await dataApi.downloadFile(folderData.value.id, data.name);
  console.log(response)
  window.open(
    import.meta.env.VITE_API_BASE_URL + "/library_download/" + response.token
  );
};

// 文件上传相关
const fileInput = ref(null);
const selectedFile = ref(null);

const onFileChange = (event) => {
  console.log(selectedFile.value);
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
const createFolder = async (event) => {
  const results = await event;

  if (results.valid) {
    if (status.value == "folder") {
      try {
        if (folderId.value != "") {
          await dataApi.editFolder(folderId.value, { name: folderName.value });
        } else {
          await dataApi.createFolder({ name: folderName.value });
        }
        uploadFolderDialog.value = false;
        snackbar.openSnackbar({
          text: "success",
          color: "success",
        });
        folderName.value = "";
        folderId.value = "";
        getFolderMethod(); // 刷新文件夹列表
      } catch (error) {
        console.error("Error creating folder:", error);
      }
    } else {
      try {
        await dataApi.editFile(folderData.value.id, fileName.value, {
          name: folderName.value,
        });
        uploadFolderDialog.value = false;
        snackbar.openSnackbar({
          text: "success",
          color: "success",
        });
        fileName.value = "";
        folderName.value = "";
        getFileListMethod(folderData.value.id); // 刷新文件夹列表
      } catch (error) {
        console.error("Error creating folder:", error);
      }
    }
  }
};
const edit = async (item) => {
  folderTitle.value = "Edit";
  if (status.value == "folder") {
    folderName.value = item.name;
    folderId.value = item.id;
  } else {
    fileName.value = item.name;
    folderName.value = item.name;
  }
  uploadFolderDialog.value = true;
};
// 获取文件列表
const getFileListMethod = async (id) => {
  loading.value = true;
  try {
    const response = await dataApi.getFileList(id, {
      filter_list: JSON.stringify(filter.value),
      sort_list: JSON.stringify(sort.value),
    });
    data.value = response;
    loading.value = false;
  } catch (error) {
    console.error("Error fetching file list:", error);
  }
};

// 获取文件夹列表
const getFolderMethod = async () => {
  loading.value = true;
  try {
    const response = await dataApi.getFolderList({
      filter_list: JSON.stringify(filter.value),
      sort_list: JSON.stringify(sort.value),
    });
    data.value = response;
    loading.value = false;
  } catch (error) {
    console.error("Error fetching folder list:", error);
  }
};
onMounted(() => {
  getFolderMethod();
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
.template {
  display: flex;
  align-items: top;
  gap: 10px;
  flex-wrap: wrap;
  p {
    width: 100%;
  }
  button {
    height: 30px !important;
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
  border-radius: 4px;
  width: 40px !important;
  height: 30px !important;
  :deep(.v-icon--size-default) {
    font-size: 16px !important;
  }
}
.uploading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.fileContentCard {
  min-height: 400px;
  p {
    text-align: center;
  }
}
</style>