const fs = require('fs');

let rooms = {};

function load() {
    try {
        rooms = require('./data.json');
    } catch(e) {
        console.log(e);
    }
}

function addMember(roomName,member) {
    if(!rooms.hasOwnProperty(roomName)) {
        var aJson = new Object();
        aJson.name = member.name;
        aJson.imageHash = member.imageHash;
        rooms[roomName].push(aJson);
    }
}

function removeMember(roomName,imageHash) {
    if(rooms.hasOwnProperty(roomName)) {
        let room = rooms[roomName];
        for( var i = 0; i < room.length; i++){ 
            if (room[i].imageHash == imageHash) { 
                rooms[room].splice(i, 1); 
            }
        }
    }
}

function flush() {
    let data = JSON.stringify(rooms);
    fs.writeFileSync('./data.json', data);
}

module.exports = {addMember,removeMember,load,flush,rooms};