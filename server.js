const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

const users = new Map(); // 存储用户信息

io.on('connection', (socket) => {
    console.log('用户连接成功');

    socket.on('join', (nickname) => {
        users.set(socket.id, nickname);
        console.log(`${nickname} 加入了聊天室`);
        
        // 广播新用户加入消息
        io.emit('chat message', {
            nickname: 'System',
            message: `${nickname} 加入了聊天室`,
            time: new Date().toLocaleTimeString()
        });
        
        // 更新用户列表
        io.emit('update users', Array.from(users.values()));
    });

    socket.on('chat message', (data) => {
        // 添加时间戳
        data.time = new Date().toLocaleTimeString();
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        const nickname = users.get(socket.id);
        if (nickname) {
            console.log(`${nickname} 离开了聊天室`);
            io.emit('chat message', {
                nickname: 'System',
                message: `${nickname} 离开了聊天室`,
                time: new Date().toLocaleTimeString()
            });
            users.delete(socket.id);
            // 更新用户列表
            io.emit('update users', Array.from(users.values()));
        }
    });
});

const PORT = process.env.PORT || 3030;
http.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
