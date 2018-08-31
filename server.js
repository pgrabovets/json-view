var express = require('express');
var app = express();

app.use(express.static('src'));

app.listen(3000, function () {
  console.log('Static server app listening at localhost:3000');
});
