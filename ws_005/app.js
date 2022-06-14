const app   = require('express')();
const http  = require('http').createServer(app);
const io    = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
    socket.on('request_message', (msg) => {
        // response_message로 접속중인 모든 사용자에게 msg 를 담은 정보를 방출한다.
        io.emit('response_message', msg);
    });

    socket.on('disconnect', async () => {
        console.log('user disconnected');
    });
});


// TEST CODE GOES HERE
(async function(){
})();



http.listen(3000, () => {
    console.log('Connected at 3000');
});