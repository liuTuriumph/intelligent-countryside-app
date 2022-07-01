<template>
	<view class="user-container">
		<!-- 用户未登录显示登录页面 -->
		<my-login v-if="!is_login"></my-login>
		<!-- 用户已登录显示详细信息页面 -->
		<my-userinfo v-else></my-userinfo>
	</view>
</template>

<script>
	import {mapState} from 'vuex'
	
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			//分享转发帖子的功能
			onShareAppMessage(event){			
				var shareObj = {
					title:'智慧乡村管理小程序',
					imageUrl:"/static/shareImage2.jpg",
					path:'pages/home/home',
				}
				return shareObj
			},
		},
		computed:{
			...mapState('m_user',['is_login'])
		}
	}
</script>

<style lang="scss">
	page,.user-container{
		height: 100%;
		background-color: white;
	}
</style>
