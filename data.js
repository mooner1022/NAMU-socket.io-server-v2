import * as fs from 'fs';

let rooms = [];

function load() {
    try {
        rooms = require('./data.json');
    } catch(e) {
        console.log(e);
    }
}

function addMember(roomName,member) {
    if(!rooms.includes(roomName)) {
        rooms[roomName] = rooms[roomName].push(member);
    }
}

function removeMember(roomName,imageHash) {
    if(rooms.includes(roomName)) {
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

export {addMember,removeMember,load,flush,rooms};