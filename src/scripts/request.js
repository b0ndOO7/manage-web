import axios from "axios";
import qs from "qs";
import router from "../router"
import { Message } from "element-ui"


/****** 创建axios实例 ******/
const service = axios.create({
    baseURL: 'http://test.manage.com/api',  // api的base_url
    timeout: 10000,  // 请求超时时间10s
    responseType: "json",
    headers: {
        "Content-Type": "application/json;charset=UTF-8"
    }
});

/****** request拦截器==>对请求参数做处理 ******/
service.interceptors.request.use(config => {
    config.method === 'post'
        ? config.data = config.data
        : config.params = config.params;
    config.headers['token'] = localStorage.getItem('token');
    config.headers['uid'] = localStorage.getItem('uid');

    return config;
}, error => {  //请求错误处理
    Promise.reject(error)
});

/****** respone拦截器==>对响应做处理 ******/
service.interceptors.response.use(
    response => {  //成功请求到数据
        //这里根据后端提供的数据进行对应的处理
        if (response.status) {
            switch (response.data.code) {
                case -1:
                case -2:
                case -3:
                    Message.warning(response.data.msg);
                    router.push('/login');
                    break;
                default:
                    return response.data;
                    break;
            }
        }
    },
    error => {  //响应错误处理
        console.log(error);
        let text_status = JSON.parse(JSON.stringify(error)).response.status;
        if (text_status) {
            switch (text_status) {
                case 400:
                case 401:
                    error.message = '访问失败';
                    router.push('/403');
                    break;
                case 403:
                    error.message = '访问失败';
                    router.push('/403');
                    break;
                case 404:
                    error.message = '访问路径不存在';
                    router.push('/404');
                    break;
                case 500:
                case 502:
                case 503:
                    console.log('500了  ')
                    error.message = '服务器内部错误';
                    router.push('/500');
                    break;
                default:
                    error.message = '未知道异常，请联系管理员';
                    break;
            }
        }
        return Promise.reject(error)
    }
);


export default service;
