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
							<view class="cu-avatar round lg" :style="'background-image:url(' + item.faceImage + ');'">
							</view>
							<view class="userInfo-box">
								<view class="userInfo-name">{{item.nickName}}</view>
								<view class="text-gray text-sm flex justify-between">
									{{timeFormat(item.time)}}
								</view>
							</view>
						</view>
					</view>
					<!-- 用户动态文字区域 -->
					<view class="text-content" style="font-size: 30rpx;">
						{{item.content}}
					</view>
					<!-- 用户动态图片区域 -->
					<view class="grid flex-sub padding-lr"
						:class="item.imagesList.length > 1 ?'col-3 grid-square':'col-1'">
						<view class="bg-img" :class="item.imagesList.length > 1 ?'':'only-img'"
							v-for="(item2,i2) in item.imagesList" :style="'background-image:url('+item2+');'" :key="i2"
							@click.stop="previewImage(item.imagesList)">
					 	</view>
					</view>
					<!-- 转发数，点赞数，回复数 -->				
					<view class="posts-functuon-box">
						<button class="share-btn" open-type="share" :data-index="i1" :data-shareCount="item.countList.shareCount" :data-id="item.id">
							<text class="cuIcon-forwardfill margin-lr-xs"></text> 
							<block v-if="item.countList.shareCount == 0">
								转发							
							</block>
							<block v-else-if="item.countList.replyCount > 100">
								100+							
							</block>
							<block v-else>
								{{item.countList.shareCount}}
							</block>
						</button>
						<button class="share-btn" >
							<text class="cuIcon-appreciatefill margin-lr-xs"></text> 
							<block v-if="item.countList.prizeCount == 0">
								点赞							
							</block>
							<block v-else-if="item.countList.replyCount > 100">
								100+							
							</block>
							<block v-else>
								{{item.countList.prizeCount}}
							</block>	
						</button>
						<button class="share-btn" @click="showReplyConten(item,i1)" >
							<text class="cuIcon-messagefill margin-lr-xs" ></text> 
							<block v-if="item.countList.replyCount == 0">
								回复							
							</block>
							<block v-else-if="item.countList.replyCount > 100">
								100+							
							</block>
							<block v-else>
								{{item.countList.replyCount}}
							</block>
						</button>
					</view>
					<!-- 简略回复区域 -->
					<view class="reply-container" @click="showReplyConten(item,i1)" v-if="item.replyList !== undefined && item.replyList.length>0">
						<view class="reply-back">
							<block v-for="(item2,index2) in item.replyList.slice(0,2)" :key="index2">
								<view class="reply-content">
									<text class="replyUser-text">
										<text class="replyUser">{{item2.nickName}}</text>
										<text class="semicolon">:</text>
										{{item2.content}}
									</text>
								</view>
							</block>
							<!-- 当超出两条评论 -->
							<view class="replymore-content" v-if="item.replyList.length > 2">
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
		<!-- 回复的弹出框 -->
		<view>
			<u-popup :show="show" :round="15" @close="close" @open="open" :closeable="closeable" mode="bottom">
				<view class="u-popup-slot" :style="'height:'+boxHeight+'px;'">
					<view class="slot-title">
						<text>{{replyCount}}条评论</text>
					</view>
					<view class="slot-posts-reply" :style="'height:'+(boxHeight-100)+'px;'">
						<scroll-view :scroll-top="scrollTop1" 
						scroll-y="true" 
						:style="'height:'+(boxHeight-100)+'px;'"
						@scroll="scroll">
							<block v-for="(item,index) in postItemInfo.replyList" :key="index">
								<view  class="scroll-view-item ">
									<!-- 主要评论 -->
									<view class="scroll-view-item-main">
										<!-- 回复者头像 -->
										<image :src="item.faceImage" class="scroll-view-item-image" mode="widthFix" />
								
										<!-- 姓名和回复内容 -->
										<view class="scroll-view-item-name-content" @click="replyMain(item)">
											<view class="scroll-view-item-name">
												<text>{{item.nickName}}</text>
											</view>
											<view class="scroll-view-item-content">
												<text>{{item.content}}</text>
											</view>
											<!-- 分隔线 -->
											<u-line margin="30rpx 0 30rpx 0 "></u-line>
										</view>
									</view>
									<block v-for="(item2,index2) in item.childReplyList" :key="index2">
										<!-- 回复主要评论 -->
										<view id="demo1" class="scroll-view-item-follow" @click="replyChild(item2,item.id)">
											<!-- 回复者头像 -->
											<image :src="item2.faceImage" class="scroll-view-item-image" mode="widthFix" />
																		
											<!-- 姓名和回复内容 -->
											<view class="scroll-view-item-name-content">
												<view class="scroll-view-item-name" v-if="item2.toNickName === null">
													<text>{{item2.nickName}}</text>
												</view>
												<view class="scroll-view-item-name" v-if="item2.toNickName !== null">
													<text>{{item2.nickName}}</text>
													<text class="scroll-view-item-name-text" style="color: black;margin:0 5px;font-weight: normal;">回复</text>
													<text>{{item2.toNickName}}</text>											
												</view>
												<view class="scroll-view-item-content">
													<view class="scroll-view-item-content-test">
														<text>{{item2.content}}</text>
													</view>
													
												</view>
												<!-- 分隔线 -->
												<u-line margin="30rpx 0 30rpx 0 "></u-line>
											</view>
										</view>
									</block>	
									
								</view>
							</block>
							

						</scroll-view>
					</view>

				</view>
				<!-- 底部回复栏 -->
				<view class="slot-user-reply" :style="'bottom:'+bottom+'px'">
					<!-- 用户头像 -->
					<image class="slot-uer-reply-image" :src="userinfo.avatarUrl" mode="aspectFill" />
					<!-- 输入框 -->
					<view class="slot-uer-reply-input">
						<u--input @focus="onFocus" @blur="onBlur"  :adjustPosition="false"  :placeholder="inputPlaceholder" border="bottom" v-model="value" clearable></u--input>
					</view>
					<!-- 发表按钮 -->
					<view class="slot-uer-reply-btn">
						<u-button type="primary" text="发表" size="normal" @tap="userReply()"></u-button>
					</view>
				</view>
			</u-popup>
		</view>
		
	</view>
</template>

<script>
	import {
		mapMutations,
		mapState
	} from 'vuex'
	export default {
		data() {
			return {
				TabCur: 0,
				scrollLeft: 0,
				modalName: null,
				is_login: false,
				//保存动态信息
				postsInfo: [],
				//节流阀标志，防止用户频繁请求
				isLoading: false,
				//分页请求数据
				queryObj: {
					//页码值
					pagenum: 1,
					//每页显示多少条数据
					pagesize: 5
				},
				//总数量，用于分页
				total: 0,
				scrollTop: 0,
				//用于控制弹出层
				show: false,
				closeable: true,
				boxHeight: 0,
				//验证是否授权功能用来判断是否是回复框的标识
				replyFlag: false,
				//回复框的值
				value: '',
				//滚动栏
				scrollTop1: 0,
				old: {
					scrollTop1: 0,
				},
				//回复对象的openid和NickName
				toOpenid: '',
				toNickName:'',
				//用户点击的帖子的贴主信息
				postItemInfo: '',
				//用户点击的帖子的下标
				postItemInfoIndex:null,
				//回复框的提示信息
				inputPlaceholder:"请输入内容",
				//回复事件的相关参数
				replyId:'',
				replyType:true,
				//输入框底部距离
				bottom:0,
				//动态的帖子数量
				replyCount:0,
			};
		},
		computed: {
			...mapState('m_user', ['userinfo', 'openid']),
		},
		onShow() {
			this.is_login = uni.getStorageSync('is_login')
		},
		onLoad() {
			this.getPostsInfo()
			// 可用高度 = 屏幕高度 - navigationBar高度 - tabBar高度 - 自定义的search组件高度
			const sysInfo = uni.getSystemInfoSync()
			this.boxHeight = sysInfo.windowHeight / 2 + 100
			this.onFocus()
		},
		//下拉刷新事件
		onPullDownRefresh() {
			//重置数据
			this.queryObj.pagenum = 1
			this.total = 0
			this.isLoading = false
			this.postsInfo = []
			
			//重新获取数据,并手动关闭下拉事件
			this.getPostsInfo(() => {
				uni.stopPullDownRefresh()
			})
		},
		//触底事件
		onReachBottom() {
			//到最后一页的时候，停止请求并提示
			if (this.queryObj.pagenum * this.queryObj.pagesize >= this.total)
				return uni.$showMsg('数据加载完毕！')
			//判断是否需要节流
			if (this.isLoading) return
			//触底时页码自增+1
			this.queryObj.pagenum += 1
			//重新获取数据列表
			this.getPostsInfo()
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop
		},
		methods: {
			...mapMutations('m_user', ['updateUserInfo', 'updateUserLogin', 'updateUserOpenId']),
			tabSelect(e) {
				this.TabCur = e.currentTarget.dataset.id;
				this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60
			},
			//发布动态按钮的事件
			sendPosts(e) {
				//如果未登录就跳出获取获取用户权限提示栏
				if (this.is_login !== 'true') {
					this.modalName = e.currentTarget.dataset.target
					return
				}
				//跳转到发布动态页面
				uni.navigateTo({
					url: '../../subpkg/sendPosts/sendPosts'
				})
			},
			hideModal(e) {
				this.replyFlag = false
				this.modalName = null
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
						if (this.replyFlag !== true) {
							//跳转到发布动态页面
							uni.navigateTo({
								url: '../../subpkg/sendPosts/sendPosts'
							})
						} else {
							this.show = true
						}
					},
					fail: (e) => {
						this.replyFlag = false
						if (e.errMsg === 'getUserProfile:fail auth deny') return uni.$showMsg('您取消了登录授权')

					}
				})
			},
			//发送请求到后端获取openid,并将数据存储到本地
			async getOpenId(code) {
				const {
					data: res
				} = await uni.$http.get('/kivze/user/getOpenId/' + code)
				this.updateUserOpenId(res.msg)
				return
			},
			//发送get请求获取所有的动态信息
			async getPostsInfo(cb) {
				//打开节流阀防止用户频繁请求
				this.isLoading = true
				//提示正在加载
				uni.showLoading({
					title: '正在加载！'
				})
				//发送请求获取数据
				const {
					data: res
				} = await uni.$http.get('/kivze/user/getNewPostsInfo', this.queryObj)
				if (res.flag !== true) return uni.$showMsg()			
				//为数据赋值
				this.postsInfo = [...this.postsInfo, ...res.data.postsInfoList]
				//为数据添加回复数据字段
				this.postsInfo.forEach(async (item, index) => {
					const replyList = await this.getReply(item.id)
					//为父级回复添加子级回复字段
					replyList.forEach(async (item2,index2)=>{
						const childReplyList = await this.getChildReply(item2.id)
						this.$set(item2, 'childReplyList', childReplyList)
					})
					
					this.$set(item, 'replyList', replyList)	
				})
				this.total = res.data.total
				//获取帖子的点赞、转发和评论数
				this.postsInfo.forEach(async(item,index) => {
					const countList = await this.getPostsFunctionCount(item.id)
					this.$set(item,"countList",countList)
				})
				
				//如果是下拉刷新事件的请求，则执行传入的方法
				cb && cb()
				//关闭节流阀
				this.isLoading = false
				//关闭提示
				uni.hideLoading()
			},
			//根据传入的数据更新帖子的回复数
			async updateReplyCount(postId,replyCount){
				const {data:res} = await uni.$http.put("/kivze/user/updateReplyCount/"+postId+"/"+replyCount)
				if (res.flag === false) {
					uni.$showMsg('操作错误，请重试。')
					return
				}
			},
			//根据id获取帖子的点赞、转发和评论数
			async getPostsFunctionCount(postId){
				const { data:res } = await uni.$http.get("/kivze/user/getPostsFunctionCount/"+postId)
				if (res.flag === false) {
					uni.$showMsg('查询错误，请重试。')
					return
				}
				return res.data
			},
			//处理传入的时间参数
			timeFormat(date) {
				//获取动态参数的时间
				let postTime = new Date(date);
				//获取动态参数的年月日
				let postDate = postTime.getFullYear() + '-' + (postTime.getMonth() + 1) + '-' + postTime.getDay()

				//获取当前的系统时间
				let currTime = new Date();
				//获取当前系统的年月日
				let currDate = currTime.getFullYear() + '-' + (currTime.getMonth() + 1) + '-' + currTime.getDay()

				//判断帖子是否是当天的
				if (postDate === currDate) {
					//帖子是当天的，则判断时间是否是1小时以内
					if (postTime.getHours() === currTime.getHours()) {
						//1小时以内返回信息为多少分钟前
						//5分钟以内显示刚刚
						if ((currTime.getMinutes() - postTime.getMinutes()) < 5) {
							return '刚刚'
						} else {
							return (currTime.getMinutes() - postTime.getMinutes()) + '分钟前'
						}
					} else {
						//返回多少小时前
						return (currTime.getHours() - postTime.getHours()) + '小时前'
					}
				} else {
					return postDate
				}
			},
			//预览图片
			previewImage(imageUrlList) {
				//查看对应的图片
				uni.previewImage({
					urls: imageUrlList
				})
				this.updateReplyCount(30,2)
			},
			//返回顶部
			scrollToTop() {
				uni.pageScrollTo({
					scrollTop: 0,
				})
			},
			//点击回复栏查看事件
			showReplyConten(item,i1) {
				//查看回复栏时，收集该动态的信息
				//收集下标用于回复时刷新
				this.postItemInfo = item
				this.postItemInfoIndex= i1
				//将上一个动态查询的帖子数量清零
				this.replyCount = 0
				//计算该动态的帖子数量
				item.replyList.forEach((item2,index)=>{
					this.replyCount = this.replyCount + item2.childReplyList.length
				})
				this.replyCount = this.replyCount + item.replyList.length
				//修改回复栏信息，保证回复是父级评论
				this.replyId = item.id
				this.replyType= true
				this.toOpenid = item.openid
				//判断是否授权
				if (this.is_login !== 'true') {
					this.modalName = 'DialogModal1'
					this.replyFlag = true
					return
				}
				this.show = true
			},
			//评论框的弹出事件
			open() {
				//查看评论前获取用户信息和权限
				uni.hideTabBar({
					animation: true
				})

			},
			//评论框的关闭事件
			close() {
				this.show = false
				uni.showTabBar({
					animation: true
				})
			},
			scroll: function(e) {
				//console.log(e)
				this.old.scrollTop1 = e.detail.scrollTop1
			},
			//回复功能的事件
			async userReply() {
				if (this.value == '' || this.value == null) {
					uni.$showMsg("内容不能为空")
					return
				}
				const reply = {			
					postId: this.postItemInfo.id,
					replyId: this.replyId,
					replyType: this.replyType,
					openid: this.openid,
					nickName: this.userinfo.nickName,
					faceImage: this.userinfo.avatarUrl,
					content: this.value,
					toOpenid: this.toOpenid,
					toNickName: this.toNickName,
					time: Date.now()
				}
				const res = await uni.$http.post('/kivze/user/addPostsReply', reply)
				if (res.statusCode !== 200) {
					uni.$showMsg("回复失败，请重试")
					return
				}
				uni.$showMsg("回复成功")
				//更新帖子回复数，回复加一
				this.updateReplyCount(this.postItemInfo.id,this.postItemInfo.countList.replyCount+1)
				//回复成功清空信息，并回复到主要回复阶段
				this.value = null
				this.inputPlaceholder="请输入内容"
				//修改回复栏信息，保证回复是父级评论
				this.toOpenid = this.postItemInfo.openid
				this.toNickName = null
				this.replyId = this.postItemInfo.id
				this.replyType = true
				//回复刷新前，将原有的postsInfo清空，防止旧数据与新刷新数据拼接出现重复
				//重置数据
				this.queryObj.pagenum = 1
				this.total = 0
				this.isLoading = false
				this.postsInfo = []
				//重新获取评论更新后的postsInfo，并将原本的postItemInfo也更新
				await this.getPostsInfo()
				this.postItemInfo = this.postsInfo[this.postItemInfoIndex]
				//该帖子回复数加1
				this.replyCount++
			},
			//根据动态的id查询该动态对应的回复信息
			async getReply(postId) {
				const {
					data: res
				} = await uni.$http.get('/kivze/user/getReply/' + postId)
				if (res.flag === false) {
					uni.$showMsg('查询错误，请重试。')
					return
				}
				return res.data
			},
			//根据父级评论的id查询对应的子级评论
			async getChildReply(replyId){
				const{data:res} = await uni.$http.get('/kivze/user/getChildReply/'+replyId)
				if (res.flag === false) {
					uni.$showMsg('查询错误，请重试。')
					return
				}
				return res.data
			},
			//回复父级评论，即添加子级评论
			async replyMain(item){
				this.inputPlaceholder='回复:'+item.nickName
				this.replyId=item.id
				this.replyType=false
				this.toOpenid=item.openid
				this.toNickName = null
			},
			//回复子级评论
			async replyChild(item,replyId){
				this.inputPlaceholder='回复:'+item.nickName
				this.replyId=replyId
				this.replyType=false
				this.toOpenid=item.openid
				this.toNickName =item.nickName
			},
			//弹出框中的输入框的焦点事件
			onFocus(){
				//用户弹出键盘时，输入框上移
				uni.onKeyboardHeightChange(res =>{
					this.bottom = res.height
				})				

			},
			//弹出框中的输入框的失焦事件
			onBlur() {
				this.bottom = 0
			},
			//分享转发帖子的功能
			onShareAppMessage(event){
				var index = event.target.dataset.index
				var id = event.target.dataset.id
				var shareCount = event.target.dataset.sharecount
				var shareObj = {
					title:this.postsInfo[index].content,
					imageUrl:"/static/shareImage2.jpg",
					path:'subpkg/postsDetail/postsDetail?id='+id,
				}
				return shareObj
			}

		}
	}
</script>

<style lang="scss">
	//当滚动到一定位置，显示缩略的标题栏
	.top-scroll-box {
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

		.top-btn {
			position: absolute;
			display: flex;
			align-items: center;
			width: 100px;
			height: 63px;
			padding-left: 15px;

			.top-btn-text {
				margin-left: 3px;
			}
		}

		.top-text {
			position: absolute;
			width: 100%;
			display: flex;
			justify-content: center;
		}
	}
	//顶部标题栏
	.top-body {
		width: 100%;
		height: 150rpx;
		background-color: #1E90FF;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 17px;
	}
	
	//用户头像区域
	.userInfo-container {
		display: flex;
		width: 100%;
	
		.userInfo-body {
			height: 140upx;
			display: flex;
			align-items: center;
			padding-left: 15px;
	
			.userInfo-box {
				left: 146upx;
				padding-left: 10px;
				justify-content: space-around;
	
				.userInfo-name {
					font-size: 15px;
					padding-bottom: 5px;
				}
			}
		}
	}
	
	//简略回复区域
	.reply-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		.reply-back {
			width: 640rpx;
			background-color: #F7F7F7;
			margin-top: -10px;
			margin-bottom: 10px;

			.reply-content {
				padding: 8rpx 20rpx;

				.replyUser-text {
					display: -webkit-box;
					word-break: break-all;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 3;
					overflow: hidden;
					text-overflow: ellipsis;
					font-size: 15px;

					.replyUser {
						font-size: 13.5px;
						color: #424E75;
					}

					.semicolon {
						padding: 0 2px;
					}
				}
			}

			.replymore-content {
				display: flex;
				flex-direction: column;
				padding: 0 10px;
				margin-top: -10px;
				padding-bottom: 5px;

				.replymore-dots {
					font-size: 25px;
				}

				.replymore-icon {
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}

	}
	
	//观看数，点赞数，回复数功能栏
	.posts-functuon-box{
		display: flex;
		height: 80rpx;
		float: right;
		padding-right: 20rpx;
		
		//分享按钮
		.share-btn[plain]{
			border: 0;
		}
		.share-btn::after{
			border: none;
		}
		.share-btn{
			font-size: 28rpx;
			height: 20rpx;
			background-color: white;
			color: #AAAAAA;	
			overflow: visible;
			padding: 0px 8rpx;		
		}
		.share-btn text{
			margin-right: 4rpx;	
		}
	}

	//发布动态按钮
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

	/* 回复弹出框的样式 */
	.u-popup-slot {
		width: 100%;
		display: flex;
		flex-direction: column;

		/* 回复框的顶部标题 */
		.slot-title {
			border-top-right-radius: 15px;
			border-top-left-radius: 15px;
			height: 50px;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
			font-size: 15px;
		}

		/* 回复框的主体区域 */
		.slot-posts-reply {
			width: 100%;
			padding: 0 20rpx;

			/* 回复项 */
			.scroll-view-item {
				width: 100%;
				display: flex;
				align-items: center;
				flex-direction: column;

				/* 主要评论 */
				.scroll-view-item-main {
					width: 100%;
					display: flex;
					

					/* 头像 */
					.scroll-view-item-image {
						border-radius: 100%;
						width: 120rpx;
						height: 120rpx;
					}

					/* 姓名和回复内容 */
					.scroll-view-item-name-content {
						width: 100%;
						display: flex;
						flex-direction: column;
						margin-left: 15rpx;

						.scroll-view-item-name {
							display: flex;
							font-size: 35rpx;
							color: #1E90FF;
							font-weight: bold;
							
						}

						.scroll-view-item-content {
							margin-top: 10rpx;
							width: 100%;
							font-size: 30rpx;
							font-weight: bold;						
						}
					}
				}

				/* 回复主要评论 */
				.scroll-view-item-follow {
					margin-left: auto;
					right: 0;
					width: 90%;
					display: flex;
					

					/* 头像 */
					.scroll-view-item-image {
						border-radius: 100%;
						width: 120rpx;
						height: 120rpx;
					}

					/* 姓名和回复内容 */
					.scroll-view-item-name-content {
						width: 100%;
						display: flex;
						flex-direction: column;
						margin-left: 15rpx;

						.scroll-view-item-name {
							font-size: 35rpx;
							color: #1E90FF;
							font-weight: bold;
						}

						.scroll-view-item-content {
							margin-top: 10rpx;
							width: 100%;
							font-size: 30rpx;
							font-weight: bold;
							word-wrap: break-word;
							word-break: break-all;
							white-space: pre-line;

						}
					}
				}

			}
		}

	}

	//回复框底部回复栏
	.slot-user-reply {
		background-color: white;
		height: 100rpx;
		//background-color: aqua;
		position: fixed;
		width: 100%;
		box-shadow: 0px 10px 10px 10px rgba(0, 0, 0, 0.35);
		display: flex;
		align-items: center;
		justify-content: space-around;

		.slot-uer-reply-image {
			border-radius: 100%;
			width: 70rpx;
			height: 70rpx;

		}

		.slot-uer-reply-input {
			width: 230px;
			margin-left: -10px;
		}

	}
	
</style>
