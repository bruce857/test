const express=require('express');
//引入用户路由器
const proRouter=require('./router/pro.js');
const proRouter2=require('./router/pro2.js');

//引入body-parser中间件模块
const bodyParser=require('body-parser');
//创建WEB服务器
const app=express();
//设置端口
app.listen(3000);
//托管静态资源到public目录
//引入跨域管理模块
const cors = require("cors");
//配置允许跨域程序
app.use(cors({
	 origin:["http://127.0.0.1:8080","http://localhost:8080"]
}))


app.use( express.static('public') );
//使用body-parser中间件，将post请求的数据解析为对象
app.use(bodyParser.urlencoded({
  extended:false
}));
const session = require("express-session");
app.use(session({
    name: 'session-id',
    secret: '12345-67890',
    saveUninitialized: true,
    resave: false
}))

//注意这几句一定在最下面
app.use('/pro',proRouter);
app.use('/pro2',proRouter2);

//alter table xz_user add pic varchar(255) not null default '';