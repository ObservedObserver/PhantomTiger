var express = require("express");
var app = express();
app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + "/public/index.html")
});
app.get('/tesla',function(req, res){
  res.sendFile(__dirname + "/public/Tesla.html")
});
var server = app.listen(8018, function(){
  var host = server.address().address;
  var port = server.address().port;

  console.log(host,port);
})
