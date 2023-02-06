<template>
		<view>
			<u-popup :show="show" 
			:round="10" 
			@close="close" 
			@open="open" 
			:closeable="closeable" 
			mode="bottom"
			>
				<view class="u-popup-slot" :style="'height:'+boxHeight+'px;'">
					<view class="slot-title">
						
					</view>
					<view class="slot-posts-reply" :style="'height:'+(boxHeight-50)+'px;'">
						
					</view>
					
				</view>
				<view class="slot-user-reply">
					
				</view>
			</u-popup>
			<u-button @click="show = true">打开</u-button>
			
			<scroll-view :scroll-top="scrollTop1" scroll-y="true" class="scroll-Y" @scrolltoupper="upper"
								@scrolltolower="lower" @scroll="scroll" >
								<view id="demo1" class="scroll-view-item uni-bg-red">A</view>
								<view id="demo2" class="scroll-view-item uni-bg-green">B</view>
								<view id="demo3" class="scroll-view-item uni-bg-blue">C</view>
			</scroll-view>

		</view>

</template>

<script>
	export default {
		data() {
			return {
				show: false,
				closeable:true,
				boxHeight:0,
				scrollTop: 0,
				old: {
					scrollTop: 0
				},
			};
		},
		onLoad() {
			// 可用高度 = 屏幕高度 - navigationBar高度 - tabBar高度 - 自定义的search组件高度
			const sysInfo = uni.getSystemInfoSync()
			this.boxHeight = sysInfo.windowHeight/2+100
		},
		methods: {
			open() {
				console.log('open');
			},
			close() {
				this.show = false
				// console.log('close');
			},
			upper: function(e) {
				console.log(e)
			},
			lower: function(e) {
				console.log(e)
			},
			scroll: function(e) {
				console.log(e)
				this.old.scrollTop = e.detail.scrollTop
			},
			goTop: function(e) {
				// 解决view层不同步的问题
				this.scrollTop = this.old.scrollTop
				this.$nextTick(function() {
					this.scrollTop = 0
				});
				uni.showToast({
					icon: "none",
					title: "纵向滚动 scrollTop 值已被修改为 0"
				})
			}
			
		}
	}
	
</script>

<style lang="scss">
	.posts-functuon-box{
		float: right;
	}
	.share-btn{
		background-color: red;
		width: 100rpx;
		padding: 20rpx 25rpx;
	}
	.u-popup-slot{
		width: 100%;
		display: flex;
		flex-direction: column;
		.slot-title{
			height: 50px;
			width: 100%;
			background-color: green;
		}
		.slot-posts-reply{
			background-color: red;
			width: 100%;
		}
		
	}
	.slot-user-reply{
		height: 50px;
		background-color: aqua;
		position: absolute;
		width: 100%;
		bottom: 0;
	}
	.scroll-Y {
		height: 500rpx;
	}
	.scroll-view-item {
		height: 500rpx;
		line-height: 500rpx;
		text-align: center;
		font-size: 36rpx;
	}
	
</style>
