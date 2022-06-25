export default {
	//开启命名空间
	namespaced:true,
	
	//数据
	state:()=>({
		//用户信息
		userinfo: JSON.parse(uni.getStorageSync('userinfo') || '{}'),
		//判断用户是否已经登录
		is_login: uni.getStorageSync('is_login')||false,
		//用户的openid
		openid:JSON.parse(uni.getStorageSync('openid') || null),
		//用户的userid
		userid:JSON.parse(uni.getStorageSync('userid') || null),

	}),
	
	//方法
	mutations:{
		//获取用户信息
		getUserInfo(state){
			return state.userinfo
		},
		//更新用户信息
		updateUserInfo(state,userinfo){
			state.userinfo = userinfo
			
			this.commit('m_user/saveUserInfoToStorage')
		},
		//将用户信息持久化存储到本地
		saveUserInfoToStorage(state){
			uni.setStorageSync('userinfo',JSON.stringify(state.userinfo))
		},
		//更新用户登录信息
		updateUserLogin(state,is_login){
			state.is_login = is_login
			
			this.commit('m_user/saveUserLoginToStorage')
		},
		//将用户登录信息持久化存储到本地
		saveUserLoginToStorage(state){
			uni.setStorageSync('is_login',JSON.stringify(state.is_login))
		},
		//更新用户openid
		updateUserOpenId(state,openid){
			state.openid = openid
			this.commit('m_user/saveUserOpenIdToStorage')
		},
		//将用户openid持久化存储到本地
		saveUserOpenIdToStorage(state){
			uni.setStorageSync('openid',JSON.stringify(state.openid))
		},
		//更新用户userid
		updateUserId(state,userid){
			state.userid = userid
			this.commit('m_user/saveUserIdToStorage')
		},
		//将用户userid持久化存储到本地
		saveUserIdToStorage(state){
			uni.setStorageSync('userid',JSON.stringify(state.userid))
		},
		
	},
	
	//数据包装器
	getters:{
	},
}