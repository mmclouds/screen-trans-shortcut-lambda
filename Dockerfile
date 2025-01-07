FROM public.ecr.aws/lambda/nodejs:18

# 设置工作目录
WORKDIR ${LAMBDA_TASK_ROOT}

# 复制package.json文件
COPY package*.json ./

# 安装sharp包（特别指定平台和架构）
RUN npm install --platform=linux --arch=x64 sharp

# 安装其他依赖
RUN npm install

# 复制函数代码
COPY index.mjs ./

# 设置Lambda函数处理程序
CMD [ "index.handler" ]