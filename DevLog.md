## HTTP
```
var http = require("http");

http.createServer(function(request, response){
  response.writeHeader(200, "Content-type: text/plain");
  response.end("hello!");
}).listen(8989);

console.log('Server running at http://127.0.0.1:8989/');
```

## Express

+ \__dirname：全局变量，存储的是文件所在的文件目录
+ \__filename：全局变量，存储的是文件名
