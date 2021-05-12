const express=require('express');
//引入连接池模块
const pool=require('../pool.js');
//创建路由器对象
const r=express.Router();


//第三方图形验证码模块:
//下载  npm i svg-captcha
const svgCaptcha = require('svg-captcha');


//所有图形验证,服务器node一个程序出生一张图
r.get('/v1/code',(req, res)=>{

	//第一个版本:图形类型的验证码
	// const cap = svgCaptcha.create({
	// 		// 翻转颜色
	// 		inverse: false,
	// 		// 字体大小
	// 		fontSize: 36,
	// 		// 噪声线条数
	// 		noise: 3,
	// 		// 宽度
	// 		width: 80,
	// 		// 高度
	// 		height: 30,
	// 		//是否是彩色
	// 		color:true,
	// 		ignoreChars:"0o1i",
	// 		size:4,//验证码长度
	// 	});
	
	//第二个版本:算术计算
	const cap = svgCaptcha.createMathExpr({
		fontSize: 45,
		mathMin:1,
		mathMax:9,
		mathOperator:"+-",
		width: 110,
	    height: 45,
		color:true,
	})	
	req.session.captcha = cap.text; // session 存储验证码数值
	//console.log(req.session)
	res.type('svg'); // 响应的类型
	res.send(cap.data)
  });




//1.登录模块
//http://127.0.0.1:8080/pro2/v1/login
r.post("/v1/login",(req,res)=>{
	//获取用户输入验证码
    var code = req.body.code;
	//console.log(code,req.session.captcha)
	//与系统验证 和用户输入验证码比较
	if(code != req.session.captcha){
      res.send("-1");    //不一样返回-1验证码输入错误
	  return;
	}


	if(req.session.auth){
		res.send("1");
		return;
	}
	var _uname=req.body.uname;
	var _upwd=req.body.upwd;
	var sql="select * from xz_user where uname=? and upwd=?";
	pool.query(sql,[_uname,_upwd],(err,result)=>{
		if(err) throw err;
		if(result.length>0){
			req.session.auth = true;
			res.send("1");//登录成功
		}else{
			req.session.auth = false;
			res.send("0");//登录失败
		}
	});
});
//2.查询用户列表--分页查询
r.get("/v1/list",(req,res)=>{
	if(!req.session.auth){
		res.send({code:0,msg:"未登录"});
		return;
	}
	var page = parseInt(req.query.page);//页码 1 2 3 4 ...
	var pageSize = 3;                   //一页几行
	if(!page){
       page = 1;                       //默认第一页
	}
	var sql="select * from xz_user limit ?,?";            //查询当前页内容
	page  = (page-1)*pageSize;
	pool.query(sql,[page,pageSize],(err,result1)=>{
		if(err) throw err;
		var sql = "select count(uid) as c from xz_user"; //总页码 4
		pool.query(sql,(err,result2)=>{
			if(err)throw err;
            var count = Math.ceil(result2[0].c/pageSize); //1.25 =>2
			//                          当前页内容     总页数      当前页码
            res.send({code:1,msg:"成功",data:result1,total:count,pageNo:page});
		})
		
	});
});
//3.根据uid删除用户
r.delete("/v1/delUser/:uid",(req,res)=>{
	var _uid=req.params.uid;
	var sql="delete from xz_user where uid=?";
	pool.query(sql,[_uid],(err,result)=>{
		if(err) throw err;
		if(result.affectedRows>0){
			res.send("1");
		}else{
			res.send("0");
		}
	});
});
//根据uid查询用户信息
r.get("/v1/search/:uid",(req,res)=>{
	var _uid=req.params.uid;
	var sql="select * from xz_user where uid=?";
	pool.query(sql,[_uid],(err,result)=>{
		if(err) throw err;
		res.send(result[0]);
	});
});
//根据uid修改用户信息
r.put("/v1/update",(req,res)=>{
	var obj=req.body;
	var sql="update xz_user set email = ? where uid=?"; 
	console.log(sql,obj);
	pool.query(sql,[obj.email,obj.uid],(err,result)=>{
		if(err) throw err;
		if(result.affectedRows>0){
			res.send("1");
		}else{
			res.send("0");
		}
	});
});

//注册用户
r.post("/v1/ref",(req,res)=>{
	var obj=req.body;
	//验证用户验证码
	if(obj.code != req.session.captcha){
		res.send("-1");
		return;
	}
	var sql="INSERT INTO xz_user (uid,uname,upwd) VALUES(null,?,?)"; 
	console.log(obj);
	pool.query(sql,[obj.uname,obj.upwd],(err,result)=>{
		if(err) throw err;
		if(result.affectedRows>0){
			res.send("1");
		}else{
			res.send("0");
		}
	});
});
//判断用户名是否存在
r.get("/v1/isexists",(req,res)=>{
	var obj=req.query;
	var sql="SELECT uid FROM xz_user WHERE uname = ?"; 
	console.log(sql,obj);
	pool.query(sql,[obj.uname],(err,result)=>{
		if(err) throw err;
		if(result.length>0){
			res.send("1");
		}else{
			res.send("0");
		}
	});
});

r.post("/v1/remove3",(req,res)=>{
	var obj=req.body.ids.split("_");
    console.log(obj);
	var num = "";
	for(var i=0;i<obj.length;i++){
		num+=obj[i]+",";
	}
	num = num.slice(0,num.length-1);
	console.log(num);
	var sql="DELETE FROM xz_user WHERE uid in ("+num+")"; 
	pool.query(sql,(err,result)=>{
		if(err)throw err;
		if(result.affectedRows>0){
			res.send({code:1,msg:"删除成功"});
		}else{
			res.send({code:-1,msg:"删除失败"});

		}
	})
});

//判断用户名是否存在
r.get("/v1/logout",(req,res)=>{
	req.session.destroy();
	res.send({code:1,msg:"退出成功"})
});

var createFolder = function(folder){
    try{
        fs.accessSync(folder); 
    }catch(e){
        fs.mkdirSync(folder);//创建目录
    }  
};
var multer  = require('multer');//第三方模块：负责完图片上传功能
var fs = require('fs');
var uploadFolder = './public/upload/';
createFolder(uploadFolder);
// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {    //上传后文件名称->修改文件名
		console.log(file.originalname)
		var fileName = file.originalname;
		//获取原来文件后缀   jpg  png  gif
		var ext = file.originalname.substr(fileName.length-5);
        // 将保存文件名设置为 字段名 + 时间戳，比如 11-1478521468943.jpg
        cb(null, file.fieldname + '-' + Date.now()+"."+ext);  
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ storage: storage })

// 单图上传
r.post('/v1/upload', upload.single('logo'), function(req, res, next){
    var file = req.file.filename;
	var uid =  req.body.uid;
	//console.log(file);
	//console.log(uid);

	pool.query("update xz_user SET pic = ? WHERE uid = ?",[file,uid],(err,result)=>{
		if(err)throw err;
		res.send({ret_code: '0'});
	})
    
});
//导出路由器对象
module.exports=r;