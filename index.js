const express = require('express');
const bodyParser = require('body-parser');
const socketio = require('socket.io')
var app = express();

// parse application/x-www-form-urlencoded
// { extended: true } : support nested object
// Returns middleware that ONLY parses url-encoded bodies and 
// This object will contain key-value pairs, where the value can be a 
// string or array(when extended is false), or any type (when extended is true)
app.use(bodyParser.urlencoded({ extended: true }));

//This return middleware that only parses json and only looks at requests where the Content-type
//header matched the type option. 
//When you use req.body -> this is using body-parser cause it is going to parse 
// the request body to the form we want
app.use(bodyParser.json());

let rooms = []

var server = app.listen(3000,()=>{
    console.log('Server is running on port number 3000')
})

//Chat Server
var io = socketio(server);

io.on('connection',function(socket) {

    //The moment one of your client connected to socket.io server it will obtain socket id
    //Let's print this out.
    console.log(`Connection : SocketId = ${socket.id}`)
    //Since we are going to use userName through whole socket connection, Let's make it global.   
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