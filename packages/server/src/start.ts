import { startServer } from '@opentiny/genui-sdk-server';
import { materialsMeta as reactMaterialsMeta } from '@opentiny/genui-sdk-materials-react-antd/meta';
import { materialsMeta as angularMaterialsMeta } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/meta';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.BASE_URL!;
const apiKey = process.env.API_KEY!;

if (!baseURL || !apiKey) {
  throw new Error('请在环境变量中配置 BASE_URL 和 API_KEY');
}

// tiny-vue 物料库服务
startServer({
  port: 3100,
  baseURL,
  apiKey,
  maxAttempts: 10, // 端口冲突时最大尝试次数
});


// antd 物料库服务
startServer({
  port: 3200,
  baseURL,
  apiKey,
  materialsMeta: reactMaterialsMeta,
  maxAttempts: 10, // 端口冲突时最大尝试次数
});

// tiny-ng 物料库服务（Angular / OpenTiny NG）
startServer({
  port: 3300,
  baseURL,
  apiKey,
  materialsMeta: angularMaterialsMeta,
  maxAttempts: 10, // 端口冲突时最大尝试次数
});
