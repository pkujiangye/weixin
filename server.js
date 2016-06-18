var http = require('http');
var fs = require('fs');
var server = http.createServer(function (request,response) {
    response.writeHead(200,{'Content-Type':'text/html'});
    var rs = fs.createReadStream(__dirname + '/index.html');
    rs.pipe(response);
    rs.on('end',function () {

        response.end();
    })
}).listen(3002);
console.log('server running at port 3002');
