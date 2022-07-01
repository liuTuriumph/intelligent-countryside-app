<template>
	<view class="my-userinfo-container">
		<!-- 头像昵称区域 -->
		<view class="top-box">
			<image :src="userinfo.avatarUrl" class="avatar"></image>
			<view class="nickname">{{userinfo.nickName}}</view>
		<image
		      src="https://intelligentcountry-1306217706.cos.ap-guangzhou.myqcloud.com/images/my/wave.gif"
		      mode="scaleToFill" 
			  class="gif-wave">
		</image>
		</view>
		
		<!-- 第一个面板 -->
		<view class="panel1">
			<!-- panel的主体区域 -->
			<view class="panel-body">
				<!-- 面板中的item项 -->
				<view class="panel-item">
					<text>8</text>
					<text>点赞的帖子</text>
				</view>
				<view class="panel-item">
					<text>14</text>
					<text>发布的帖子</text>
				</view>
				<view class="panel-item">
					<text>84</text>
					<text>评论的帖子</text>
				</view>
			</view>
		</view>
		
		<!-- 面板列表区域 -->
		<view class="panel-list">
			<!-- 第三个面板 -->
			<view class="panel">
				<view class="panel-list-item" @click="getUserPostList()">
					<view>
						<uni-icons type="chatboxes-filled" color="#00BFFF" size="15"></uni-icons>
						<text class="panel-list-item-image">我的帖子</text>
					</view>
					<uni-icons type="arrowright" size="15"></uni-icons>
				</view>
				<view class="panel-list-item" @click="getUserPrizeList()">
					<view>
						<uni-icons type="heart-filled" color="#FF4500" size="15"></uni-icons>
						<text class="panel-list-item-image">我的点赞</text>
					</view>
					<uni-icons type="arrowright" size="15"></uni-icons>
				</view>
				<view class="panel-list-item">
					<button class="adviseBtn" open-type="feedback">
						<view class="item-box1">
							<view>
								<uni-icons type="email-filled" color="#00FA9A" size="15"></uni-icons>
								<text class="panel-list-item-image">意见反馈</text>
							</view>
							<view class="item-box2">		
								<uni-icons type="arrowright" size="15"></uni-icons>
							</view>		
						</view>
					</button>
				</view>
				<view class="panel-list-item">
					<button class="adviseBtn" open-type="share">
						<view class="item-box1">
							<view>
								<uni-icons type="redo-filled" color="#A9A9A9" size="15"></uni-icons>
								<text class="panel-list-item-image">分享给朋友</text>
							</view>
							<view class="item-box2">		
								<uni-icons type="arrowright" size="15"></uni-icons>
							</view>		
						</view>
					</button>
				</view>
				<view class="panel-list-item" @click="userExit">
					<view>
						<uni-icons type="clear" color="red" size="15"></uni-icons>
						<text class="panel-list-item-image">退出登录</text>
					</view>		
					<uni-icons type="arrowright" size="15"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		name: "my-userinfo",
		data() {
			return {

			};
		},
		computed:{
			...mapState('m_user', ['userinfo', 'openid','userid']),
		},
		methods: {
			...mapMutations('m_user', ['updateUserInfo', 'updateUserLogin', 'updateUserOpenId',"updateUserId"]),
			//用户退出功能
			async userExit() {
				const [err, succ] = await uni.showModal({
					title: '提示',
					content: '确认退出登录吗？',
				}).catch(err => err)
				
				if(succ && succ.confirm){
					this.updateUserInfo('{}')
					this.updateUserLogin(false)
					this.updateUserOpenId(null)
					this.updateUserId(null)
				}
			},
			//分享转发帖子的功能
			onShareAppMessage(event){		
				var shareObj = {
					title:'智慧乡村管理小程序',
					imageUrl:"/static/shareImage2.jpg",
					path:'pages/home/home',
				}
				return shareObj
			},
			//获取用户发布的帖子		
			getUserPostList(){				
				uni.navigateTo({
					url:'../../subpkg/userSendPosts/userSendPosts?userId='+this.userid
				})
			},
			//获取用户点赞的帖子
			getUserPrizeList(){				
				uni.navigateTo({
					url:'../../subpkg/userPrizePosts/userPrizePosts?userId='+this.userid
				})
			},
			
		},
	}
</script>

<style lang="scss">
	.my-userinfo-container {
		height: 100%;
		background-color: #F4f4f4;

		.top-box {
			position: relative;
			height: 400rpx;
			background-color: #1E90FF;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;

			.avatar {
				width: 90px;
				height: 90px;
				display: block;
				border-radius: 45px;
				border: 2px solid white;
				box-shadow: 0 1px 5px black;
			}

			.nickname {
				color: white;
				font-weight: bold;
				font-size: 16px;
				margin-top: 10px;
			}
			.gif-wave{
				position: absolute;
				width: 100%;
				bottom: 0;
				left: 0;
				z-index: 99;
				mix-blend-mode: screen;
				height: 200rpx;
			}
		}

		.panel1{	
			width: 100%;
			background-color: white;
			border-radius: 3px;
			margin-bottom: 8px;
			box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
			.panel-body {
				display: flex;
							
				.icon {
					width: 35px;
					height: 35px;
			
				}
			
				.panel-item {
					width: 33.3%;
					display: flex;
					align-items: center;
					flex-direction: column;
					justify-content: space-around;
					padding: 10px 0;
					font-size: 13px;
			
				}
			}
		}
			
		.panel-list {
			padding: 0 10px;
			position: relative;
			top: 10px;
			
			.panel {
				background-color: white;
				border-radius: 3px;
				margin-bottom: 8px;

				.panel-tital {
					line-height: 45px;
					border-bottom: 1px solid #F4f4f4;
					padding-left: 10px;
					font-size: 15px;
				}

				.panel-body {
					display: flex;
					

					.icon {
						width: 35px;
						height: 35px;

					}

					.panel-item {
						width: 33.3%;
						display: flex;
						align-items: center;
						flex-direction: column;
						justify-content: space-around;
						padding: 10px 0;
						font-size: 13px;

					}
				}

				.panel-list-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 0 10px;
					line-height: 45px;
					font-size: 15px;

					.panel-list-item-image{		
						margin-left: 15rpx;
					}
					.adviseBtn{
						width: 100%;
						background-color: white;
						border: none;
						text-align: left;
						margin: 0px;
						border-radius: 0;
						overflow: visible;
						padding: 0;
						.item-box1{
							display: flex;
							flex-direction: row;
							align-items: center;
							justify-content: space-between;
							.item-box2{
								text-align: right;						
							}
						}
					}			
					.adviseBtn text{
						font-size: 15px;
					}
					.adviseBtn[plain]{
						border: 0;
					}
					.adviseBtn::after{
						border: none;
						border-radius: 0;
					}
					
				}
			}
		}
	}
</style>
