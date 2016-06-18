var PORT = 3001;
var http = require('http');
var qs = require('qs');

var TOKEN = 'jiangye';

function checkSignature(params, token){
//1.将token、timestamp、 nonce三个参数进行字典序排序
//2.将三个参数字符串拼接成一个字符串进行sha1加密
//3.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信


var key = [token, params.timestamp, params.nonce].sort().join('');
var sha1 = require('crypto').createHash('sha1');
sha1.update(key);

return sha1.digest('hex') == params.signature;

}

var server = http.createServer(function (request , response) {
	var query = require('url').parse(request.url).query;
	var params = qs.parse(query);

	if (!checkSignature(params, TOKEN)) {
		//如果签名不对， 结束请求并返回
		response.end('signature fail');
		return;
	}

	if (request.method == "GET") {
		//如果请求是GET，返回echostr用于通过服务器有效校验
		response.end(params.echostr);
	} else {
		//否则是微信给开发者服务器的POST请求
		var postdata = "";

		request.addListener("data", function (postchunk) {
			postdata += postchunk;
		});

		//获取到了POST数据
		request.addListener("end", function () {
			var parseString = require('xml2js').parseString;

			parseString(postdata, function (err, result) {
				if (!err) {
					//我们将XML数据通过xml2js模板(npm install xml2js)解析成json格式
					console.log(result);
					response.end('success');
				}
			});
		});
	}
});


	server.listen(PORT);
	console.log("Server runing at port: " + PORT + ".");