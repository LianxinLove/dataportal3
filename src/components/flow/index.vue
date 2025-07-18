<template>
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    @dragover="onDragOver"
    :apply-default="false"
    :connectionMode="'loose'"
    :default-node-config="{ draggable: true }"
    class="custom-node-flow"
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
</template>
<script setup>
import { ref, onMounted } from "vue";
import {
  VueFlow,
  useVueFlow,
  Handle,
  Position,
  MarkerType,
} from "@vue-flow/core";
import DropzoneBackground from "./DropzoneBackground.vue";
import useDragAndDrop from "@/utils/useDnD.js";

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
</script>