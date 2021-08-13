const socket = io("/");

let eventDispatch = document.querySelector("#event_dispatch");
let messagesSended = document.querySelector("#messages_sended");
let clearHistory = document.querySelector("#clear_history");
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");


const buildMessage = (ev) => {
  return `<div class="message">
        <b><i class="far fa-arrow-alt-circle-right"></i> Event Name:  <span> ${
      (!!ev.event) ? ev.event : 'UNKNOWN'
  }</span>  - ${ev.date}</b>
        <code>${ev.value}</code>
    </div>`;
}
const buildHistoryMessage = () => {
  let history = JSON.parse(localStorage.getItem('messages_sended_history'));
  if(!!history){
      history = history.reverse();
    history.map(ev => {
      messagesSended.innerHTML =
          messagesSended.innerHTML +
          buildMessage(ev)
    })
  }else{
      messagesSended.innerHTML = '';
  }

}
buildHistoryMessage();

clearHistory.addEventListener("click", (e) => {
    const history = localStorage.getItem('messages_sended_history');
    console.log('CLEAR HISTORY',history);
    if (!!history) {
        localStorage.removeItem('messages_sended_history');
        buildHistoryMessage();
    }
});

send.addEventListener("click", (e) => {
    const eventName = !!eventDispatch.value ? eventDispatch.value : null;
    if (text.value.length !== 0) {
        if (!!eventName) {
            socket.emit(eventName, text.value);
        }
        socket.emit('internal_message', {event: eventName,key:Date.now().toString(),date:new Date(Date.now()).toUTCString(), value: text.value.replace(/(\r\n|\n|\r)/g, '').trim()});
        text.value = "";
    }
});

text.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && text.value.length !== 0) {
        const eventName = !!eventDispatch.value ? eventDispatch.value : null;
        if (!!eventName) {
            socket.emit(eventName, text.value);
        }
        socket.emit('internal_message', {event: eventName,key:Date.now().toString(),date:new Date(Date.now()).toUTCString(), value: text.value.replace(/(\r\n|\n|\r)/g, '').trim()});
        text.value = "";
    }
});


socket.on("createMessage", (message, userName) => {
    messagesSended.innerHTML =
        messagesSended.innerHTML +
        buildMessage(message);

    const histories = JSON.parse(localStorage.getItem('messages_sended_history')) || [];
    histories.push(message);
    localStorage.setItem('messages_sended_history', JSON.stringify(histories) );
});



