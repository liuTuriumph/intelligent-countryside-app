<template>
	<view>
		<cu-custom bgColor="bg-blue" :isBack="true">
			<view slot="backText">返回</view>
			<view slot="content">校园圈</view>
		</cu-custom>
		<!-- 顶部选择导航栏 -->
		<view class="topBar">
			<scroll-view scroll-x class="bg-blue nav text-center">
				<view class="cu-item" :class="0==TabCur?'text-white cur':''" @tap="tabSelect" data-id="0">
					<text class="cuIcon-my"></text> 发动态
				</view>
			</scroll-view>
		</view>
		<!-- 发表动态界面 -->
		<view class="posts">
			<view class="cu-card dynamic">
				<view class="cu-item shadow">
					<!-- 用户头像区域 -->
					<view class="userInfo-container">
						<view class="userInfo-body">
							
							<image :src="userinfo.avatarUrl" class="userInfo-body-image" mode="aspectFill"></image>	
							
							<view class="userInfo-box">
								<view class="userInfo-name">{{userinfo.nickName}}</view>
							</view>
						</view>
					</view>
					<!-- 用户内容区域 -->
					<!-- 分隔线 -->
					<view class="text-line">
						<view class="line"></view>
					</view>
					<!-- 文本框 -->
					<view class="text-content">
						<textarea class="contentTextArea" @input="setContent" maxlength="-1" placeholder="分享新鲜事"
							auto-height="true" disable-default-padding></textarea>
					</view>
					<!-- 图片添加栏 -->
					<view class="head cu-item shadow">
						<!-- 显示用户已经选择的图片 -->
						<view class="add" v-for="(item,index) in tempFilePaths" :key="index">
							<image :src="item" mode="aspectFill" @click.stop="previewImage" :data-id="index"></image>
							<view class="delete iconfont cuIcon-roundclosefill" @click.stop="toDelete" :data-id="index">
							</view>

						</view>
						<!-- 当不足9张时，显示添加图片的按钮-->
						<view class="add-after" @click.stop="addImage"
							v-if="imageCunt ? (imageCunt < maxCount ? true : false) : true">
							<uni-icons type="plusempty" size="45rpx" color="red"></uni-icons>
						</view>
					</view>
					<!-- 发表动态按钮 -->
					<view class="padding-xl" @click.stop="goSendPosts">
						<button class="cu-btn block bg-gradual-blue margin-tb-sm lg">
							<text class="iconfont-spin"></text> 发表
						</button>
					</view>

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
	import COS from "../../utils/cos-wx-sdk-v5.js"
	import config from "../../common/config.js"
	export default {
		data() {
			return {
				isCard: true,
				TabCur: 0,
				//存储图片数组
				tempFilePaths: [],
				//图片数量
				imageCunt: 0,
				// 用户输入动态文本
				content: '',
				//可选择的图片数量
				maxCount: 6,
				//用户上传的图片的路径数组
				tempImagesPaths: []
			};
		},
		computed: {
			...mapState('m_user', ['userinfo','openid','userid']),

		},
		methods: {
			tabSelect(e) {
				this.TabCur = e.currentTarget.dataset.id;
				this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60
			},
			setContent(e) {
				this.content = e.detail.value
			},
			//预览图片
			previewImage(ev) {
				//查看对应的图片
				const id = ev.target.dataset.id;
				uni.previewImage({
					current: this.tempFilePaths[id],
					urls: this.tempFilePaths,
				})
			},
			//删除图片
			toDelete(ev) {
				const id = ev.target.dataset.id;
				//过滤生成一个新的数组
				const tempFilePaths = this.tempFilePaths.filter((item, index) => {
					return index != id
				})
				this.imageCunt = this.imageCunt - 1
				this.tempFilePaths = tempFilePaths
			},
			//添加图片
			addImage() {		
				uni.chooseImage({
					count: this.maxCount,
					sizeType: ['compressed', 'original'],
					success: (res) => {
						//用户选择的图片数量
						const imageCount = res.tempFilePaths.length
						//剩余的图片的数量位
						const surplusImage = this.maxCount - this.imageCunt
						//判断
						if (imageCount > surplusImage) {
							//当用户选择的图片数量超过了剩余位置数量
							uni.showModal({
								title: '您最多还可以添加' + surplusImage + '张图片'
							})
						} else {
							this.tempFilePaths = [...this.tempFilePaths, ...res.tempFilePaths]
							this.imageCunt = this.imageCunt + imageCount
						}
					},
					
				})
			},
			//发动态
			async goSendPosts() {
				//判断图片和内容是否同时为空
				if (this.tempFilePaths.length === 0 && !this.content) {
					uni.showModal({
						title: "图片和文字内容不能同时为空"
					})
					return
				}
				//如果图片数量不为0
				if(this.tempFilePaths.length !== 0){
					//显示图片正在上传
					uni.showLoading({
						title: "图片上传中",
						mask: true
					})
					//循环上传图片
					const res= await this.uploadForImages()							
					//关闭提示
					uni.hideLoading()
				}
			    
				const query = {
					openid: this.openid,
					nickName: this.userinfo.nickName,
					faceImage: this.userinfo.avatarUrl,
					content: this.content,
					imagesList: this.tempImagesPaths,
					time: Date.now()
				}
				//将动态信息存储到数据库中。
				const res = await uni.$http.post('/kivze/chat/addPostsInfo',query)
				if(res.data.flag !== true){
					uni.$showMsg('动态发布失败，请重试。')
					return
				}		
				//插入成功，用获取到的自增长id值创建帖子分享数表
				const res2 = await uni.$http.post('/kivze/chat/addPostsCount',res.data.data)
				if(res2.data.flag !== true){
					uni.$showMsg('动态发布失败，请重试。')
					return
				}
				//发送成功,在用户表中记录该用户发布的帖子id
				const res3 = await uni.$http.put("/kivze/user/addSendPost/"+res.data.data+"/"+this.userid)
				if(res3.data.flag !== true){
					uni.$showMsg('动态发布失败，请重试。')
					return
				}
				//发布成功跳转到聊天首页
				uni.switchTab({
					url:"../../pages/chat/chat",
					success: () => {
						uni.$showMsg('发布动态成功。')
					}
				})
			},
			//遍历上传图片
			async uploadForImages(){
				for(let i=0;i<this.tempFilePaths.length;i++){
					 await this.uploadImageInCos(i)
				}
				return this.tempImagesPaths
			},
			//上传图片到cos
			async uploadImageInCos(index){
				const res = await this.uploadCos(index)			
			},
			uploadCos(index){
				return new Promise((resolve)=>{
					//使用uploadFile发送post请求，将用户的信息传到后端
					var cos = config.getcos()
					//获取年月日
					var date = new Date();
					//获取当前日期的毫秒值，即时间戳
					var timestamp = Date.parse(new Date());  
					//按年月日存储，按当前时间戳加3位随机数命名
					const filePath = "/images/chat/"+date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+"/"+(timestamp+(Math.random()*1000).toFixed(0))+".png"
					const that = this
					cos.postObject({
						Bucket: "intelligentcountry-1306217706",
						Region: "ap-guangzhou",
						Key: filePath,
						FilePath: this.tempFilePaths[index],
						onProgress: function(info) {
						}
					},	
					function(err, data) {
						if(err !== null) console.log(err)
						if (data != null) {
							var fileCosFilePath = data.Location; //上传成功之后，返回路径信息，用于后台存库
							that.tempImagesPaths = [...that.tempImagesPaths,'https://'+fileCosFilePath]
							resolve(that.tempImagesPaths)
						}
						
					})		
				})
			}
			

		}
	}
</script>

<style lang="scss">
	.userInfo-container {
		display: flex;
		width: 100%;

		.userInfo-body {
			height: 140upx;
			display: flex;
			align-items: center;
			padding-left: 15px;
			
			.userInfo-body-image{
				border-radius: 100%;
				width: 43px;
				height: 43px;
			}
			
			.userInfo-box {
				left: 146upx;
				padding-left: 10px;
				justify-content: space-around;

				.userInfo-name {
					font-size: 15px;

				}
			}
		}
	}

	.text-line {
		display: flex;
		justify-content: center;

		.line {
			display: block;
			margin: 0 30upx;
			width: 100%;
			height: 1px;
			background: #E7E7E7;
		}
	}

	.text-content {
		min-height: 300rpx;

		.contentTextArea {
			width: 100%;
			min-height: 300rpx;
			padding: 10rpx;
			box-sizing: border-box;
		}
	}


	.head {
		display: flex;
		flex-wrap: wrap;
		padding: 0 10rpx;

		.add {
			width: 200rpx;
			height: 200rpx;
			border-radius: 20rpx;
			border: 1rpx solid #E7E7E7;
			margin: 10rpx;
			position: relative;

			image {
				width: 200rpx;
				height: 200rpx;
			}

			.delete {
				position: absolute;
				right: 5rpx;
				top: 5rpx;
				font-size: 40rpx;
				z-index: 10;
				color: rgba(191, 191, 191, 0.8);
			}
		}

		.add-after {
			width: 200rpx;
			height: 200rpx;
			border-radius: 20rpx;
			border: 1rpx solid #E7E7E7;
			margin: 10rpx;
			position: relative;
			text-align: center;
			line-height: 220rpx
		}
	}

	.padding-xl {
		padding: 120rpx;
	}
</style>
