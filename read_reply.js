/**
 * Created by lenovo on 2016/4/15.
 */
/**
 这个例子演示从微信服务接收到消息并回复一段文字
 */

var PORT = 3001;
var http = require('http');
var qs = require('qs');

var TOKEN = 'jiangye';

function checkSignature(params, token){
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    //2. 将三个参数字符串拼接成一个字符串进行sha1加密
    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信

    var key = [token, params.timestamp, params.nonce].sort().join('');
    var sha1 = require('crypto').createHash('sha1');
    sha1.update(key);

    return  sha1.digest('hex') == params.signature;
}

var server = http.createServer(function (request, response) {

    //解析URL中的query部分，用qs模块(npm install qs)将query解析成json
    var query = require('url').parse(request.url).query;
    var params = qs.parse(query);

    if(!checkSignature(params, TOKEN)){
        //如果签名不对，结束请求并返回
        response.end('signature fail');
        return;
    }


    if(request.method == "GET"){
        //如果请求是GET，返回echostr用于通过服务器有效校验
        response.end(params.echostr);
    }else{
        //否则是微信给开发者服务器的POST请求
        var postdata = "";

        request.addListener("data",function(postchunk){
            postdata += postchunk;
        });

        //获取到了POST数据
        request.addListener("end",function(){
            var parseString = require('xml2js').parseString;

            parseString(postdata, function (err, result) {
                if(!err){
                   // if(msg.xml.MsgType[0] == 'text') {
                        var res = replyText(result, '已收到您的消息~');
                        response.end(res);
                  //  }
                    /* if(msg.xml.MsgType[0] == 'image'){
                        var res = replyText(result, '我收到图片了');
                        response.end(res);
                    }
                    //messages.js里面：
                    /*
                     我们将XML数据通过xml2js模板(npm install xml2js)解析成json格式
                     console.log(result);
                     response.end('success');
                     */
                }
            });
        });
    }
});

server.listen(PORT);

console.log("Server runing at port: " + PORT + ".");

function replyText(msg, reply){
    //当发过来的东西上文字的时候
    if(msg.xml.MsgType[0] !== 'text') {
        return '';
    }

        console.log(msg);
        console.log(reply);

        //将要返回的消息通过一个简单的tmpl模板（npm install tmpl）返回微信
        var tmpl = require('tmpl');
        var replyTmpl = '<xml>' +
            '<ToUserName><![CDATA[{toUser}]]></ToUserName>' +
            '<FromUserName><![CDATA[{fromUser}]]></FromUserName>' +
            '<CreateTime><![CDATA[{time}]]></CreateTime>' +
            '<MsgType><![CDATA[{type}]]></MsgType>' +
            '<Content><![CDATA[{content}]]></Content>' +
            '</xml>';

        return tmpl(replyTmpl, {
            toUser: msg.xml.FromUserName[0],
            fromUser: msg.xml.ToUserName[0],
            type: 'text',
            time: Date.now(),
            content: reply
        });

  /*  //当发过来的东西是图片的时候
    if(msg.xml.MsgType[0] == 'image') {
        console.log(msg);
        //将要返回的消息通过一个简单的tmpl模板（npm install tmpl）返回微信
        var tmpl = require('tmpl');
        var replyTmpl = '<xml>' +
            '<ToUserName><![CDATA[{toUser}]]></ToUserName>' +
            '<FromUserName><![CDATA[{fromUser}]]></FromUserName>' +
            '<CreateTime><![CDATA[{time}]]></CreateTime>' +
            '<MsgType><![CDATA[{type}]]></MsgType>' +
            '<Image>'+
            '<MediaId>6273978279635479566</MediaId>'+
           // '<MediaId><![CDATA[{media_id}]]></MediaId>' +
            '</Image>'
            '</xml>';

        return tmpl(replyTmpl, {
            toUser: msg.xml.FromUserName[0],
            fromUser: msg.xml.ToUserName[0],
            type: 'image',
            time: Date.now(),



});
    }
    */
}
