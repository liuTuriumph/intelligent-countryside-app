<template>
	<view>
		<view class="top-body">
			<text>朋友圈</text>
		</view>
		<!-- 顶部选择导航栏 -->
		<view class="topBar">
			<scroll-view scroll-x class="bg-blue nav text-center" style="background-color: #1E90FF;">
				<view class="cu-item" :class="0==TabCur?'text-white cur':''" @tap="tabSelect" data-id="0">
					<text class="cuIcon-time"></text> 最新
				</view>
				<view class="cu-item" :class="1==TabCur?'text-white cur':''" @tap="tabSelect" data-id="1">
					<text class="cuIcon-like"></text> 推荐
				</view>
				<view class="cu-item" :class="2==TabCur?'text-white cur':''" @tap="tabSelect" data-id="2">
					<text class="cuIcon-upstage"></text> 精华
				</view>
			</scroll-view>
		</view>
		<!-- 当滚动到一定位置，显示缩略的标题栏 -->
		<view class="top-scroll-box" v-if="scrollTop > 150">
			<view class="top-btn" @tap="scrollToTop">
				<text class="lg text-gray cuIcon-top" style="color: white;font-size: 35rpx;"></text>
				<text class="top-btn-text">返顶</text>
			</view>	
			<view class="top-text">
				<text>朋友圈</text>
			</view>	
			
		</view>
		<!-- 帖子 -->
		<view class="posts">
			<view class="cu-card dynamic" :class="no-card" v-for="(item,i1) in postsInfo" :key="i1">
				<view class="cu-item shadow">
					<!-- 用户头像区域 -->
					<view class="userInfo-container">
						<view class="userInfo-body">
							<view class="cu-avatar round lg" :style="'background-image:url(' + item.faceImage + ');'"></view>
							<view class="userInfo-box">
								<view class="userInfo-name">{{item.nickName}}</view>
								<view class="text-gray text-sm flex justify-between">
									{{timeFormat(item.time)}}
								</view>
							</view>
						</view>
					</view>
					<!-- 用户动态文字区域 -->
					<view class="text-content">
						{{item.content}}
					</view>
					<!-- 用户动态图片区域 -->
					<view class="grid flex-sub padding-lr" :class="item.imagesList.length > 1 ?'col-3 grid-square':'col-1'">
						<view class="bg-img" :class="item.imagesList.length > 1 ?'':'only-img'" v-for="(item2,i2) in item.imagesList"
						  :style="'background-image:url('+item2+');'"
						  :key="i2"
						  @click.stop="previewImage(item.imagesList)">
						</view>
					</view>
					<!-- 观看数，点赞数，回复数 -->
					<view class="text-gray text-sm text-right padding">
						<text class="cuIcon-attentionfill margin-lr-xs"></text> 10
						<text class="cuIcon-appreciatefill margin-lr-xs"></text> 20
						<text class="cuIcon-messagefill margin-lr-xs"></text> 30
					</view>
					<!-- 简略回复区域 -->
					<view class="reply-container">
						<view class="reply-back">
							<view class="reply-content">
								<text class="replyUser-text">
									<text class="replyUser">凯漩</text>
									<text class="semicolon">:</text>
									大家好我是一个来自非洲的黑人穆斯林留学生，现居广州，我是一个转性别女性，是同性恋，是PETA成员，女权斗士，素食主义者，戴着眼镜，脸上有雀斑，得了重度抑郁症
									</text>
							</view>
							<view class="reply-content">
								<text class="replyUser-text">
									<text class="replyUser">凯漩</text>
									<text class="semicolon">:</text>
									一眼丁真，鉴定为假。
								</text>
							</view>
							<!-- 当超出两条评论 -->
							<view class="replymore-content">
								<text class="replymore-dots">
									...
								</text>
								<uni-icons class="replymore-icon" type="chat" size="30px"></uni-icons>
							</view>

						</view>
					</view>
				</view>
			</view>		
		</view>
		<!-- 发布动态按钮 -->
		<view class="action round-click animation-slide-bottom" @tap="sendPosts" data-target="DialogModal1">
			<uni-icons type="plusempty" size="30px" color="white"></uni-icons>
		</view>
		<!-- 发动态前确认请求授权的信息栏 -->
		<view class="cu-modal" :class="modalName=='DialogModal1'?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">Modal标题</view>
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
	import {mapMutations} from 'vuex'
	export default {
		data() {
			return {
				TabCur: 0,
				scrollLeft:0,
				modalName:null,
				is_login:false,
				//保存动态信息
				postsInfo:[],
				//节流阀标志，防止用户频繁请求
				isLoading:false,
				//分页请求数据
				queryObj:{
					//页码值
					pagenum:1,
					//每页显示多少条数据
					pagesize:5
				},
				//总数量，用于分页
				total:0,
				scrollTop:0,
			};
		},
		onShow() {
			this.is_login = uni.getStorageSync('is_login')
		},
		onLoad(){
			this.getPostsInfo()
		},
		//下拉刷新事件
		onPullDownRefresh() {
			//重置数据
			this.queryObj.pagenum=1
			this.total=0
			this.isLoading=false
			this.postsInfo=[]
			//重新获取数据,并手动关闭下拉事件
			this.getPostsInfo(()=>{
				uni.stopPullDownRefresh()
			})
		},
		//触底事件
		onReachBottom() {
			//到最后一页的时候，停止请求并提示
			if(this.queryObj.pagenum * this.queryObj.pagesize >= this.total) 
			return uni.$showMsg('数据加载完毕！')
			//判断是否需要节流
			if(this.isLoading) return
			//触底时页码自增+1
			this.queryObj.pagenum +=1
			//重新获取数据列表
			this.getPostsInfo()
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop
		},
		methods:{
			...mapMutations('m_user',['updateUserInfo','updateUserLogin','updateUserOpenId']),
			tabSelect(e) {
				this.TabCur = e.currentTarget.dataset.id;
				this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60
			},
			//发布动态按钮的事件
			sendPosts(e) {
				//如果未登录就跳出获取获取用户权限提示栏
				if(this.is_login !== 'true'){
					this.modalName = e.currentTarget.dataset.target
					return
				}
				//跳转到发布动态页面
				uni.navigateTo({
					url:'../../subpkg/sendPosts/sendPosts'
				})				
			},
			hideModal(e) {
				this.modalName = null
			},
			//获取用户信息
			getUserProfile(){
				this.modalName = null
				uni.getUserProfile({
					desc:'获取用户信息',
					 success:(res) => {
						//将用户信息本地化存储
						this.updateUserInfo(res.userInfo)
						//将用户登录信息本地化存储
						this.updateUserLogin(true)
						//获取用户openid
						uni.login({
						    success: (res) => {
								this.getOpenId(res.code)					
							}
						})
						//跳转到发布动态页面
						uni.navigateTo({
							url:'../../subpkg/sendPosts/sendPosts'
						})
					},
					fail: (e) => {
						if(e.errMsg === 'getUserProfile:fail auth deny')return uni.$showMsg('您取消了登录授权')
					}
				})
			},
			//发送请求到后端获取openid,并将数据存储到本地
			async getOpenId(code){
				const {data:res} = await uni.$http.get('/kivze/user/getOpenId/'+code)
				this.updateUserOpenId(res.msg)
				return
			},
			//发送get请求获取所有的动态信息
			async getPostsInfo(cb){
				//打开节流阀防止用户频繁请求
				this.isLoading = true
				//提示正在加载
				uni.showLoading({title:'正在加载！'})
				////发送请求获取数据
				const {data:res} = await uni.$http.get('/kivze/user/getNewPostsInfo',this.queryObj)
				if(res.flag !== true)return uni.$showMsg()
				//为数据赋值
				this.postsInfo = [...this.postsInfo,...res.data.postsInfoList]
				this.total = res.data.total
				//如果是下拉刷新事件的请求，则执行传入的方法
				cb && cb()
				//关闭节流阀
				this.isLoading = false
				//关闭提示
				uni.hideLoading()
			},
			//处理传入的时间参数
			timeFormat(date){
				//获取动态参数的时间
				let postTime = new Date(date);
				//获取动态参数的年月日
				let postDate = postTime.getFullYear()+'-'+(postTime.getMonth()+1)+'-'+postTime.getDay()
				
				//获取当前的系统时间
				let currTime = new Date();
				//获取当前系统的年月日
				let currDate = currTime.getFullYear()+'-'+(currTime.getMonth()+1)+'-'+currTime.getDay()
				
				//判断帖子是否是当天的
				if(postDate === currDate){
					//帖子是当天的，则判断时间是否是1小时以内
					if(postTime.getHours() === currTime.getHours()){
						//1小时以内返回信息为多少分钟前
						//5分钟以内显示刚刚
						if((currTime.getMinutes() - postTime.getMinutes()) < 5){
							return '刚刚'
						}else{
							return (currTime.getMinutes() - postTime.getMinutes())+'分钟前'
						}	
					}else{
						//返回多少小时前
						return (currTime.getHours() - postTime.getHours())+'小时前'
					}
				}else{
					return postDate
				}
			},
			//预览图片
			previewImage(imageUrlList) {
				//查看对应的图片
				uni.previewImage({
					urls:imageUrlList
				})
			},
			//返回顶部
			scrollToTop(){
				console.log("test")
				uni.pageScrollTo({
					scrollTop: 0,
				})
			},
			
		}
	}
</script>

<style lang="scss">
	.top-scroll-box{
		background-color: #1E90FF;
		color: white;
		font-size: 15px;
		height: 170rpx;
		width: 100%;
		position: sticky;
		top: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		padding-top: 30px;
		.top-btn{
			position: absolute;
			display: flex;
			align-items: center;
			width: 100px;
			height: 63px;
			padding-left: 15px;
			.top-btn-text{
				margin-left: 3px;
			}
		}
		.top-text{
			position: absolute;
			width: 100%;
			display: flex;
			justify-content: center;
		}
	}
	.top-body{
		width: 100%;
		height: 150rpx;
		background-color: #1E90FF;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 17px;
	}
	.reply-container{
		display: flex;
		align-items: center;
		justify-content: center;
		.reply-back{
			width: 320px;
			background-color: #F7F7F7;
			margin-top: -10px;
			margin-bottom: 10px;
			.reply-content{
				padding: 4px 10px;
				.replyUser-text{
					display: -webkit-box;	
					word-break: break-all;		
					-webkit-box-orient: vertical;					
					-webkit-line-clamp: 3;				
					overflow: hidden;					
					text-overflow: ellipsis;
					font-size: 15px;
					.replyUser{
						font-size: 13.5px;
						color: #424E75;
					}
					.semicolon{
						padding: 0 2px;
					}
				}
			}
			.replymore-content{
				display: flex;
				flex-direction: column;
				padding: 0 10px;
				margin-top: -10px;
				padding-bottom: 5px;
				.replymore-dots{
					font-size: 25px;
				}
				.replymore-icon{
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}
		
	}
	.userInfo-container{
		display: flex;
		width: 100%;
		.userInfo-body{
			height: 140upx;
			display: flex;
			align-items: center;
			padding-left: 15px;
			.userInfo-box{
				left: 146upx;
				padding-left: 10px;
				justify-content: space-around;
				.userInfo-name{
					font-size: 15px;
					padding-bottom: 5px;
				}
			}
		}
	}
	.round-click {
	  height: 120rpx;
	  width: 120rpx;
	  background-color: rgb(30, 144, 255);
	  border-radius: 100%;
	  position: fixed;
	  bottom: 50rpx;
	  right: 25rpx;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  z-index: 9;
	}
	

</style>
