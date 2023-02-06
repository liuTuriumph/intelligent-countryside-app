import COS from "../utils/cos-wx-sdk-v5.js"

const getcos =function getCos() {
	  return new COS({
	    // ForcePathStyle: true, // 如果使用了很多存储桶，可以通过打开后缀式，减少配置白名单域名数量，请求时会用地域域名
	    getAuthorization: function (options, callback) {
	        // 异步获取临时密钥
	        uni.request({
	            url:  'https://www.kivze.top/kivze/user/getCosSecre',
	            data: {
	                bucket: options.Bucket,//固定写法
	                region: options.Region,//固定写法
	            },
	            dataType: 'json',
	            success: function (result) {
	                var data = result.data.data
	                var credentials =data.credentials;
	                if (!data || !credentials) return console.error('credentials invalid');
	                callback({
	                    TmpSecretId: credentials.tmpSecretId,
	                    TmpSecretKey: credentials.tmpSecretKey,
	                    XCosSecurityToken: credentials.sessionToken,
	                    // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
	                    StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
	                    ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000900
	                });
	            }
	        });
	    }
	});	
};
export default{
	getcos
}