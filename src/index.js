const express = require('express');
const path = require('path');
const crypto = require('crypto');


const app = express();

//express 앱에 socket.io 연동하기
const http = require('http');
const {Server} = require('socket.io');
const { default: mongoose } = require('mongoose');
const { saveMessages, fetchMessages } = require('./utils/messages');
const server = http.createServer(app);
const io = new Server(server);

const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));
app.use(express.json());

mongoose.set('strictQuery', false);
mongoose.connect('')
.then(() => console.log('디비 연결'))
.catch(err => console.error(err));

const randomId = () => crypto.randomBytes(8).toString('hex');

app.post('/session', (req, res) => {
    const data = {
        username: req.body.username,
        userID: randomId()
    }

    res.send(data);
})

//미들웨어 생성
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const userID = socket.handshake.auth.userID;

    if(!username) {
        return next(new Error('Invalid username'));
    }

    socket.username = username;
    socket.id = userID;

    next();
})


let users = [];
io.on('connection', async socket => {
    let userData = {
        username: socket.username,
        userID: socket.id
    };

    users.push(userData);
 
    io.emit('users-data', {users});


    //클라이언트에서 보내온 메세지를 특정 사람에게 보내기
    socket.on('message-to-server', (payload) => {
        io.to(payload.to).emit('message-to-client',payload);
        console.log(payload);
        saveMessages(payload);

    })

    //데이터 베이스에서 메세지 가져오기
    socket.on('fetch-messages', ({receiver}) => {
        fetchMessages(io, socket.id, receiver);
    })

    //유저가 방에서 나갔을때
    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id);
        //사이드바 유저목록에서 없애기
        io.emit('users-data', {users});

        //대화중이라면 대화창 없애기
        io.emit('user-away', socket.id);
    })
});

const port = 8080;
server.listen(port, () => {
    console.log('service is Running');

})