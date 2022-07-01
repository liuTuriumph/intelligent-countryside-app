<template>
	<view>
		
		<view class="login-container">
			<!-- 登录图标 -->
			<uni-icons type="contact-filled" size="100" color="#AFAFAF"></uni-icons>
			<!-- 登录按钮 -->
			<button type="primary" @click="userLogin" class="login-btn">一键登录</button>
			<!-- 登录文本提示 -->
			<view class="login-tips">登录后尽享更多权益</view>
		</view>
		
		<!-- 发动态前确认请求授权的信息栏 -->
		<view class="cu-modal" :class="modalName=='DialogModal1'?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">授权请求</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-xl">
					发动态需要先获取您的微信授权。
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-red text-red" @tap="hideModal">取消</button>
						<button class="cu-btn bg-blue margin-left" @tap="getUserProfile">确定</button>
					</view>
				</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	import {mapMutations,mapState} from 'vuex'
	export default {
		name:"my-login",
		data() {
			return {
				modalName: null,
			};
		},
		computed:{
			...mapState('m_user', ['userinfo', 'openid','userid']),
		},
		methods:{
			...mapMutations('m_user', ['updateUserInfo', 'updateUserLogin', 'updateUserOpenId',"updateUserId"]),
			hideModal(e) {
				this.modalName = null
			},
			userLogin(){
				this.modalName = 'DialogModal1'
			},
			//获取用户信息
			getUserProfile() {
				this.modalName = null
				uni.getUserProfile({
					desc: '获取用户信息',
					success: (res) => {
						//将用户信息本地化存储
						this.updateUserInfo(res.userInfo)
						//将用户登录信息本地化存储
						this.updateUserLogin(true)	
						this.is_login = uni.getStorageSync('is_login')
						//获取用户openid
						uni.login({
							success: (res) => {
								this.getOpenId(res.code)
							}
						})
					},
					fail: (e) => {
						if (e.errMsg === 'getUserProfile:fail auth deny') return uni.$showMsg('您取消了登录授权')
			
					}
				})
			},
			//发送请求到后端获取openid,并将数据存储到本地
			async getOpenId(code) {
				//获取用户openid
				const {
					data: res
				} = await uni.$http.get('/kivze/user/getOpenId/' + code)
				this.updateUserOpenId(res.msg)
				//获取用户id
				this.getUserId(res.msg)
				return
			},
			//获取用户id
			async getUserId(openid){
				const {data:res} = await uni.$http.get('/kivze/user/getUserId/'+openid)	
				this.updateUserId(res.data)			
			},

			
		}
	}
</script>

<style lang="scss">
	.login-container{
		height: 750rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #F8F8F8;
		position: relative;
		overflow: hidden;

		&::after{
			content: ' ';
			width: 100%;
			height: 40px;
			display: block;
			background-color: white;
			position: absolute;
			left: 0;
			bottom: 0;
			border-radius: 100%;
			transform: translateY(50%);
		}
		
		.login-btn{
			width: 90%;
			border-radius: 100px;
			background-color: #1E90FF;
			margin: 13px 0;
		}
		.login-tips{
			font-size: 12px;
			color: gray;
		}
	}
</style>