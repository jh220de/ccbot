const { sql } = require('../config.json');

const express = require('express');
const app = express();
app.set('view engine','ejs')
const port = 3000;

const mysql = require('mysql2/promise');
var connection;
(async () => {
    connection = await mysql.createConnection({
        host: sql.host,
        port: sql.port,
        database: sql.database,
        user: sql.user,
        password: sql.password
    });
})();

async function existsServer(serverId) {
    const [rows] = await connection.execute('SELECT * FROM `servers` WHERE `serverId` = ?', [serverId]);
    return rows[0] ? true : false;
}
async function getServerData(serverId) {
    var data = {};
    const [rows] = await connection.execute('SELECT * FROM `servers` WHERE `serverId` = ?', [serverId]);
    // TODO
    return data;
}
async function getTotalExecCount(serverId) {
    var count = 0;
    const [rows] = await connection.execute('SELECT `execCount` FROM `stats` WHERE `serverId` = ?', [serverId]);
    for(let i = 0; i < rows.length; i++) count += rows[0].execCount;
    return count;
}
async function getExecCountData(serverId) {
    var data = [];
    const [rows] = await connection.execute('SELECT `execCount`, `timestamp` FROM `stats` WHERE `serverId` = ?', [serverId]);
    for(let i = 0; i < rows.length; i++) data.push({ count: rows[i].execCount, unix: rows[i].timestamp });
    return data;
}

app.use(express.static('public'))
app.get('/', async(req, res) => {
    const serverId = 124234234;
    if(!await existsServer(serverId)) res.render('server404');
    res.render('dash',{execCount:await getTotalExecCount(serverId)});
});
app.get('/api/public/:serverId',() => {

})
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));