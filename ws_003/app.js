const path      = require("path"); 
const express   = require('express');
const app       = express(); 

app.use(express.static("public"));

app.use("/", (req, res)=>{    
    res.sendFile('public/index.html'); // index.html 파일 응답
})

const HTTPServer = app.listen(30001, ()=>{
    console.log("Server is open at port:30001");
}); 

const wsModule = require('ws');

const webSocketServer = new wsModule.Server(
    {        
        server: HTTPServer,     // WebSocket서버에 연결할 HTTP서버를 지정한다.        
        // port: 30002,         // WebSocket연결에 사용할 port를 지정한다(생략시, http서버와 동일한 port 공유 사용)    
    }
);

webSocketServer.on('connection', (ws, request)=>{
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;     
    console.log(`새로운 클라이언트[${ip}] 접속`);
    if(ws.readyState === ws.OPEN){        
        ws.send(`클라이언트[${ip}] 접속을 환영합니다 from 서버`); // 데이터 전송    
    }     
    
    ws.on('message', (msg)=>{        
        console.log(`클라이언트[${ip}]에게 수신한 메시지 : ${msg}`);        
        ws.send('메시지 잘 받았습니다! from 서버')    
    })     
    
    ws.on('error', (error)=>{        
        console.log(`클라이언트[${ip}] 연결 에러발생 : ${error}`);    
    })     
    
    ws.on('close', ()=>{        
        console.log(`클라이언트[${ip}] 웹소켓 연결 종료`);    
    })
});
