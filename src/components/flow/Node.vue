<script setup>
import { Handle, Position, useVueFlow } from "@vue-flow/core";
// import { colors } from "./presets.js";
// import { Download, Upload, Delete } from "@element-plus/icons-vue";

const props = defineProps(["data", "deleteMethod"]);
console.log("props", props);
const deleteNodeMethod = () => {
  props.deleteMethod(props.data);
};
</script>

<template>
  <div class="custom-node">
    <p class="content">
      <span>{{ props.data.name }}</span>
      <v-btn
        icon="mdi-delete"
        variant="text"
        color="error"
        @click="deleteNodeMethod"
      ></v-btn>
      <!-- <el-button link type="danger" class="delete" @click="deleteNodeMethod">
      <el-icon>
        <Delete />
      </el-icon>
    </el-button> -->
    </p>

    <Handle id="a" type="target" :position="Position.Left" />
    <Handle id="b" type="source" :position="Position.Right" />
  </div>
</template>
<style lang="less" scoped>
.content {
  position: relative;
  color: #000;
  height: 40px;
  line-height: 40px;
  display: flex;
  text-align: center;
  justify-content: space-between;
  align-items: center;
  min-width: 150px;
  :deep(.v-btn) {
    width: 24px;
    height: 24px;
  }
  :deep(.v-btn):hover,
  :deep(.v-btn__underlay),
  :deep(.v-btn__overlay):hover {
    background: none !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    // position: absolute;
    // right: 10px;
  }
  span {
    font-size: 16px !important;
    line-height: 1;
  }
}
.custom-node {
  background-color: #fff;
  padding: 0px 16px;
  border: 1px solid #1867c0;
  border-radius: 4px;
  // width: 180px;
  height: 40px;
}
:deep(.vue-flow__handle) {
  width: 8px;
  height: 24px;
  border-radius: 4px;
  background: #5c8dff;
}
:deep(.vue-flow__node) {
  border-color: #89a8f0;
}
</style>
