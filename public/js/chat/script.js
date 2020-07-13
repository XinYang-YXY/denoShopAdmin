const socket = io.connect("http://localhost:8000",
	{reconnect: true}
);

let options = {
    timeZone: 'Singapore',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  },
formatter = new Intl.DateTimeFormat(('en-GB'), options);

const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

const requestTable = document.getElementById('requestTable')

if (messageForm != null) {
    const dateTime = formatter.format(new Date())
    socket.emit('new-user',roomName ,'staff', 'staffJoin', dateTime) 

    messageForm.addEventListener('submit',e => {
        const dateTime = formatter.format(new Date())
        e.preventDefault()
        const message = messageInput.value
        appendOwnMessage(message,dateTime)
        socket.emit('send-chat-message', roomName ,message, dateTime, 'staff')
        messageInput.value = ''
    })

    endButton.addEventListener('click', function(){
        socket.emit('close-room',roomName)
    })
} else if (requestTable != null){
    socket.emit('requestRequest');
    socket.on('currentRequest', requests =>{
        requests.forEach(appendRequest);
    })
}

socket.on('chat-message', data=> {
    appendSenderMessage(data.message , data.dateTime)
})

socket.on('user-connected', data=> {
    appendConnectionMessage(data.message, data.dateTime)
})

socket.on('user-disconnected', data=> {
    appendConnectionMessage(data.message, data.dateTime)
})

socket.on('oneroom' , roomid => {
    window.location.href = `http://www.localhost:5000/chat/oneroom/${roomid}`;
})

socket.on('redirect', message => {
    if (message == 'roomend'){
        window.location.href = "http://www.localhost:5000/chat/redirect/roomend";
    } else if (message == 'error'){
        window.location.href = "http://www.localhost:5000/chat/redirect/error";
    }
})


function appendRequest(request) {
    const tableRow = document.createElement('tr');
    tableRow.className = 'row ml-4 mr-4';
    for (i = 0; i < request.length-2; i++) {
        const requestElement = document.createElement('td');
        requestElement.className = 'col';
        requestElement.innerText = request[i];
        tableRow.append(requestElement);
    }
    const tickElement = document.createElement('td');
    tickElement.className = 'col';
    if (request[7] == true){
        tickElement.innerHTML = '<i class="fas fa-check"></i>'
    }
    tableRow.append(tickElement);
    
    const buttonsElement = document.createElement('td');
    buttonsElement.className = 'col';
    const acceptButton = document.createElement('button');
    acceptButton.className = 'btn btn-success mr-2';
    acceptButton.onclick = function() {window.location.href = `http://localhost:5000/chat/room/${request[8]}`};
    acceptButton.innerText = 'Join room'
    buttonsElement.append(acceptButton);
    const deleteButton = document.createElement('button');
    deleteButton.className= 'btn btn-danger';
    deleteButton.innerText = 'Delete room'
    deleteButton.onclick = function() {socket.emit('close-room',request[8]);
        location.reload();
    };
    buttonsElement.append(deleteButton);
    tableRow.append(buttonsElement);
    requestTable.append(tableRow);
}

function appendSenderMessage(message , dateTime) {
    const messageDiv = document.createElement('div')
    messageDiv.className = "media-body w-50 mb-3"
    const messageWrap = document.createElement('div')
    messageWrap.className = "bg-light rounded py-2 px-3 mb-2"
    const messageElement = document.createElement('p')
    messageElement.className = "text-small mb-0 text-dark"
    messageElement.innerText = message
    messageWrap.append(messageElement)
    messageDiv.append(messageWrap)
    timeElement = document.createElement('p')
    timeElement.className = "small text-muted"
    timeElement.innerText = dateTime
    messageDiv.append(timeElement)
    messageContainer.append(messageDiv)
}

function appendOwnMessage(message , dateTime) {
    const messageDiv = document.createElement('div')
    messageDiv.className = "media w-50 ml-auto mb-3"
    const mediaDiv = document.createElement('div')
    mediaDiv.className = "media-body"
    const messageWrap = document.createElement('div')
    messageWrap.className = "bg-primary rounded py-2 px-3 mb-2"
    const messageElement = document.createElement('p')
    messageElement.className = "text-small mb-0 text-white"
    messageElement.innerText = message
    messageWrap.append(messageElement)
    mediaDiv.append(messageWrap)
    timeElement = document.createElement('p')
    timeElement.className = "small text-muted"
    timeElement.innerText = dateTime
    mediaDiv.append(timeElement)
    messageDiv.append(mediaDiv)
    messageContainer.append(messageDiv)
}

function appendConnectionMessage(message , dateTime) {
    const messageDiv = document.createElement('div')
    const para = document.createElement('p')
    para.className = "small font-italic text-muted"
    para.innerHTML = `${message} <br> ${dateTime}`
    messageDiv.append(para)
    messageContainer.append(messageDiv)
}

// socket.on("connect", function(){
//     socket.emit('new-room', roomName , reqName , reqEmail , reqPhone , reqDepartment , reqDesc , reqUrgent);
// });

// socket.on("seq-num", (msg) => console.info(msg));