const express = require('express');
const bodyParser = require('body-parser');
const socketio = require('socket.io')
const fs = require('fs');
var app = express();
const options = { 
    key: fs.readFileSync('/etc/letsencrypt/live/server.mooner.dev/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/server.mooner.dev/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/server.mooner.dev/chain.pem')
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let rooms = []

var httpServer = require('http').createServer(app);
var httpsServer = require('https').createServer(options,app);

httpServer.listen(80,()=> {
    console.log('Server is running on port number 80')
});
httpsServer.listen(443,()=> {
    console.log('Server is running on port number 443')
});

/*
var server = app.listen(80,()=>{
    console.log('Server is running on port number 80')
})
*/

var io = socketio();
io.attach(httpServer);
io.attach(httpsServer);

io.on('connection',function(socket) {
    console.log(`Connection : SocketId = ${socket.id}`)
    var userName = '';

    socket.on('subscribe', function(data) {
        console.log('subscribe trigged');
        const room_data = JSON.parse(data);
        userName = room_data.userName;
        const roomName = room_data.roomName;
    
        socket.join(`${roomName}`);
        console.log(`Username : ${userName} joined Room Name : ${roomName}`);
        io.to(`${roomName}`).emit('newUserToChatRoom',userName);
    })

    socket.on('unsubscribe',function(data) {
        console.log('unsubscribe trigged')
        const room_data = JSON.parse(data)
        const userName = room_data.userName;
        const roomName = room_data.roomName;
    
        console.log(`Username : ${userName} leaved Room Name : ${roomName}`)
        socket.broadcast.to(`${roomName}`).emit('userLeftChatRoom',userName)
        socket.leave(`${roomName}`)
    })

    socket.on('newMessage',function(data) {
        console.log('newMessage triggered')
        try {
            const messageData = JSON.parse(data)
            const messageContent = messageData.messageContent
            const roomName = messageData.roomName
    
            console.log(`[Room Number ${roomName}] ${userName} : ${messageContent}`)
            // Just pass the data that has been passed from the writer socket
    
            const chatData = {
                userName : userName,
                messageContent : messageContent,
                roomName : roomName
            }
            socket.broadcast.to(`${roomName}`).emit('updateChat',JSON.stringify(chatData)) // Need to be parsed into Kotlin object in Kotlin
        } catch(e) {
            console.log(e);
        }
    })

    // socket.on('typing',function(roomNumber){ //Only roomNumber is needed here
    //     console.log('typing triggered')
    //     socket.broadcast.to(`${roomNumber}`).emit('typing')
    // })

    // socket.on('stopTyping',function(roomNumber){ //Only roomNumber is needed here
    //     console.log('stopTyping triggered')
    //     socket.broadcast.to(`${roomNumber}`).emit('stopTyping')
    // })

    socket.on('disconnect', function () {
        console.log("One of sockets disconnected from our server.")
    });
})

function addRoom(roomName,members) {
  rooms[roomName] = { _id:`${roomName}`, members:members }
}

function addMember(roomName,member) {
  rooms[roomName].members.push(member)
}

function removeMember(roomName,member) {
  rooms[roomName].members.remove(member)
}

Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
          this.splice(ax, 1);
      }
  }
  return this;
};

module.exports = server; //Exporting for test