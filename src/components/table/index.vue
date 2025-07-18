<template>
  <div class="smart-table-container">
    <v-data-table-virtual
      ref="TableRef"
      v-model="componentSelectList"
      :headers="headersList"
      :items="items"
      :item-key="itemKey"
      :height="height"
      :sort-by="[]"
      :must-sort="false"
      disable-sort
      :show-select="showSelect"
      :single-select="true"
      return-object
      :loading="loading"
      :hide-default-header="loading"
      loading-text="Loading... Please wait"
      class="elevation-2 smart-table"
      @update:modelValue="onSelectedChange"
    >
      <template
        v-for="(item, index) in headersList"
        v-slot:[`header.${item.value}`]
        :key="index"
      >
        <span class="header-cell">
          <span
            class="sortable-header text-capitalize"
            @click="toggleSort(item.value)"
          >
            <span>{{ item.title }}</span>
            <v-icon v-if="sortBy.key !== item.value" small class="sort-icon"
              >mdi-unfold-more-horizontal</v-icon
            >
            <v-icon v-else-if="sortBy.value === 'asc'" small class="sort-icon">
              mdi-arrow-up
            </v-icon>
            <v-icon v-else small class="sort-icon"> mdi-arrow-down </v-icon>
          </span>
          <span>
            <v-btn variant="plain" icon size="small">
              <v-icon style="color: #222">mdi-chevron-down</v-icon>
              <v-menu activator="parent" :close-on-content-click="false">
                <v-list>
                  <!-- 列控制 -->
                  <v-list-item link>
                    <v-list-item-title>Columns</v-list-item-title>
                    <template v-slot:append>
                      <v-icon icon="mdi-menu-right" size="x-small"></v-icon>
                    </template>
                    <v-menu
                      activator="parent"
                      submenu
                      :close-on-content-click="false"
                    >
                      <v-list>
                        <v-list-item v-for="j in headers" :key="j" link>
                          <v-checkbox
                            :disabled="j.disabled"
                            v-model="colChecked"
                            :label="j.title"
                            :value="j.value"
                            @change="headersChange(j.key)"
                          ></v-checkbox>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item>
                  <!-- 筛选 -->
                  <v-list-item link>
                    <v-list-item-title>Filter</v-list-item-title>
                    <template v-slot:append>
                      <v-icon icon="mdi-menu-right" size="x-small"></v-icon>
                    </template>
                    <v-menu
                      activator="parent"
                      submenu
                      :close-on-content-click="false"
                    >
                      <v-list>
                        <template v-if="item.type == 'string'">
                          <v-list-item link class="input">
                            <v-text-field
                              width="200"
                              variant="outlined"
                              hide-details
                              single-line
                              density="compact"
                              v-model="item.filterData[0].data"
                              @change="filterChange(item)"
                            ></v-text-field>
                          </v-list-item>
                        </template>
                        <template v-if="item.type == 'number'">
                          <v-list-item link class="input">
                            <v-text-field
                              prepend-icon="mdi-chevron-right"
                              width="200"
                              variant="outlined"
                              hide-details
                              single-line
                              density="compact"
                              v-model="item.filterData[0].gt"
                              @change="filterChange(item)"
                            ></v-text-field>
                          </v-list-item>
                          <v-list-item link class="input">
                            <v-text-field
                              prepend-icon="mdi-chevron-left"
                              width="200"
                              variant="outlined"
                              hide-details
                              single-line
                              density="compact"
                              v-model="item.filterData[0].lt"
                              @change="filterChange(item)"
                            ></v-text-field>
                          </v-list-item>
                          <v-list-item link class="input">
                            <v-text-field
                              prepend-icon="mdi-equal"
                              width="200"
                              variant="outlined"
                              hide-details
                              single-line
                              density="compact"
                              v-model="item.filterData[0].eq"
                              @change="filterChange(item)"
                            ></v-text-field>
                          </v-list-item>
                        </template>
                        <template v-if="item.type == 'date'">
                          <v-list-item link class="datePicker">
                            <v-date-picker
                              width="200"
                              variant="outlined"
                              density="compact"
                              single-line
                              :hide-input="false"
                              :inset="false"
                              @change="filterChange(item)"
                            ></v-date-picker>
                          </v-list-item>
                        </template>
                      </v-list>
                    </v-menu>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </span>
        </span>
      </template>
    </v-data-table-virtual>
    <!-- 加载状态提示 -->
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  itemKey: {
    type: String,
    default: "id",
  },
  height: {
    type: [Number, String],
    default: 600,
  },
  showSelect: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectList: {
    type: Array,
    default: () => [],
  },
});

// 使用 defineEmits 定义要发出的事件
const emit = defineEmits(["sort-changed", "select-changed", "filter-changed"]);

const componentSelectList = ref([]);
const headersList = ref([]);
const colChecked = ref([]);
const TableRef = ref(null);
const sortBy = ref({
  key: null,
  value: "asc",
});

// 处理排序
const toggleSort = (key) => {
  if (sortBy.value.key === key) {
    // 如果点击的是当前排序列，则切换方向
    sortBy.value.value = sortBy.value.value === "asc" ? "desc" : "asc";
  } else {
    // 否则设置为新列，默认升序
    sortBy.value.key = key;
    sortBy.value.value = "asc";
  }

  // 使用 defineEmits 创建的 emit 函数
  emit("sort-changed", sortBy.value);
};

// 列控制逻辑保持不变
const headersChange = (value) => {
  headersList.value = [];
  props.headers.forEach((header) => {
    if (colChecked.value.includes(header.value)) {
      headersList.value.push(header);
    }
  });

  props.headers.forEach((element) => {
    element.disabled =
      colChecked.value.length === 1 && colChecked.value[0] === element.value;
  });
};

// 处理筛选逻辑
const filterChange = (item) => {
  // 触发筛选事件
  emit("filter-changed", item);
};

const onSelectedChange = (data) => {
  console.log(data);
  emit("select-changed", data);
};

// 初始化
onMounted(() => {
  if (props.headers.length > 0) {
    props.headers.forEach((element) => {
      colChecked.value.push(element.value);
    });
  }
  headersList.value = [];
  props.headers.forEach((element) => {
    element.disabled = false;
    headersList.value.push(element);
  });
});

// 当列控制变化时，清除不再显示的列的排序
watch(colChecked, (newVal) => {
  if (sortBy.value.key && !newVal.includes(sortBy.value.key)) {
    sortBy.value.key = null;
    emit("sort-changed", sortBy.value);
  }
});
watch(
  () => props.selectList,
  (newVal) => {
    if (newVal.length < 1) {
      componentSelectList.value = [];
    } else {
      componentSelectList.value = props.selectList;
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="less" scoped>
.smart-table-container {
  border: 1px solid #e0e0e0;
  //   border-radius: 8px;
  overflow: hidden;
  //   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.header-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.sortable-header {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 4px;
  user-select: none;
}

.sortable-header:hover {
  background-color: rgba(63, 81, 181, 0.08);
}

.sort-icon {
  margin-left: 8px;
  color: #3f51b5;
}

.sort-status {
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.status-label {
  font-weight: 500;
  color: #616161;
  margin-right: 8px;
}

.status-value {
  font-weight: 600;
  color: #3f51b5;
  display: flex;
  align-items: center;
}

:deep(.v-table__wrapper) {
  thead {
    tr {
      th {
        // background-color: #f5f7ff;
        font-weight: 600 !important;
      }
    }
  }
}

.input {
  :deep(.v-list-item__content) {
    font-size: 16px;
    height: 40px;
    display: flex;
    align-items: center;
    width: 100%;
  }
  :deep(.v-input__control) {
    width: 100%;
    height: 40px;
    .v-label {
      width: 100%;
    }
  }
  :deep(.v-input) {
    height: 40px;
  }
}

.datePicker {
  height: inherit !important;
  :deep(.v-input__control) {
    width: 100%;
    height: inherit;
    .v-label {
      width: 100%;
    }
  }
  :deep(.v-input) {
    height: inherit;
  }
}
.loading-more,
.no-more-data {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

.loading-more span {
  margin-left: 12px;
  color: #666;
}

.no-more-data {
  color: #999;
  font-size: 0.9rem;
}
</style>