var PORT = 3001;
var http = require('http');
var qs = require('qs');

var TOKEN = 'jiangye';

function checkSignature(params, token){
//1.将token密钥、timestamp时间戳、 nonce随机数三个参数进行字典序排序
//2.将三个参数字符串拼接成一个字符串进行sha1加密
//3.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信


var key = [token, params.timestamp, params.nonce].sort().join('');
var sha1 = require('crypto').createHash('sha1');
sha1.update(key);
return sha1.digest('hex') == params.signature;

}

var server = http.createServer(function (request , response) {


//解析URL中的query部分，用qs模板（npm install qs）将query解析成json

	var query = require('url').parse(request.url).query;
	var params = qs.parse(query);

	console.log(params);
	console.log("token-->", TOKEN);

	if(checkSignature(params, TOKEN)){
		response.end(params.echostr);
	}else{
		response.end('signature fail');
	}
	});

server.listen(PORT);

console.log("Server running at port: " + PORT + ".");

