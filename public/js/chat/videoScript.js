const socket = io.connect("https://denoshopvideoserver.herokuapp.com/",
	{reconnect: true}
);

const requestTable = document.getElementById('requestTable')

if (requestTable != null){
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

  async function callUser() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    console.log('it works')

    socket.emit("call-user", {
      offer,
      to: socketId
    });
  }

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
    window.location.href = `${window.origin}/chat/error`;
  })

  socket.on("ended", function(){
    window.location.href = `${window.origin}/chat/ended`;
  })


  socket.on('clientName', name=> {
    const message = document.getElementById('messageo')
    message.innerText = `You are now connected to client, ${name}`
  })

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
  acceptButton.onclick = function() {window.location.href = `${window.origin}/chat/videoRoom/${request[8]}`};
  acceptButton.innerText = 'Join room'
  buttonsElement.append(acceptButton);
  const deleteButton = document.createElement('button');
  deleteButton.className= 'btn btn-danger';
  deleteButton.innerText = 'Delete room'
  deleteButton.onclick = function() {socket.emit('close-vidroom',request[8]);
      location.reload();
  };
  buttonsElement.append(deleteButton);
  tableRow.append(buttonsElement);
  requestTable.append(tableRow);
}