var xlsx = require('node-xlsx')
var fs = require('fs')
var Ctoken = require('../public/token');
var dbConfig = require('../util/dbConfig')
var exportExcels = require('../util/exportExcle')
const svgCaptcha = require('svg-captcha');
var redisHelper = require('../util/redisHelp')
//获取所有学生谁句
getAllStudent = () => {
    var sql = `select * from student`
    var sqlArr = []
    return dbConfig.sySqlConnect(sql, sqlArr)
}
// 获取所有学生
getAllStudentTotal = (res, list) => {
    var sql = `select count(*) as total from student`
    var sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错');
        } else {
            res.send({
                'code': 200,
                'success': true,
                'msg': '查询成功',
                'list': list,
                'total': data[0].total,
            })

        }
    }
    dbConfig.sqlconnect(sql, sqlArr, callBack)
}
// 分页获取学生
getStudent = (req, res) => {
    const page_num = req.query.page_num //当前的num
    const page_size = req.query.page_size //当前页的数量
    console.log(page_num, page_size)
    var sql = `SELECT a.user_id,a.name,a.age,a.username,a.password,GROUP_CONCAT(r.role_name separator ',') role_name from (SELECT s.user_id,s.name,s.age,s.username,s.password,r.role_id from student s LEFT JOIN t_user_role r ON s.user_id=r.user_id
        ) as a LEFT JOIN role r ON a.role_id=r.role_id GROUP BY a.user_id limit ?,? `
    var sqlArr = [(parseInt(page_num) - 1) * parseInt(page_size), parseInt(page_size)];
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错');
        } else {
            getAllStudentTotal(res, data)
        }
    }
    dbConfig.sqlconnect(sql, sqlArr, callBack)
}

// 获取token指定username的学生
getStudentBytoken = (req, res) => {
    console.log(req)
    let username = req.user.name;
    var sql = `SELECT c.username,c.role_name,u.menu_name,u.menu_url,u.menu_status FROM (SELECT b.user_id,b.username,b.role_name,m.menu_id from (SELECT a.user_id,a.name,a.age,a.username,a.password,r.role_id,r.role_name from (SELECT s.user_id,s.name,s.age,s.username,s.password,r.role_id from student s LEFT JOIN t_user_role r ON s.user_id=r.user_id
        ) as a LEFT JOIN role r ON a.role_id=r.role_id) AS b LEFT JOIN t_role_menu m on b.role_id = m.role_id) as c LEFT JOIN menu u on c.menu_id=u.menu_id where username=? and menu_status=1`;
    var sqlArr = [username];
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错');
        } else {
            console.log(data)
            let arr = []
            var url=data.map(item=>item.menu_url)
            data.forEach((item,index)=>{
                if(url.indexOf(item.menu_url)==index){ // 匹配数组元素第一个item位置和当前循环的index
                    arr.push(item);
                }
                
            })
            console.log(arr)
            res.send({
                'code': 200,
                'success': true,
                'list': arr
            })
        }
    }
    dbConfig.sqlconnect(sql, sqlArr, callBack)
}
//根据username获取学生
getStudentByName = (req, res) => {
    let { username } = req.query;
    var sql = `select * from student where username=?`;
    var sqlArr = [username];
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错');
        } else {
            res.send({
                'code': 200,
                'success': true,
                'list': data
            })
        }
    }
    dbConfig.sqlconnect(sql, sqlArr, callBack)
}
//用户注册
userRegister = (req, res) => {
    console.log(req.body)
    let { username, password } = req.body;
    var sql = `INSERT INTO student(username,password) VALUES(?,?)`
    var sqlArr = [username, password];
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错');
        } else {
            console.log(data)
            if (data.affectedRows == 1) {
                res.send({
                    'code': 200,
                    'success': true,
                })
            } else {
                res.send({
                    'code': 400,
                    'success': false,
                    'msg': '插入失败'
                })
            }
        }
    }
    dbConfig.sqlconnect(sql, sqlArr, callBack)
}
//根据用户账号查找对应的用户
getUser = (username, password, code, res) => {
    var sql = `select * from student where username=?`
    var sqlArr = [username];
    var callBack = (err, data) => {
        if (err) {
            res.send({
                'code': 400,
                'success': false,
                'msg': '用户名错误'
            })
        } else {
            redisHelper.getString('code').then(result => {
                if (code.toLowerCase() == result) {
                    console.log(data)
                    let queryPassword = data[0].password
                    if (queryPassword == password) {
                        Ctoken.setToken(username).then((data) => {
                            res.send({
                                'code': 200,
                                'success': true,
                                'msg': '登录成功',
                                'token': data,
                            })
                        });
                    } else {
                        res.send({
                            'code': 400,
                            'success': false,
                            'msg': '用户名或密码错误'
                        })
                    }
                } else {
                    res.send({
                        'code': 400,
                        'success': false,
                        'msg': '验证码错误'
                    })
                }

            })

        }
    }
    dbConfig.sqlconnect(sql, sqlArr, callBack)
}
//用户登录
userLogin = (req, res) => {
    let { username, password, code } = req.body;
    console.log(username, password, code)
    getUser(username, password, code, res)


}
// 获取验证码
getCaptcha = (req, res) => {
    const cap = svgCaptcha.create({
        // 翻转颜色
        inverse: false,
        // 字体大小
        fontSize: 36,
        // 噪声线条数
        noise: 3,
        // 宽度
        width: 80,
        // 高度
        height: 30,
    });
    redisHelper.setString("code", cap.text.toLowerCase(), 10 * 60).then(result => {
        if (result) {
            res.send({
                'code': 200,
                'success': true,
                'img': cap.data
            })
        }
    }).catch(err => {
        console.log(err)
        res.send({
            'code': 500,
            'success': false,
            'msg': "获取验证码失败"
        })
    })
    // req.session.captcha = cap.text; // session 存储验证码数值

    //res.type('image/svg+xml'); // 响应的类型
    // res.setHeader('content-type','image/svg+xml')

}
//导入excel
importExport = (req, res) => {
    console.log(req.file)
    let oldPath = req.file.destination + "/" + req.file.filename;
    let newPath = req.file.destination + "/" + req.file.filename + req.file.originalname;
    fs.rename(oldPath, newPath, async () => {
        console.log("改名成功")
        const list = xlsx.parse(newPath);
        //    console.log(list,list[0].data)
        //    list[0].data.forEach((item,index)=>{
        //        if(index==0){

        //        }   
        //    })
        list[0].data.splice(0, 1);
        // console.log(list[0].data)
        let values = list[0].data
        var sql = `INSERT INTO student(name,age,username,password) VALUES ?`
        var sqlArr = [values];
        let data = await dbConfig.sySqlConnect(sql, sqlArr)
        if (data.affectedRows > 0) {
            res.send({
                'code': 200,
                'success': true,
                'msg': `成功插入${data.affectedRows}条数据`
            })
        } else {
            res.send({
                'code': 400,
                'success': false,
                'msg': '插入失败'
            })
        }
        console.log(data)

    })
    // res.send({
    //     'code': 200,
    //     'success': true,
    //     'msg': '上传文件成功'
    // })
}
//导出excle
exportExcel = async (req, res) => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
    let rows = await getAllStudent()
    console.log(rows)
    //最终返回excel二进制文件流
    let data = [] // 其实最后就是把这个数组写入excel 
    let title = ['user_id', 'name', 'age', 'username', 'password']//这是第一行 俗称列名 
    data.push(title) // 添加完列名 下面就是添加真正的内容了
    rows.forEach((element) => {
        let arrInner = []
        arrInner.push(element.user_id)
        arrInner.push(element.name)
        arrInner.push(element.age)
        arrInner.push(element.username)
        arrInner.push(element.password)
        data.push(arrInner)//data中添加的要是数组，可以将对象的值分解添加进数组，例如：['1','name','上海']
    });
    res.end(exportExcels(data), 'binary');
}
module.exports = {
    getStudent,
    getStudentBytoken,
    getStudentByName,
    userRegister,
    userLogin,
    importExport,
    exportExcel,
    getCaptcha

}