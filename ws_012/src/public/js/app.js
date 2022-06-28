// app.js

const socket = io(); // io function은 알아서 socket.io를 실행하고 있는 서버를 찾을 것이다!

// 방을 만들것!! (socket IO에는 이미 방기능이 있다!)
const div_login_id  = document.getElementById("login_id");
const div_room_name = document.getElementById("room_name");
const btn_logout    = document.getElementById("btn_logout");
const btn_leave     = document.getElementById("btn_leave");

const login         = document.getElementById("login");
const login_form    = login.querySelector("form");

const lobby         = document.getElementById("lobby");
const lobby_form    = lobby.querySelector("form");

const room          = document.getElementById("room");
const room_form     = room.querySelector("form");



lobby.hidden        = true; 
room.hidden         = true; 
btn_logout.hidden   = true;

let g_login_id;         //
let g_room_id;        //



//================================================================================================
// 함수정의
//================================================================================================

// 로그인 버튼 클릭 (submit)
function hdl_a000_login(event){
    event.preventDefault();
    const input = login_form.querySelector("input");
    socket.emit( "a000_login",input.value); 
    input.value = "";
}

// 로그인 결과처리
function hdl_a000_login_result(ret_code, login_id, room_name){
    if(ret_code === '0'){
        //-------------------------------------------------
        //로비페이지 이동
        //-------------------------------------------------
        login.hidden            = true;
        lobby.hidden            = false;
        room.hidden             = true; 
        btn_create.hidden       = false;
        btn_logout.hidden       = false;

        // 로그인아이디 저장 // 로그인텍스트 출력
        g_login_id              = login_id;
        div_login_id.innerText  = `[${login_id}] 으로 로그인 성공`;
        // 방이름 저장      // 방이름텍스트 저장
        g_room_id               = room_name
        div_room_name.innerText = room_name;

        btn_logout.addEventListener("click", hdl_a999_logout);        // 로그아웃 버튼 이벤트 등록
        btn_create.addEventListener("click", hdl_b000_roomCreate);    // 방만들기 버튼 이벤트 등록
        lobby_form.addEventListener("submit", hdl_b000_msgSend);      // 로비채팅 이벤트 등록

    }else{
        
        //-------------------------------------------------
        //로그인페이지
        //-------------------------------------------------
        login.hidden            = false;
        lobby.hidden            = true;
        room.hidden             = true; 
        btn_create.hidden       = true;
        btn_logout.hidden       = true;

        // 로그인아이디 저장 // 로그인텍스트 출력
        g_login_id              = "";
        div_login_id.innerText  = "";
        // 방이름 저장      // 방이름텍스트 삭제
        g_room_id               = ""
        div_room_name.innerText = "";

        login_form.querySelector("input") = '';
   
        alert('로그인 실패');
        return false;

    }

}

// 로그아웃 버튼 클릭
function hdl_a999_logout(event){
    event.preventDefault();
    socket.emit( "a999_logout"); 
}

// 로그아웃 결과처리
function hdl_a999_logout_result(ret_code, msg){
    if(ret_code === '0'){

        alert(msg);
        //로그인페이지 이동
        login.hidden            = false;
        lobby.hidden            = true;
        room.hidden             = true; 
        btn_create.hidden       = true;
        btn_logout.hidden       = true;

        // 로그인아이디 저장 // 로그인텍스트 출력
        g_login_id              = "";
        div_login_id.innerText  = "";
        // 방이름 저장      // 방이름텍스트 삭제
        g_room_id               = ""
        div_room_name.innerText = "";

        //로비채팅창초기화처리
        const ul = document.getElementById("lobbybox");;
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
        const ul2 = document.getElementById("RoomList");;
        while (ul2.firstChild) {
            ul2.removeChild(ul2.firstChild);
        }

    }else{
        alert(msg);
        return false;
    }

}

// 로비 메시지 버튼 클릭
function hdl_b000_msgSend(event){
    event.preventDefault();
    var room_name   = g_room_id;
    var login_id    = g_login_id;
    const input     = lobby_form.querySelector("input");
    socket.emit("b000_msgSend", input.value, room_name, login_id);   
    addLobbyMessage(`${login_id}(me): ${input.value}`);
    input.value     = ""; 
}

// 로비 메시지 전송 결과처리
function addLobbyMessage(message){
    const ul = document.getElementById("lobbybox");;
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

// 로비룸리스트 결과처리
function addRoomList(message){
    
    const ul = document.getElementById("RoomList");;
    message.forEach((key) => {
        if(key !== 100000){
            const li = document.createElement("li");
            li.innerHTML = `<a href='#' onclick='hdl_b200_joinRoom(${key});'>${key}</a>`
            ul.appendChild(li);
        }
    })
    
}

//방조인 버튼 클릭
function hdl_b200_joinRoom(room_name){
    socket.emit( "b200_joinRoom", room_name);     
}

// 방조인결과처리
function hdl_b200_joinRoom_result(ret_code, room_name){
console.log(room_name);
        //회의실페이지 이동
        login.hidden    = true;
        lobby.hidden    = true;
        room.hidden     = false; 

        //방이름 저장
        g_room_id             = room_name
        //방이름텍스트 저장
        div_room_name.innerText = `Room ${room_name}`               

        const msgForm = room.querySelector("#msg");
        msgForm.addEventListener("submit", hdl_c000_msgSend);       // 메시지전송 버튼 이벤트 등록
        btn_leave.addEventListener("click", hdl_b999_roomLeave);    // 방나가기 버튼 이벤트 등록

        //로비채팅창초기화처리
        const ul = document.getElementById("lobbybox");;
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
        const ul2 = document.getElementById("RoomList");;
        while (ul2.firstChild) {
            ul2.removeChild(ul2.firstChild);
        }

}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 작업중

// 방생성 버튼 클릭
function hdl_b000_roomCreate(event){
    event.preventDefault();
    socket.emit( "b000_roomCreate");     
}

// 방생성 결과처리
function hdl_b000_roomCreate_result(ret_code, room_name){
    if(ret_code === '0'){

        //회의실페이지 이동
        login.hidden    = true;
        lobby.hidden    = true;
        room.hidden     = false; 

        //const h3 = room.querySelector("h3");
        //방이름 저장
        g_room_id             = room_name
        //방이름텍스트 저장
        div_room_name.innerText = `Room ${room_name}`               

        const msgForm = room.querySelector("#msg");
        msgForm.addEventListener("submit", hdl_c000_msgSend);       // 메시지전송 버튼 이벤트 등록
        btn_leave.addEventListener("click", hdl_b999_roomLeave);    // 방나가기 버튼 이벤트 등록

        //로비채팅창초기화처리
        const ul = document.getElementById("lobbybox");;
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
        const ul2 = document.getElementById("RoomList");;
        while (ul2.firstChild) {
            ul2.removeChild(ul2.firstChild);
        }

    }else{
        //alert(room_name);
        return false;
    }

}

// 방나가기 버튼 클릭
function hdl_b999_roomLeave(event){
    event.preventDefault();
    var room_name = g_room_id;
    socket.emit( "b999_roomLeave", room_name);   
}

// 방나가기 결과처리
function hdl_b999_roomLeave_result(ret_code, msg, room_name){

    if(ret_code === '0'){

        alert(msg);
        //로비페이지 이동
        login.hidden            = true;
        lobby.hidden            = false;
        room.hidden             = true; 
        btn_logout.hidden       = false;

        //방이름 저장
        g_room_id               = room_name;
        //방이름텍스트 저장
        div_room_name.innerText = room_name;
        //룸채팅창초기화처리
        const ul = room.querySelector("ul");
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }

    }else{
        alert(msg);
        return false;
    }

}

// 방메시지 버튼 클릭
function hdl_c000_msgSend(event){
    event.preventDefault();
    
    var room_name   = g_room_id;
    var login_id    = g_login_id;
    const input     = room_form.querySelector("input");
    socket.emit("c000_msgSend", input.value, room_name, login_id);   
    addRoomMessage(`${login_id}(me): ${input.value}`);
    input.value     = ""; 
}

// 메시지 전송 결과처리
function addRoomMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}



//================================================================================================
// 이벤트등록
//================================================================================================

// 로그인버튼 클릭 이벤트 등록
login_form.addEventListener("submit", hdl_a000_login);     //로그인이벤트등록


//================================================================================================
// 소켓정의
//================================================================================================

//테스트용 메시지
socket.on("io_system_msg", (msg) => {  console.log("io_system_msg", msg);    })

//로그인처리
socket.on("a000_login_result", (ret_code, login_id, room_name) => {  
    console.log("a000_login_result", login_id, room_name);
    hdl_a000_login_result(ret_code, login_id, room_name);    
})

//로그아웃처리
socket.on("a999_logout_result", (ret_code, msg) => {  
    console.log("a999_logout_result", ret_code, msg);
    hdl_a999_logout_result(ret_code, msg);    
})

//방조인처리
socket.on("b200_joinRoom_result", (ret_code, room_name) => {  
    console.log("b200_joinRoom_result", ret_code, room_name);
    hdl_b200_joinRoom_result(ret_code, room_name);    
})


//방생성처리
socket.on("b000_roomCreate_reuslt", (ret_code, room_name) => {  
    console.log("b000_roomCreate_reuslt", ret_code, room_name);
    hdl_b000_roomCreate_result(ret_code, room_name);    
})

//방나가기처리
socket.on("b999_roomLeave_result", (ret_code, msg, room_name) => {  
    console.log("b999_roomLeave_result", ret_code, msg, room_name);
    hdl_b999_roomLeave_result(ret_code, msg, room_name);    
 
})

//로비메세지처리
socket.on("b000_msgSend_return", (ret_code, msg) => { 
    console.log(">>>>>>>>>>> b000_msgSend_return", ret_code, msg);
    addLobbyMessage(msg);
})


//방메세지처리
socket.on("c000_msgSend_return", (ret_code, msg) => { 
    console.log(">>>>>>>>>>> c000_msgSend_return", ret_code, msg);
    addRoomMessage(msg);
})

//로비룸리스트처리
socket.on("b100_RoomList_return", (ret_code, msg) => { 
    console.log(">>>>>>>>>>> b100_RoomList_return", ret_code, msg);
    addRoomList(msg);
})




