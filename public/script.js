const socket = io("/");

let eventDispatch = document.querySelector("#event_dispatch");
let messagesSended = document.querySelector("#messages_sended");
let clearHistory = document.querySelector("#clear_history");
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

const selectFromHistoryByKey = (key,action='select') => {
    let history = localStorage.getItem('messages_sended_history');
    if(!!history){
      history = JSON.parse(history);
      const find =history.find(f => f.key === key);
      switch (action){
          case "select":
              eventDispatch.value = find.event;
              text.value = find.value;
              break;
          case "reload":
              // socket.emit(find.event.trim(), find.value.replace(/(\r\n|\n|\r)/g, '').trim());
              socket.emit('internal_message', {
                  event: find.event.trim(),
                  key: find.key,
                  date: find.date,
                  value: find.value.replace(/(\r\n|\n|\r)/g, '').trim() //Todo Clear all invalid caracter \
              });
              break;
          case "delete":
              history = history.filter( h => h.key !== key);
              localStorage.setItem('messages_sended_history', JSON.stringify(history));
              buildHistoryMessage();
              break;

      }

    }
}

const initSubscriptionAction = () => {
    document.querySelectorAll('.action-reload').forEach(elm => {
        elm.addEventListener("click", (event) => {
            const key = event.target.getAttribute("title");
            selectFromHistoryByKey(key,'reload');
        });
    });
    document.querySelectorAll('.action-delete').forEach(elm => {
        elm.addEventListener("click", (event) => {
            const key = event.target.getAttribute("title");
            selectFromHistoryByKey(key,'delete');
        });
    });
}


// onclick="${selectFromHistory(ev.date)}"
const buildMessage = (ev) => {
    return `<div class="message">
<span class="message__header">
<strong><i class="far fa-arrow-alt-circle-right"></i></strong>
 Event Name: 
  <strong> ${(!!ev.event) ? ev.event : 'UNKNOWN'}</strong>- <i> ${ev.date}</i>  <i title="${ev.key}" class="fas fa-trash-alt action-delete" ></i><i title="${ev.key}" class="fa fa-repeat repeat action-reload" ></i></span>        
 <code>${ev.value}</code>
    </div>`;
}
const buildHistoryMessage = () => {
    messagesSended.innerHTML = ''
    let history = JSON.parse(localStorage.getItem('messages_sended_history'));
    if (!!history) {
        history = history.reverse();
        history.map(ev => {
            messagesSended.innerHTML =
                messagesSended.innerHTML +
                buildMessage(ev)
        })
        initSubscriptionAction();
    } else {
        messagesSended.innerHTML = '';
    }

}
buildHistoryMessage();

clearHistory.addEventListener("click", (e) => {
    const history = localStorage.getItem('messages_sended_history');
    if (!!history) {
        localStorage.removeItem('messages_sended_history');
        buildHistoryMessage();
    }
});

send.addEventListener("click", (e) => {
    const eventName = !!eventDispatch.value ? eventDispatch.value.trim() : null;
    if (text.value.length !== 0) {
        if (!!eventName) {
            socket.emit(eventName, text.value);
        }
        socket.emit('internal_message', {
            event: eventName,
            key: Date.now().toString(),
            date: new Date(Date.now()).toUTCString(),
            value: text.value.replace(/(\r\n|\n|\r)/g, '').trim() //Todo Clear all invalid caracter \
        });
        // text.value = "";
    }
});


// text.addEventListener("keydown", (e) => {
//     if (e.key === "Enter" && text.value.length !== 0) {
//         const eventName = !!eventDispatch.value ? eventDispatch.value : null;
//         if (!!eventName) {
//             socket.emit(eventName, text.value);
//         }
//         socket.emit('internal_message', {
//             event: eventName,
//             key: Date.now().toString(),
//             date: new Date(Date.now()).toUTCString(),
//             value: text.value.replace(/(\r\n|\n|\r)/g, '').trim()
//         });
//         text.value = "";
//     }
// });


socket.on("createMessage", (message, userName) => {
    const histories = JSON.parse(localStorage.getItem('messages_sended_history')) || [];
    const find = histories.find(f => f.key === message.key);
    if(!find){
        histories.push(message);
        localStorage.setItem('messages_sended_history', JSON.stringify(histories));
        buildHistoryMessage();
    }

});


socket.on("errorMessage", (message) => {
    alert(message);
});

