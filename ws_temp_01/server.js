var WebSocket = require('ws').Server;
var wss = new WebSocketServer({ port: 30003 });
  
wss.on('connection', function(ws) {

  ws.on('message', function(message) {
    const sendData = {
      event: 'response',
      data: null
    };
  
    switch(message.event) {
      case 'open':
        console.log(message);
        break;
      case 'request':
        sendData.data = 'some data...';
        ws.send(JSON.stringify(sendData));
        break;
    }
  });
  
});