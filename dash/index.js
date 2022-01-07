const { sql } = require('../config.json');

const express = require('express');
const app = express();
app.set('view engine','ejs');
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
async function getTotalExecCount(serverId) {
    if(serverId) [rows] = await connection.execute('SELECT SUM(`execCount`) FROM `stats` WHERE `serverId` = ?', [serverId]);
    else [rows] = await connection.execute('SELECT SUM(`execCount`) FROM `stats`');
    return rows[0]['SUM(`execCount`)'];
}
async function getExecCountData(serverId) {
    var data = [];
    var rows;
    if(serverId) [rows] = await connection.execute('SELECT `execCount`, `timestamp`, `command` FROM `stats` WHERE `serverId` = ?', [serverId]);
    else [rows] = await connection.execute('SELECT `execCount`, `timestamp`, `command` FROM `stats`');
    for(let i = 0; i < rows.length; i++) data.push({ count: rows[i].execCount, unix: rows[i].timestamp, cmd: rows[i].command.split(' ')[0] });
    return data;
}

app.use(express.static('public'));
app.get('/global', async(req, res) => {
    res.render('dash', {
        helpId: null,
        shardId: null,
        serverName: 'Global',
        total: await getTotalExecCount(null),
        data: await getExecCountData(null),
    });
});
app.get('/:serverId', async(req, res) => {
    const serverId = req.params.serverId;
    if(!await existsServer(serverId)) return res.render('server404');
    const [rows] = await connection.execute('SELECT * FROM `servers` WHERE `serverId` = ?', [serverId]);
    res.render('dash', {
        helpId: rows[0].helpId,
        shardId: rows[0].shardId,
        serverName: rows[0].serverName,
        total: await getTotalExecCount(serverId),
        data: await getExecCountData(serverId),
    });
});
app.get('/api/public/:serverId',() => {

})
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));