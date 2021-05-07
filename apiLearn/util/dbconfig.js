const mysql = require('mysql')
module.exports = {
    //数据库配置
    config: {
        host: 'localhost',
        user: 'root',
        password: '123456',
        port: '3306',
        database: 'websites'
    },
    //连接数据库，使用mysql的连接池连接方式
    sqlconnect: function (sql, sqlArr, callBack) {
        let pool = mysql.createPool(this.config)
        pool.getConnection((err, conn) => {
            console.log('1213')
            if (err) {
                console.log('连接失败');
                return
            }
            //事件驱动回调
            conn.query(sql, sqlArr, callBack);
            //释放连接
            conn.release();
        })

    },
    // promise回调
    sySqlConnect: function (sql, sqlArr) {
        return new Promise((resolve, reject) => {
            let pool = mysql.createPool(this.config)
            pool.getConnection((err, conn) => {
                if (err) {
                    console.log('连接失败');
                    reject(err)
                }
                else {
                    //事件驱动回调
                    conn.query(sql, sqlArr, (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data)
                        }
                    });
                    //释放连接
                    conn.release();
                }
            })
        }).catch((err)=>{
            console.log(err)
        })
    }

}