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
const dataManager = require('./data');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//dataManager.load();

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

    socket.on('subscribe', function(data) {
        const room_data = JSON.parse(data);
        const userName = room_data.userName;
        const roomName = room_data.roomName;
        const imageHash = room_data.imageHash;

        const chatData = {
            userName : userName,
            roomName : roomName
        }
    
        socket.join(`${roomName}`);
        console.log(`Username : ${userName} joined Room Name : ${roomName}`);
        io.to(`${roomName}`).emit('newUserToChatRoom',JSON.stringify(chatData));
        dataManager.addMember(roomName,{
            name : userName,
            imageHash : imageHash
        });
    })

    socket.on('unsubscribe',function(data) {
        const room_data = JSON.parse(data);
        const userName = room_data.userName;
        const roomName = room_data.roomName;
        const imageHash = room_data.imageHash;
    
        const chatData = {
            userName : userName,
            roomName : roomName
        };

        console.log(`Username : ${userName} leaved Room Name : ${roomName}`);
        socket.broadcast.to(`${roomName}`).emit('userLeftChatRoom',JSON.stringify(chatData));
        socket.leave(`${roomName}`);
        dataManager.removeMember(roomName,imageHash);
    })

    socket.on('getMembers',function(data) {
        console.log('getMembers trigged');
        const room_data = JSON.parse(data);
        const roomName = room_data.roomName;
        const requestCode = room_data.requestCode;

        const members = dataManager.getMembersString(roomName);
        socket.broadcast.to(`${requestCode}`).emit('response',members==null?[]:members);
        console.log('members '+members+' emitted to '+requestCode);
    })

    socket.on("private_message", (anotherSocketId, msg) => {
        socket.to(anotherSocketId).emit("private_message", socket.id, msg);
    });

    socket.on('newMessage',function(data) {
        try {
            const messageData = JSON.parse(data)
            const userName = messageData.userName;
            const messageContent = messageData.messageContent
            const roomName = messageData.roomName
    
            console.log(`[Room Number ${roomName}] ${userName} : ${messageContent}`)
            // Just pass the data that has been passed from the writer socket
    
            const chatData = {
                userName : userName,
                messageContent : messageContent,
                roomName : roomName
            }
            socket.broadcast.to(`${roomName}`).emit('updateChat',JSON.stringify(chatData))
        } catch(e) {
            console.log(e);
        }
    })

    // socket.on('typing',function(roomNumber){
    //     console.log('typing triggered')
    //     socket.broadcast.to(`${roomNumber}`).emit('typing')
    // })

    // socket.on('stopTyping',function(roomNumber){
    //     console.log('stopTyping triggered')
    //     socket.broadcast.to(`${roomNumber}`).emit('stopTyping')
    // })

    socket.on('disconnect', function () {
        console.log("One of sockets disconnected from our server.")
    });
})

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

//module.exports = server;