var dbConfig = require('../util/dbConfig')
// 查询所有菜单数据
getMenu = async (req, res) => {
    const page_num = req.query.page_num //当前的num
    const page_size = req.query.page_size //当前页的数量
    if (page_size == -1) {
        var sql = `select * from menu`
        var sqlArr = []
    } else {
        var sql = `select * from menu limit ?,?`
        var sqlArr = [(parseInt(page_num) - 1) * parseInt(page_size), parseInt(page_size)];
    }
    // var sql = `select * from menu limit ?,?`
    // var sqlArr = [(parseInt(page_num) - 1) * parseInt(page_size), parseInt(page_size)];
    let data = await dbConfig.sySqlConnect(sql, sqlArr)
    let tatal = await getTotalMenu()
    if (data) {
        if(page_size == -1){
            res.send({
                'code': 200,
                'success': true,
                'msg': '查询成功',
                'list': data,
            })
        }else{
            res.send({
                'code': 200,
                'success': true,
                'msg': '查询成功',
                'list': data,
                'total': tatal[0].total,
            })
        }
       
    }else{
        res.send({
            'code': 400,
            'success': false,
            'msg': '查询失败',
        })
    }
    console.log(data, tatal)

}
//获取菜单的总数
getTotalMenu = () => {
    var sql = `select count(*) as total from menu`
    var sqlArr = []
    return dbConfig.sySqlConnect(sql, sqlArr)
}
// 更新状态
upDataStatus = async(req,res) =>{
    let {menu_id,menu_status} = req.query
    var sql = `UPDATE menu SET menu_status=? WHERE menu_id=?`
    var sqlArr = [menu_status,menu_id]
    let data = await dbConfig.sySqlConnect(sql, sqlArr)
    console.log(data)
    if(data.affectedRows==1){
        res.send({
            'code': 200,
            'success': true,
            'msg': '更新成功',
        })
    }else{
        res.send({
            'code': 200,
            'success': true,
            'msg': '更新失败',
        })
    }
}

module.exports = {
    getMenu,
    upDataStatus
}