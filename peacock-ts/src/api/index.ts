import axios, { Axios, AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/config/serviceLoading';
import { store } from '@/redux';
import { Simulate } from 'react-dom/test-utils';
import error = Simulate.error;

const config = {};

class RequestHttp {
	service: AxiosInstance;
	constructor(config: AxiosRequestConfig) {
		this.service = axios.create(config);

		this.service.interceptors.request.use(
			(config: AxiosRequestConfig) => {
				// * 如果当前请求不需要显示 loading,在api服务中通过指定的第三个参数: { headers: { noLoading: true } }来控制不显示loading
				config.headers!.noLoading || showFullScreenLoading();
				const token: string = store.getState().global.token;
				return { ...config, headers: { ...config.headers, 'x-access-token': token } };
			},
			(error: AxiosError) => {
				return Promise.reject(error);
			}
		);

		this.service.interceptors.response.use(
			(response: AxiosResponse) => {
				// 请求成功处理
				tryHideFullScreenLoading();
				return response;
			},
			async (error: AxiosError) => {
				tryHideFullScreenLoading();
				// 请求错误处理

				return Promise.reject(error);
			}
		);
	}
}

export default new RequestHttp(config);
