// src/api/index.js
import http from "@/utils/https.js";
import { get } from "lodash";

// 用户相关API
export const userApi = {
  // 登录
  login(data) {
    return http.post("/oauth/redirect", data);
  },
};

// project相关API
export const projectApi = {
  // 获取项目列表
  getProjectList() {
    return http.get("/projects");
  },

  // 创建项目
  getProjectInfo(data) {
    return http.get(`/projects/${data.projectId}`);
  },
  // 删除项目
  deleteProject(id) {
    return http.delete(`/projects/${id}`);
  },
  // 获取exp列表
  getExp(data) {
    return http.get("/exps", data);
  },
  // 分享
  shareProject(id, data) {
    return http.post(`/projects/${id}`, data);
  },
  // project 创建时获取metadata文件
  getMetaDataFile(data) {
    return http.donwloadPost("/projects/create_metadata", data);
  },
  // 创建project
  createProject(data) {
    return http.post("/projects", data);
  },
  // 更新project
  updateProject(id, data) {
    return http.put(`/projects/${id}`, data);
  },
  // 上传exp文件
  uploadExp(data) {
    return http.upload(`/exps_validation`, data);
  },
};

// data相关API
export const dataApi = {
  getFolderList(data) {
    return http.get("/library", data);
  },
  getFileList(id, data) {
    return http.get("/library/" + id, data);
  },
  createFolder(data) {
    return http.post("/library", data);
  },
  deleteFolder(id) {
    return http.delete(`/library/${id}`);
  },
  deleteFile(data) {
    return http.delete(`/library/${data.id}/${data.name}`);
  },
  editFolder(id, data) {
    return http.put("/library/" + id, data);
  },
  editFile(id, file, data) {
    return http.put(`/library/${id}/${file}`, data);
  },
  // combineFile
  combineFile(id, fileName) {
    return http.post(`/library/${id}/${fileName}/combine`);
  },
  // uploadFile
  uploadFile(id, formData) {
    return http.upload(`/library/${id}/`, formData);
  },
  // get file content
  getFileContent(id, name, data) {
    return http.get(`/library/${id}/${name}`, data);
  },
  // 下载文件
  downloadFile(id, name) {
    return http.download(`/library/${id}/${name}?file=true`);
  },
};

// tools相关API
export const toolsApi = {
  getCustomWorkflow() {
    return http.get("/custom_workflow");
  },
  getCustomWorkflowDetail(id) {
    return http.get(`/custom_workflow/${id}`);
  },
  createTemplateWorkflow(data) {
    return http.post("/custom_workflow/entity", data);
  },
  getTeamplateWorkflowResult() {
    return http.get("/custom_workflow/entity");
  },
  getToolResult(id) {
    return http.get("/custom_workflow/entity/" + id);
  },
  updateTemplateWorkflow(id, data) {
    return http.post("/custom_workflow/entity/" + id, data);
  },
  deleteToolResult(id) {
    return http.delete("/custom_workflow/entity/" + id);
  },
  downloadResult(id) {
    return http.download("/custom_workflow/entity_download/" + id);
  },
};

// analysis相关API
export const analysisApi = {
  getAnalysisList() {
    return http.get("/analyses");
  },
  getAnalysisDetail(id) {
    return http.get(`/analysis/${id}`);
  },
  createAnalysis(data) {
    return http.post("/analysis", data);
  },
  updateAnalysis(id, data) {
    return http.put(`/analysis/${id}`, data);
  },
  deleteAnalysis(id) {
    return http.delete(`/workflows/${id}`);
  },
  // downloadResult
  downloadAnalysis(workflowId, projectId) {
    return http.download(
      `/workflows/${workflowId}/download?projectId=${projectId}&0=download`
    );
  },
  // get analysis detail
  getAnalysisDetail(workflowId, projectId) {
    return http.get(`/workflows/${workflowId}`, projectId);
  },
  getAnalysisTableName(id, data) {
    return http.get("/taskNode/" + id + "/tableName", data);
  },
  getAnalysisTableData(id, data) {
    return http.get("/taskNode/" + id + "/table", data);
  },
  getAnalisisPlotData(id, data) {
    return http.get("/taskNode/" + id + "/plot", data);
  },
  getWorkflowTools() {
    return http.get("/workflow/tools");
  },
};
// results
export const resultsApi = {
  getResultsList() {
    return http.get("/results");
  },
};
// basic
export const basicApi = {
  uploadTemplateFile(data) {
    return http.upload("/temp_file/", data);
  },
};
