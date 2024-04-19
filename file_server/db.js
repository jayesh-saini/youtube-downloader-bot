const mysql = require('mysql')

// ----------- DB --------------
const sql = mysql.createPool({
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    debug: false
})

sql.getConnection((err, connection) => {
    if (err) {
        console.log(err)
        process.exit(-1)
    } else {
        console.log('Database connected successfully');
        connection.release();
    }
})

module.exports = { sql }