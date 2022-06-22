// server.js

import http from "http"; // 이미 기본 설치되어있음
import WebSocket from "ws"; // 기본설치!
import express from "express"; // npm i express 설치
import { instrument } from "@socket.io/admin-ui";
import { Server } from "socket.io"; 

const app = express(); // app이라는 변수에 가져와서 사용

app.set("view engine", "pug"); // 뷰 엔진을 pug로 하겠다
app.set("views", __dirname + "/views"); // 디렉토리 설정
app.use("/public", express.static(__dirname + "/public")); // public 폴더를 유저에게 공개 (유저가 볼 수 있는 폴더 지정)
app.get("/", (req, res) => res.render("home")); // 홈페이지로 이동할 때 사용될 템플릿을 렌더
app.get("/*", (req, res) => res.redirect("/")) // 홈페이지 내 어느 페이지에 접근해도 홈으로 연결되도록 리다이렉트 (다른 url 사용 안할거라)

const handleListen = () => console.log(`Listening on http://localhost:3000`)
// app.listen(3000, handleListen); // 3000번 포트와 연결

const httpServer = http.createServer(app); // app은 requestlistener 경로 - express application으로부터 서버 생성
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"], // 이 URL에서 localhost:3000에 액세스할 것이기 때문에! - 온라인에서 Admin UI를 실제로 테스트할 수 있는 데모 사용을 위한 환경설정!
      credentials: true
    }
}); // localhost:3000/socket.io/socket.io.js로 연결 가능 (socketIO는 websocket의 부가기능이 아니다!!)

instrument(wsServer, {
    auth: false, // 실제 비밀번호를 쓰도록 바꿀 수 있음!
});



function publicRooms(){
    const {
        sockets: {
            adapter: {
                sids, rooms
            }
        }
    } = wsServer; // wsServer에서 sids와 rooms 가져오기
    
    // public room list 만들기
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    })
    return publicRooms;
}


function countRoom(g_room_name){ // 방에 사람이 몇명이 있는지 계산하는 함수(set의 size를 이용)
    return wsServer.sockets.adapter.rooms.get(g_room_name)?.size; // g_room_name을 찾을 수도 있지만 못찾을 수도 있기 때문에 ?를 붙여준다
}


// websocket에 비해 개선점 : 1. 어떤 이벤트든지 전달 가능 2. JS Object를 보낼 수 있음
wsServer.on("connection", socket => {
    //socket["nickname"] = "Anonymous";


    socket.onAny((event) => { // 미들웨어같은 존재! 어느 이벤트에서든지 console.log를 할 수 있다!
        // console.log(wsServer.sockets.adapter); // 어댑터 동작 확인하기
        console.log(`Socket Event:${event}`)
        console.log(wsServer.sockets.adapter.rooms);

    })


    // >>>(A002) 로그인 PROC
    socket.on("a000_login", (login_id, done) => {
        // console.log(socket.rooms); // 현재 들어가있는 방을 표시 (기본적으로 User와 Server 사이에 private room이 있다!)
        socket["nickname"] = login_id;
        //console.log(socket.rooms);
        done('0', login_id);  //로그인성공
    });

    // >>>(B000) 방만들기 PROC
    socket.on("B000_RoomCreate", (g_room_name, done) => {
        // console.log(socket.rooms); // 현재 들어가있는 방을 표시 (기본적으로 User와 Server 사이에 private room이 있다!)
        socket.join(g_room_name);
        // console.log(socket.rooms);  // 앞은 id, 뒤는 현재 들어가있는 방
        done();
        socket.to(g_room_name).emit("welcome", socket.nickname, countRoom(g_room_name)); // welcome 이벤트를 g_room_name에 있는 모든 사람들에게 emit한 것 (하나의 socket에만 메시지 전달), 들어오면 사람수가 바뀌므로 사람수 count!
        wsServer.sockets.emit("room_change", publicRooms()); // room_change 이벤트의 payload는 publicRooms 함수의 결과 (우리 서버 안에 있는 모든 방의 array = 서버의 모든 socket)
    });


    socket.on("enter_room", (g_room_name, done) => {
        // console.log(socket.rooms); // 현재 들어가있는 방을 표시 (기본적으로 User와 Server 사이에 private room이 있다!)
        socket.join(g_room_name);
        // console.log(socket.rooms);  // 앞은 id, 뒤는 현재 들어가있는 방
        done();
        socket.to(g_room_name).emit("welcome", socket.nickname, countRoom(g_room_name)); // welcome 이벤트를 g_room_name에 있는 모든 사람들에게 emit한 것 (하나의 socket에만 메시지 전달), 들어오면 사람수가 바뀌므로 사람수 count!
        wsServer.sockets.emit("room_change", publicRooms()); // room_change 이벤트의 payload는 publicRooms 함수의 결과 (우리 서버 안에 있는 모든 방의 array = 서버의 모든 socket)
    });

    socket.on("disconnecting", () => { // 클라이언트가 서버와 연결이 끊어지기 직전에 마지막 굿바이 메시지를 보낼 수 있다!
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)); // 방안에 있는 모두에게 보내기 위해 forEach 사용!, 나가면 사람수가 바뀌므로 사람수 count!
    })

    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms()); // 클라이언트가 종료메시지를 모두에게 보내고 room이 변경되었다고 모두에게 알림!
    });

    socket.on("new_message", (msg, room, done) => { // 메세지랑 done 함수를 받을 것
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`); // new_message 이벤트를 emit한다! 방금 받은 메시지가 payload가 된다!
        done(); // done은 프론트엔드에서 코드를 실행할 것!! (백엔드에서 작업 다 끝나고!!)
    });

    socket.on("nickname", nickname => socket["nickname"] = nickname);
});



httpServer.listen(3000, handleListen); // 서버는 ws, http 프로토콜 모두 이해할 수 있게 된다!

