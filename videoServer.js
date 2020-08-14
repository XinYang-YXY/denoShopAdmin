const
    io = require("socket.io"),
    server = io.listen(5500);

let rooms = {};
    requests = [];

// event fired every time a new client connects:
server.on("connection", (socket) => {
    socket.on('new-room', (userID ,reqName , reqEmail , reqPhone , reqDepartment , reqDesc , reqUrgent ,dateTime) => {
        console.log("OKKKKK")
        requests.push([dateTime ,userID, reqName , reqEmail , reqPhone , reqDepartment , reqDesc , reqUrgent , userID]);
        rooms[userID] = { users: {} , position: {}}
        socket.emit('redirectRoom', userID)
    });

    socket.on('new-client' , (room, name) =>{
        if (!(rooms[room])) {
            socket.emit('Error')
        } else {
            rooms[room].users[socket.id] = name
            rooms[room].position[socket.id] = 'client'
            socket.join(room)
        }
    })

    socket.on('new-staff', (room , name) => {
        if (!(rooms[room])) {
            socket.emit('Error')
        } else {
            var usersInRoom = server.of('/').in(room).clients((err , clients) => {
                console.log(clients)
                socket.emit('clientName',rooms[room].users[clients[0]])
            })
            socket.to(room).broadcast.emit('connecteded',socket.id)
            socket.to(room).broadcast.emit('staffName',name)
            socket.join(room)
            // var usersInRoom = server.of('/').in(room).clients((err , clients) => {
            //     console.log(clients)
            // })
            rooms[room].users[socket.id] = name
            rooms[room].position[socket.id] = 'client'
            requests.forEach(function(request, index, object) {
                if (request[8] == room) {
                    object.splice(index, 1);
                }
            });
        }
    })

    socket.on('requestRequest', function(){
        console.log(requests)
        socket.emit('currentRequest',requests)
    })

    socket.on('close-room', function(){
        
    })
    
    socket.on("call-user", data => {
        socket.to(data.to).emit("call-made", {
          offer: data.offer,
          socket: socket.id
        });
    });

    socket.on("make-answer", data => {
        socket.to(data.to).emit("answer-made", {
          socket: socket.id,
          answer: data.answer
        });
    });

    socket.on('disconnect', function(){
        getUserRooms(socket).forEach(room=>{
            requests.forEach(function(request, index, object) {
                if (request[8] == room) {
                    object.splice(index, 1);
                }
            });
            delete rooms[room]
            socket.to(room).broadcast.emit('ended')
        })
    })

    function getUserRooms(socket) {
        return Object.entries(rooms).reduce((names, [name, room]) => {
          if (room.users[socket.id] != null) names.push(name)
          return names
        }, [])
      }
    
//     socket.on('staffJoin', (room, name, position, dateTime) => {
//         if (position == 'clientJoin') {
//             var msg = `You are now connected to customer ${name}`
//         } else if (position == 'staffJoin') {
//             var msg = `You are now connected to ${name} from Deno Shop`
//         }
//         socket.join(room)
//         rooms[room].users[socket.id] = name
//         rooms[room].position[socket.id] = position
//         Chat.findOne({
//             where: {
//                 id : room,
//             },
//             attributes: ['Messages'],
//         }).then((chat) => {
//             if (chat) {
//                 if(chat.Messages == null) {
//                     var msgLog = {position : position , message : msg , dateTime : dateTime}
//                     var msgLogStr = JSON.stringify(msgLog)
//                 } else {
//                     var msgLog = chat.Messages.split('-');
//                     var msgStr = JSON.stringify({position : position , message : msg , dateTime : dateTime});
//                     msgLog.push(msgStr);
//                     var msgLogStr = msgLog.join("-")
//                 }
//                 Chat.update(
//                     { Messages: msgLogStr },
//                     { where: { id: room } }
//                 ) 
//             }
//         })
//         socket.nsp.to(room).emit('user-connected', {message: msg , dateTime : dateTime})
//     });

//     socket.on('disconnect', () => {
//         getUserRooms(socket).forEach(room => {
//             var date = formatter.format(new Date());
//             var dateSplit =date.split(',')
//             var dateSwap = dateSplit[0].split(' ')
//             var temp  = dateSwap[0]
//             dateSwap[0] = dateSwap[1]
//             dateSwap[1] = temp
//             var swapped = dateSwap.join(' ')
//             dateSplit[1] = swapped+dateSplit[1]
//             dateSplit.splice(0,1)
//             var dateTime = dateSplit.join(',')
//             var name = rooms[room].users[socket.id]
//             autoDeleteRoom(room);
//             if (rooms[room].position[socket.id] == 'clientJoin') {
//                 var position = 'clientLeave'
//                 var msg = `User ${name} has disconnected`
//             } else {
//                 var position = 'staffLeave'
//                 var msg = `${name} from Deno Shop has disconnected`
//             }
//             Chat.findOne({
//                 where: {
//                     id : room,
//                 },
//                 attributes: ['Messages'],
//             }).then((chat) => {
//                 if (chat) {
//                     if(chat.Messages == null) {
//                         var msgLog = {position : position , message : msg , dateTime : dateTime}
//                         var msgLogStr = JSON.stringify(msgLog)
//                     } else {
//                         var msgLog = chat.Messages.split('-');
//                         var msgStr = JSON.stringify({position : position , message : msg , dateTime : dateTime});
//                         msgLog.push(msgStr);
//                         var msgLogStr = msgLog.join("-")
//                     }
//                     Chat.update(
//                         { Messages: msgLogStr },
//                         { where: { id: room } }
//                     )
//                 }
//             })
//             socket.to(room).broadcast.emit('user-disconnected', {message: msg , dateTime : dateTime})
//             })
//         })


//     socket.on('send-chat-message', (room, message , dateTime , position) => {
//         Chat.findOne({
//             where: {
//                 id : room,
//             },
//             attributes: ['Messages'],
//         }).then((chat) => {
//             if (chat) {
//                 if(chat.Messages == null) {
//                     var msgLog = {position : position , message : message , dateTime : dateTime}
//                     var msgLogStr = JSON.stringify(msgLog)
//                 } else {
//                     // var list = []
//                     var msgLog = chat.Messages.split('-');
//                     // for (i=0; i < msgLog.length; i++) {
//                     //     msgLog[i] = JSON.parse(msgLog[i])
//                     // }
//                     var msgStr = JSON.stringify({position : position , message : message , dateTime : dateTime});
//                     msgLog.push(msgStr);
//                     var msgLogStr = msgLog.join("-")
//                 }
//                 Chat.update(
//                     { Messages: msgLogStr },
//                     { where: { id: room } }
//                 )
//             }
//             // msgLog = JSON.parse(chat.Messages);
//             // console.log(msgLog);
//             // msgLog.append({black:'OK'});
//             // console.log(msgLog);
//             // msgLog.push({position:"client",msg : message});
//             // chat.updateAttribute({
//             //     Messages : msgLog
//             // })
//         })
//         socket.to(room).broadcast.emit('chat-message', { message: message, dateTime: dateTime })
//       });

//     socket.on('requestRequest', function(){
//         socket.emit('currentRequest',requests)
//     })

//     socket.on('close-room', room => {
//         delete rooms[room]
//         Chat.update(
//             { Ended : true },
//             { where: { id: room } }
//         )
//         requests.forEach(function(request, index, object) {
//             if (request[8] == room) {
//               object.splice(index, 1);
//             }
//           });
//         // delete rooms[room].users[socket.id]
//         // delete rooms[room].position[socket.id]
//         socket.nsp.to(room).emit('redirect', 'roomend')
//     })

//     socket.on('chatbotMsg',(userid,Message) => {
//         request.post('http://localhost:6900/denoshop-aucqns/us-central1/dialogflowGateway', {
//             json: {
//                 sessionId : String(userid),
//                 queryInput: {
//                   text: {
//                     text: String(Message),
//                     languageCode: "en-US"
//                   }
//                 }
//               }
//             }, (error, res, body) => {
//                 if (error) {
//                     console.error(error)
//                     return
//                 } else {
//                     socket.emit('chatbotReply', body.fulfillmentText)
//                 }
//             })
//     })

// });

// function getUserRooms(socket) {
//     return Object.entries(rooms).reduce((names, [name, room]) => {
//       if (room.users[socket.id] != null) names.push(name)
//       return names
//     }, [])
//   }

// function autoDeleteRoom(room) {
//     var usersInRoom = server.of('/').in(room).clients((err , clients) => {
//         if(clients.length == 0) {
//             setTimeout(function(){
//                 if(clients.length == 0) {
//                     delete rooms[room]
//                     Chat.update(
//                         { Ended : true },
//                         { where: { id: room } }
//                     )
//                     requests.forEach(function(request, index, object) {
//                         if (request[8] == room) {
//                             object.splice(index, 1);
//                         }
//                     });
//                 console.log('Room deleted after 5 minutes.')
//                 }
//             }, 300000)
//         }
//     });
// }
});