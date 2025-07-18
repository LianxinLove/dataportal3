// src/utils/download.js
import streamSaver from 'streamsaver';
import http from '@/utils/https'; // 导入您自定义的 Axios 实例
import { useSnackbarStore } from '@/stores/snackbar';

// 生产环境配置 MITM
if (import.meta.env.PROD) {
  streamSaver.mitm = 'https://phenomics.fudan.edu.cn/firmiana/DP/v01'; // 替换为实际 URL
}

const snackbar = useSnackbarStore();

// 核心下载函数（带进度回调）
export const streamDownload = async (url, filename, params = {}, onProgress) => {
  let writer;
  try {
    // 1. 使用自定义 Axios 实例发送 HEAD 请求获取文件信息
    const headRes = await http.get(url, {
      ...params,
      responseType: 'arraybuffer', // 确保使用您的配置
      __isHeadRequest: true // 自定义标记避免拦截器处理
    });

    const contentLength = +headRes.headers['content-length'];
    
    // 2. 创建文件写入流
    const fileStream = streamSaver.createWriteStream(filename, {
      size: contentLength
    });
    
    writer = fileStream.getWriter();

    // 3. 使用自定义 Axios 实例获取文件流
    const response = await http.download(url, {
      ...params,
      responseType: 'stream', // 关键：声明流式响应
      onDownloadProgress: progressEvent => {
        if (onProgress && contentLength) {
          const percent = Math.round((progressEvent.loaded / contentLength) * 100);
          onProgress(percent);
        }
      }
    });

    const reader = response.data.getReader();
    let receivedBytes = 0;
    
    // 4. 流式写入处理
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) {
        await writer.close();
        return;
      }
      
      receivedBytes += value.length;
      await writer.write(value);
      return pump();
    };
    
    await pump();
    return true;
  } catch (error) {
    console.error('下载失败:', error);
    // 使用您配置的统一错误处理
    snackbar.openSnackbar({
      color: 'red-darken-2',
      text: `下载失败: ${error.message || '网络错误'}`
    });
    
    // 中止下载流
    if (writer) await writer.abort();
    throw error;
  }
};