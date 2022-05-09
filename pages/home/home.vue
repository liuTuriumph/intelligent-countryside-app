<template>
	<view>
		<!-- 背景区域 -->
		<view class="box-top">
		</view>
		<!-- 轮播图 -->
		<view class="box-swiper">
			<view class="swiper-container">
				<swiper :indicator-dots="true" :autoplay="true" :interval="5000" :duration="1000" :circular="true">
					<block v-for="(item,i) in swiperList" :key="i">
						<swiper-item>
							<view class="swiper-item">
								<image :src="item.image_src" ></image>
							</view>
						</swiper-item>
					</block>

				</swiper>
			</view>
		</view>
		<!-- 功能区域 -->
		<view class="box-function">
			<block v-for="(item,i) in homeImageList" :key="i">
				<view class="box-community">
					<!-- 标题区域 -->
					<view class="community-titile">
						<image class="title-icons" :src="item.image_src"></image>
						<text>{{item.name}}</text>
					</view>
					<!-- 功能按钮区域 -->					
					<view class="community-function">
						<block v-for="(item2,i2) in item.functionList" :key="i2">
							<view class="community-function-item">
								<image class="function-icons" :src="item2.image_src" @click="ToOtherBar(item2.id)"></image>
								<text>{{item2.name}}</text>
							</view>
						</block>
					</view>
				</view>		
			</block>		
		</view>
		
	</view>
</template>
 
<script>
	export default {
		data() { 
			return {
				swiperList:[],
				homeImageList:[],
			};
		},
		onLoad() {
			this.getSwiper()
			this.getHomeImage()
		},
		methods:{
			//获取轮播图数据
			async getSwiper(){
				const {data:res} = await uni.$http.get('/kivze/images/swiper')
				if(res.flag !== true){
					uni.$showMsg()
				}
				this.swiperList = res.data
			},
			//获取首页图片数据
			async getHomeImage(){
				const {data:res} = await uni.$http.get('/kivze/images/homeImage')
				if(res.flag !== true){
					uni.$showMsg()
				}
				this.homeImageList = res.data
			},
			//功能图片的点击跳转事件
			ToOtherBar(id){
				console.log(id);
			}
		}
	}
</script>

<style lang="scss">	
	.box-top{
		height: 250rpx;
		width: 100%;
		background-color: #1E90FF;
	}
	.swiper-item,
	image{
		width: 100%;
		height: 100%;
		border-radius: 20px;
	}
	swiper{
		height: 100%;
	}
	// 轮播图
	.box-swiper{
		display: flex;
		justify-content: center;
		height: 100px;
		.swiper-container{
			height: 340rpx;
			width: 660rpx;
			transform: translateY(-65%);
			border-radius: 20px;
			
			box-shadow: rgba(30, 144, 255, 0.5) 5px 10px 25px -5px;
		}
	}
	// 功能区
	.box-function{
		padding: 0 10px;
		.box-community{
			.community-titile{
				display: flex;
				align-items: center;
				
				font-size: 18px;
				font-weight: bold;
			}
			.community-function{
				display: flex;
				justify-content: space-around;
				align-items: center;
				margin-top: 20px;
				margin-bottom: 20px;
				.community-function-item{
					display: flex;
					flex-direction: column;
					justify-content: center;
					font-size: 14px;
					color: #A9A9A9;
				}
			}
			//标题图片
			.title-icons{
				width: 18px;
				height: 18px;
				margin-right: 5px;
			}
			//功能按钮图片
			.function-icons{
				width: 58px;
				height: 58px;
				margin-bottom: 15px;
				//box-shadow: ;
				box-shadow: rgba(30, 144, 255, 0.3) 0px 10px 20px -7px;
			}
		}
	}
	
</style>
