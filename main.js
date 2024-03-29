// #ifndef VUE3
import Vue from 'vue'
import App from './App'
//将请求promise化
import {
	$http
} from '@escook/request-miniprogram'
//导入store的实例对象
import store from '@/store/store.js'
//导入colorUI
import cuCustom from './colorui/components/cu-custom.vue'
Vue.component('cu-custom', cuCustom)

uni.$http = $http
//设置请求的根路径
$http.baseUrl = XXXX
//$http.baseUrl = XXXX

Vue.config.productionTip = false

App.mpType = 'app'

//挂载的弹窗方法
uni.$showMsg = function(title = '数据加载失败！', duration = 1500) {
	uni.showToast({
		title,
		duration,
		icon: 'none'
	})
}

const app = new Vue({
	...App,
	store,
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import App from './App.vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif
