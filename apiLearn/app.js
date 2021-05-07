var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressJwt = require('express-jwt')
var vertoken = require('./public/token');
// var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//跨域设置(所有域名)
app.all('*', function (req, res, next) {
  //其中*表示允许所有域可跨
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', '*');
  // res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});
app.use(logger('dev'));
// app.use(bodyParser.json());  //body-parser 解析json格式数据
// app.use(bodyParser.urlencoded({            //此项必须在 bodyParser.json 下面,为参数编码
//   extended: false
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressJwt({
  secret: 'mes_qdhd_mobile_xhykjyxgs',
  algorithms: ["HS256"]
}).unless({
  path: ['/login','/getCaptcha']  //白名单,除了这里写的地址，其他的URL都需要验证
}));
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // console.log(req)
  // var token = req.headers['authorization'];
  // console.log(token)
  // if (token == undefined) {
  //   return next();
  // } else {
  //   console.log(token)
  //   vertoken.verToken(token).then((data) => {
  //     console.log(data)
  //     req.data = data;
  //     return next();
  //   }).catch((error) => {
  //     return next();
  //   })
  // }
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({ code: -1, msg: 'token错误' });
    
  }else {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  }
});

module.exports = app;
