var dbConfig = require('../util/dbConfig')

// 分页获取所有角色
getRoles = (req, res) => {
    const page_num = req.query.page_num //当前的num
    const page_size = req.query.page_size //当前页的数量
    console.log(page_num, page_size)
    if (page_size == -1) {
        var sql = `select * from role`
        var sqlArr = []
    } else {
        var sql = `SELECT a.role_id,a.role_name,a.remark,GROUP_CONCAT(r.menu_name separator ',') menu_name from 
        (SELECT s.role_id,s.role_name,s.remark,r.menu_id from role s 
        LEFT JOIN t_role_menu r ON s.role_id=r.role_id) as a LEFT JOIN menu r ON a.menu_id=r.menu_id GROUP BY a.role_id limit ?,?`
        var sqlArr = [(parseInt(page_num) - 1) * parseInt(page_size), parseInt(page_size)];
    }
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错');
        } else {
            if (page_size == -1) {
                res.send({
                    'code': 200,
                    'success': true,
                    'msg': '查询成功',
                    'list': data,
                })
            }
            else {
                getRoleTotal(res, data)
            }
        }
    }
    dbConfig.sqlconnect(sql, sqlArr, callBack)
}
// 获取所有角色的总数
getRoleTotal = (res, list) => {
    var sql = `select count(*) as total from role`
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
//判断同一用户是否存在同一角色
isUserSameRole = (role_id, user_id) => {
    var sql = `select count(*) as total from t_user_role where role_id=? and user_id=?`
    var sqlArr = [role_id, user_id]
    return dbConfig.sySqlConnect(sql, sqlArr)
}
//插入数据用户数据表
insertUserRole = async (req, res) => {
    let { role_id, user_id } = req.body;
    let isInsert = await isUserSameRole(role_id, user_id)
    console.log(isInsert[0].total)
    if (isInsert[0].total > 0) {
        res.send({
            'code': 400,
            'success': false,
            'msg': '插入失败'
        })
    }
    else {
        var sql = `INSERT INTO t_user_role(role_id,user_id) VALUES(?,?)`
        var sqlArr = [role_id, user_id]
        let data = await dbConfig.sySqlConnect(sql, sqlArr)
        if (data.affectedRows == 1) {
            res.send({
                'code': 200,
                'success': true,
                'msg': '插入数据成功'
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
//判断同一角色是否存在同一菜单
isRoleSameMenu=(role_id,menu_id)=>{
    var sql = `select count(*) as total from t_role_menu where role_id=? and menu_id=?`
    var sqlArr = [role_id, menu_id]
    return dbConfig.sySqlConnect(sql, sqlArr)
}

//角色添加菜单
insertRoleMenu = async(req,res) =>{
    let {role_id,menu_id} = req.body
    let isInsert = await isRoleSameMenu(role_id, menu_id)
    console.log(isInsert)
    if (isInsert[0].total > 0) {
        res.send({
            'code': 400,
            'success': false,
            'msg': '插入失败'
        })
    }
    else {
        var sql = `INSERT INTO t_role_menu(role_id,menu_id) VALUES(?,?)`
        var sqlArr = [role_id, menu_id]
        let data = await dbConfig.sySqlConnect(sql, sqlArr)
        if (data.affectedRows == 1) {
            res.send({
                'code': 200,
                'success': true,
                'msg': '插入数据成功'
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
module.exports = {
    getRoles,
    insertUserRole,
    insertRoleMenu
}