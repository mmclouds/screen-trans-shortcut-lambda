import sharp from 'sharp';
import axios from 'axios';
const VolcEngineSDK = require("volcengine-sdk");

async function compressImage(base64String, quality) {
    const inputBuffer = Buffer.from(base64String, 'base64');
    const outputBuffer = await sharp(inputBuffer)
        .jpeg({
            quality: quality || 85,
            chromaSubsampling: '4:2:0',
        })
        .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .normalize()
        .modulate({
            saturation: 0.8,
            brightness: 1.0,
            hue: 0
        })
        .toBuffer();
    return outputBuffer.toString('base64');
}

export const handler = async (event, context) => {
    // 添加调试日志
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Context:', JSON.stringify(context, null, 2));
    
    try {
        // 解析请求体
        const requestBody = JSON.parse(event.body);
        const { message, password } = requestBody;
        
        // 验证密码
        if (password !== process.env.API_PASSWORD) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    error: '密码错误',
                    message: '请提供正确的访问密码'
                })
            };
        }

        const { ApiInfo, ServiceInfo, Credentials, API, Request } = VolcEngineSDK;
        const compressedImage = await compressImage(message, 70);

        const requestParams = new Request.Body({
            'TargetLanguage': process.env.TARGET_LANGUAGE,
            'Image': compressedImage
        });

        const credentials = new Credentials(
            process.env.VOLC_ACCESS_KEY,
            process.env.VOLC_SECRET_KEY,
            'translate',
            'cn-north-1'
        );

        const query = new Request.Query({
            'Action': 'TranslateImage',
            'Version': '2020-07-01'
        });
        
        const header = new Request.Header({
            'Content-Type': 'application/json'
        });
        
        const serviceInfo = new ServiceInfo(
            'open.volcengineapi.com',
            header,
            credentials
        );
        
        const apiInfo = new ApiInfo('POST', '/', query, requestParams);
        const api = API(serviceInfo, apiInfo);
        const axiosResponse = await axios.post(api.url, api.params, api.config);

        const resImage = `data:image/jpeg;base64,${axiosResponse.data.Image}`;
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: resImage
            })
        };
    } catch (error) {
        console.error('处理请求时出错:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}; 