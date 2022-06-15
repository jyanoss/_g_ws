var ws = new WebSocket('ws://localhost:30003');
ws.onopen = (event) => {
  let sendData = { event: 'open' }
  ws.send(JSON.stringify(sendData));
}
ws.onmessage = (event) => {
  let recData = JSON.parse(event.data);
  switch (recData.event) {
    case 'response':
      console.log(recData.data);
      break;
  }
}
  
function myOnClick() {
  let sendData = {
    event: 'request',
    data: 'some data...'
  };
  ws.send(JSON.stringify(sendData));
}