// server.js

var express = require('express');
var app     = express();
var http    = require('http').Server(app);  
var path    = require('path');
var io      = require('socket.io')(http);

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	// 루트 페이지로 접속시 chat.pug 렌더링
	res.render('chat');
});

var count = 1; // 참여자 번호 발급

// 채팅방 접속시
io.on('connect', function(socket){
    //id는 영어와 숫자를 사용한 문자열로 자동생성
    console.log('user connected: ', socket.id);
    var name = "익명" + count++;
    socket.name = name;
    // 서버가 해당 socket id에만 이벤트 전달
    io.to(socket.id).emit('create name', name);
    io.emit('new connect', name);

    // 채팅방에서 나갔을 때
    socket.on('disconnect', function(){
        console.log('user disconnected: ' + socket.id + ' ' + socket.name);
        io.emit('new disconnect', socket.name);
    });

    // 채팅을 보냈을 때
    socket.on('send message', function(name, text){
        var msg = name + ' : ' + text;
        // 닉네임 변경 시
        if(socket.name != name){
            io.emit('change name', socket.name, name);
            socket.name = name; // name 업데이트
        }
        console.log(msg);
        io.emit('receive message', msg);
    });
});


http.listen(3000, function(){ 
	console.log('server on..');
});