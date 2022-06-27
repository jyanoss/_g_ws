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

const hdlListen = () => console.log(`Listening on http://localhost:3000`)
// app.listen(3000, hdlListen); // 3000번 포트와 연결

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

/////////////////////////////////////////////////////////////////////////////////
let g_room_id      = 100000;             //방이름관리



/////////////////////////////////////////////////////////////////////////////////
// 방목록 만들기
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

//해당방의 사람수리턴
function countRoom(g_room_name){ // 방에 사람이 몇명이 있는지 계산하는 함수(set의 size를 이용)
    return wsServer.sockets.adapter.rooms.get(g_room_name)?.size; // g_room_name을 찾을 수도 있지만 못찾을 수도 있기 때문에 ?를 붙여준다
}


wsServer.on("connection", socket => {

    socket.emit('io_system_msg', `socket.id : ${socket.id}`);

    socket.onAny((event) => { // 미들웨어같은 존재! 어느 이벤트에서든지 console.log를 할 수 있다!
        // console.log(wsServer.sockets.adapter); // 어댑터 동작 확인하기
        console.log(`Socket Event:${event}`)
        console.log(publicRooms());
    })

    //로그인요청
    socket.on("a000_login", (login_id) => {
        // 1.로그인처리 (ToDo)
        // 2.소켓닉네임등록
        socket["nickname"] = login_id;
        // 3.결과리턴
        socket.emit('a000_login_result', '0', login_id);       //event, ret_code (0:성공), 로그인아이디
  
    });

    //로그아웃요청
    socket.on("a999_logout", () => {
        // 1.로그아웃처리 (ToDo)
        // 2.결과리턴
        socket.emit('a999_logout_result', '0', '로그아웃성공');  //event, ret_code (0:성공), 결과메시지
    });
    
    //방생성요청
    socket.on("b000_roomCreate", (room_name) => {
        // 1.방생성처리 (ToDo)
        // 2.방조인처리
        socket.join(room_name);
        console.log('room: ', wsServer.sockets.adapter.rooms);
        // 3.결과리턴
        socket.emit('b000_roomCreate_reuslt', '0', room_name);  //event, ret_code (0:성공), 결과메시지
    });

    //방나가기요청
    socket.on("b999_roomLeave", (room_name) => {
        // 1.방나가기처리 DB (ToDo)
        // 2.방나기기처리
        socket.leave(room_name);
        // 3.결과리턴
        socket.emit('b999_roomLeave_result', '0', '방나가기성공');  //event, ret_code (0:성공), 결과메시지
        // 4.방메시지전송

    });
    
    //메시지전송요청
    socket.on("c000_msgSend", ( msg, room_name, login_id ) => { // 메세지랑 done 함수를 받을 것
        console.log('c000_msgSend_return', login_id, room_name, msg)
        console.log('room: ', wsServer.sockets.adapter.rooms);
        // 1.메시지 저장
        // 2.메시지전송
        socket.to(room_name).emit('c000_msgSend_return', '0', `${login_id}: ${msg}`);
  
        //console.log(socket);
    });
    
    
});


httpServer.listen(3000, hdlListen); // 서버는 ws, http 프로토콜 모두 이해할 수 있게 된다!

