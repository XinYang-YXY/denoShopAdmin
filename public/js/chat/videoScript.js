const socket = io.connect("http://localhost:5500",
	{reconnect: true}
);

const requestTable = document.getElementById('requestTable')

if (requestTable != null){
  console.log('OKKKKKKKKKKKKKKKKKKKKKK')
  socket.emit('requestRequest');
  socket.on('currentRequest', requests =>{
      requests.forEach(appendRequest);
  })
} else {
  socket.emit('new-staff', roomName , username)
  let isAlreadyCalling = false;
  let getCalled = false;

  const existingCalls = [];

  const { RTCPeerConnection, RTCSessionDescription } = window;

  const peerConnection = new RTCPeerConnection();

  // function unselectUsersFromList() {
  //   const alreadySelectedUser = document.querySelectorAll(
  //     ".active-user.active-user--selected"
  //   );

  //   alreadySelectedUser.forEach(el => {
  //     el.setAttribute("class", "active-user");
  //   });
  // }

  // function createUserItemContainer(socketId) {
  //   const userContainerEl = document.createElement("div");

  //   const usernameEl = document.createElement("p");

  //   userContainerEl.setAttribute("class", "active-user");
  //   userContainerEl.setAttribute("id", socketId);
  //   usernameEl.setAttribute("class", "username");
  //   usernameEl.innerHTML = `Socket: ${socketId}`;

  //   userContainerEl.appendChild(usernameEl);

  //   userContainerEl.addEventListener("click", () => {
  //     unselectUsersFromList();
  //     userContainerEl.setAttribute("class", "active-user active-user--selected");
  //     const talkingWithInfo = document.getElementById("talking-with-info");
  //     talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
  //     callUser(socketId);
  //   });

  //   return userContainerEl;
  // }

  async function callUser() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    console.log('it works')

    socket.emit("call-user", {
      offer,
      to: socketId
    });
  }

  // function updateUserList(socketIds) {
  //   const activeUserContainer = document.getElementById("active-user-container");

  //   socketIds.forEach(socketId => {
  //     const alreadyExistingUser = document.getElementById(socketId);
  //     if (!alreadyExistingUser) {
  //       const userContainerEl = createUserItemContainer(socketId);

  //       activeUserContainer.appendChild(userContainerEl);
  //     }
  //   });
  // }

  // socket.on("update-user-list", ({ users }) => {
  //   updateUserList(users);
  // });

  // socket.on("remove-user", ({ socketId }) => {
  //   const elToRemove = document.getElementById(socketId);

  //   if (elToRemove) {
  //     elToRemove.remove();
  //   }
  // });

  socket.on("call-made", async data => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("make-answer", {
      answer,
      to: data.socket
    });
  });

  socket.on("answer-made", async data => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );

    if (!isAlreadyCalling) {
      callUser(data.socket);
      isAlreadyCalling = true;
    }
  });

  socket.on("Error", function(){
    window.location.href = `http://www.localhost:5000/chat/error`;
  })

  socket.on("ended", function(){
    window.location.href = `http://www.localhost:5000/chat/ended`;
  })


  socket.on('clientName', name=> {
    const message = document.getElementById('messageo')
    message.innerText = `You are now connected to client, ${name}`
  })

  // socket.on("call-rejected", data => {
  //   alert(`User: "Socket: ${data.socket}" rejected your call.`);
  //   unselectUsersFromList();
  // });

  peerConnection.ontrack = function({ streams: [stream] }) {
    const remoteVideo = document.getElementById("remote-video");
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  };

  navigator.getUserMedia(
    { video: true, audio: true },
    stream => {
      const localVideo = document.getElementById("local-video");
      if (localVideo) {
        localVideo.srcObject = stream;
      }

      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    },
    error => {
      console.warn(error.message);
    }
  );
}

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
  acceptButton.onclick = function() {window.location.href = `http://localhost:5000/chat/videoRoom/${request[8]}`};
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