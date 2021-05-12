const express=require('express');
//引入连接池模块
const pool=require('../pool.js');
//创建路由器对象
const r=express.Router();
//1.登录模块
r.get("/v1/login/:uname&:upwd",(req,res)=>{
	var _uname=req.params.uname;
	var _upwd=req.params.upwd;
	var sql="select * from xz_user where uname=? and upwd=?";
	pool.query(sql,[_uname,_upwd],(err,result)=>{
		if(err) throw err;
		if(result.length>0){
			res.send("1");
		}else{
			res.send("0");
		}
	});
});
//2.查询用户列表
r.get("/v1/list",(req,res)=>{
	var sql="select * from xz_user";
	pool.query(sql,(err,result)=>{
		if(err) throw err;
		res.send(result);
	});
});
//3.根据uid删除用户
r.delete("/v1/delUser/:uid",(req,res)=>{
	var _uid=req.params.uid;
	var sql="delete from xz_user where uid=?";
	pool.query(sql,[_uid],(err,result)=>{
		if(err) throw err;
		if(result.affectedRows>0){
			res.send({code:1, msg:"删除成功"});
		}else{
			res.send({code:0, msg:"删除失败"});
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
//导出路由器对象
module.exports=r;