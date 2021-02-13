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
        var aJsonArray = new Array();
        var aJson = new Object();
        aJson.name = member.name;
        aJson.imageHash = member.imageHash;
        aJsonArray.push(aJson);
        rooms[roomName] = aJsonArray;
    } else {
        var aJson = new Object();
        aJson.name = member.name;
        aJson.imageHash = member.imageHash;
        rooms[roomName].push(aJson);
    }
    flush();
}

function removeMember(roomName,imageHash) {
    if(rooms.hasOwnProperty(roomName)) {
        let room = rooms[roomName];
        var aJsonArray = new Array();
        for( var i = 0; i < room.length; i++) { 
            if (room[i].imageHash != imageHash) { 
                aJsonArray.push(room[i])
            }
        }
        if(aJsonArray.length <= 0) {
            delete rooms.roomName
        } else {
            rooms[roomName] = aJsonArray;
        }
        flush();
    }
}

function getMembersString(roomName) {
    if(rooms.hasOwnProperty(roomName)) {
        let room = rooms[roomName];
        if(room.length == 0) return null;
        return JSON.stringify(room);
    }
    return null;
}

function flush() {
    let data = JSON.stringify(rooms);
    fs.writeFileSync('./data.json', data);
}

module.exports = {addMember,removeMember,getMembersString,load,flush,rooms};