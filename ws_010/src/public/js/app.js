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



lobby.hidden        = true; 
room.hidden         = true; 
btn_logout.hidden   = true;

let g_login_id
let g_room_name;


// >>>(A001) 로그인 Submit
function handleA000Login(event){
    event.preventDefault();
    const input = login_form.querySelector("input");
    // argument 보내기 가능 (socketIO는 Object 전달가능)
    // 첫 번째는 이벤트명(아무거나 상관없음), 두 번째는 front-end에서 전송하는 object(보내고 싶은 payload), 세 번째는 서버에서 호출하는 function
    socket.emit( // emit의 마지막 요소가 function이면 가능
        "a000_login",
        input.value,
        showLobby   // 백엔드에서 끝났다는 사실을 알리기 위해 function을 넣고 싶다면 맨 마지막에 넣자!
    ); // 1. socketIO를 이용하면 모든 것이 메세지일 필요가 없다! / 2. client는 어떠한 이벤트든 모두 emit 가능 / 아무거나 전송할 수 있다(text가 아니어도 되고 여러개 전송 가능!)
    g_room_name = input.value; // g_room_name에 입력한 방 이름 저장
    input.value = "";
}

// >>>(A00X) 로그인성공 
function showLobby(ret_code, login_id) { // 방에 들어가면 방 내용이 보이게

    if(ret_code === '0'){

        login.hidden        = true;
        lobby.hidden        = false;
        room.hidden         = true; 
        btn_logout.hidden   = false;

        alert('로그인 성공');
        g_login_id                  = login_id;
        div_login_id.innerText      = `[${login_id}] 으로 로그인`;
        div_room_name.innerText     = "";
        lobby_form.addEventListener("submit", handleB000Room);

    }else{
        alert('로그인 실패');
        g_login_id                  = "";
        div_login_id.innerText      = "";
        div_room_name.innerText     = "";
        login_form.querySelector("input") = '';
        return false;

    }
}

// >>>(A999) 로그아웃
function handleA999logout() { 
    login.hidden            = false;
    lobby.hidden            = true;
    room.hidden             = true; 
    btn_logout.hidden       = true;
    g_login_id              = "";
    div_login_id.innerText  = "";
    div_room_name.innerText = "";
    alert('로그 아웃');
}

// >>>(B000) 방생성
function handleB000Room(event){
    event.preventDefault();
    const input = lobby_form.querySelector("input");
    // argument 보내기 가능 (socketIO는 Object 전달가능)
    // 첫 번째는 이벤트명(아무거나 상관없음), 두 번째는 front-end에서 전송하는 object(보내고 싶은 payload), 세 번째는 서버에서 호출하는 function
    socket.emit( // emit의 마지막 요소가 function이면 가능
        "B000_RoomCreate",
        input.value,
        showRoom2 // 백엔드에서 끝났다는 사실을 알리기 위해 function을 넣고 싶다면 맨 마지막에 넣자!
    ); // 1. socketIO를 이용하면 모든 것이 메세지일 필요가 없다! / 2. client는 어떠한 이벤트든 모두 emit 가능 / 아무거나 전송할 수 있다(text가 아니어도 되고 여러개 전송 가능!)
    g_room_name = input.value; // g_room_name에 입력한 방 이름 저장
    input.value = "";
}

function showRoom2() { // 방에 들어가면 방 내용이 보이게
    login.hidden    = true;
    lobby.hidden    = true;
    room.hidden     = false; 

    //const h3 = room.querySelector("h3");
    div_room_name.innerText = `Room ${g_room_name}` // 저장된 방 이름을 pug의 요소에 전달해서 띄움! 
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
    btn_leave.addEventListener("click", handleMessageSubmit);
}

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, g_room_name, () => {
        addMessage(`> ${g_login_id}: ${value}`);
    }); // 백엔드로 new_message 이벤트를 날림, (input.value이랑 방이름도 같이 보냄!), 마지막 요소는 백엔드에서 시작시킬 수 있는 함수!
    input.value = "";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
}



// 서버는 back-end에서 function을 호출하지만 function은 front-end에서 실행됨!!


// >>>(A000) 로그인
login_form.addEventListener("submit", handleA000Login);     //로그인이벤트등록
btn_logout.addEventListener("click", handleA999logout);     //로그아웃이벤트등록


// >>>(B001) 로비-룸목록
socket.on("room_list", (rooms) => {
    rooms.forEach(roomList => { // rooms 데이터로 받아온 자료들을 li에 하나씩 뿌려준 후 roomsList에 넣어서 출력시킨다
        console.log(roomList)
        //console.log(socket.roomList); 
    })
}); 

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3"); // 지금은 showRoom 함수에서 copy&paste 했지만, title을 새로고침해주는 함수를 만들어줘도 좋다!
    h3.innerText = `Room ${g_room_name} (${newCount})` // 저장된 방 이름을 pug의 요소에 전달해서 띄움! 
    addMessage(`${user} arrived!`);
})

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${g_room_name} (${newCount})` // 저장된 방 이름을 pug의 요소에 전달해서 띄움! 
    addMessage(`${left} left ㅠㅠ`);
})

socket.on("new_message", addMessage); // addMessage만 써도 알아서 msg를 매개변수로 넣는다!

socket.on("room_change", (rooms) => {
    const roomList = room.querySelector("ul"); // home.pug에 만든 ul을 가져와서
    roomList.innerHTML = ""; // roomList의 HTML을 초기화
    
    rooms.forEach(room => { // rooms 데이터로 받아온 자료들을 li에 하나씩 뿌려준 후 roomsList에 넣어서 출력시킨다
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    })
}); // 이 작업은 socket.on("room_change", (msg) => console.log(msg));와 같다!


