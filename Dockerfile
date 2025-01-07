FROM public.ecr.aws/lambda/nodejs:18

COPY package.json ${LAMBDA_TASK_ROOT}

RUN npm install --platform=linux --arch=x64 sharp
RUN npm install

COPY . ${LAMBDA_TASK_ROOT} 