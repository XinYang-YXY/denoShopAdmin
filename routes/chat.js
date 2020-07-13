const express = require("express");
const router = express.Router();
const io = require("socket.io-client");
const alertMessage = require("../helpers/messenger");
const Chat = require("../models/Chat");

const rooms = []
var request = {}

router.get("/viewRequests", (req, res) => {
	res.render("chat/viewRequests.handlebars", {
        style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/acceptChat.css" },
	});
});

router.get("/room/:room", (req, res) => {
    var msgList = []
    Chat.findOne({
        where: {
            Ended: false,
            id : req.params.room,
        },
        attributes: ['Messages'],
    }) .then(function(room){
        if (room) {
            if (room.Messages != null) {
                let messages = room.Messages.split('-')
                for (i=0; i < messages.length; i++) {
                    msgList.push(JSON.parse(messages[i]));
                }
            } 
        } else {
            return res.redirect('/chat')
        }
    });
	res.render("chat/room.handlebars", {
		style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/room.css" },
        roomName: req.params.room,
        msgList,
    });
});

router.get("/redirect/:message" , (req, res) => {
    if (req.params.message == 'oneroom') {
        alertMessage(
            res,
            "danger",
            "Only one live support chat can be active at any time",
            "fas fa-exclamation-triangle",
            true
        ); 
    } else if (req.params.message == 'roomend'){
        alertMessage(
            res,
            "danger",
            "Chat has ended",
            "fas fa-exclamation-triangle",
            true
        );
    } else if (req.params.message == 'error'){
        alertMessage(
            res,
            "danger",
            "Chat doesn't exist",
            "fas fa-exclamation-triangle",
            true
        );
    }
    res.redirect("/chat/viewRequests");
})

router.get("/viewLogs" , (req, res) => {
    Chat.findAll({
        where:{
            Ended : true,
        },
        raw: true,
    }) .then(chats => {
        res.render("chat/viewLogs.handlebars", {
            style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/acceptChat.css" },
            chats : chats
        });
    })
})

router.get("/log/:id" , (req, res) => {
    var msgList = []
    Chat.findOne({
        where: {
            Ended: true,
            id : req.params.id,
        },
        attributes: ['Messages'],
    }) .then(function(room){
        if (room) {
            if (room.Messages != null) {
                let messages = room.Messages.split('-')
                for (i=0; i < messages.length; i++) {
                    msgList.push(JSON.parse(messages[i]));
                }
            } 
        } else {
            return res.redirect('/chat')
        }
    });
	res.render("chat/log.handlebars", {
		style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/room.css" },
        roomName: req.params.room,
        msgList,
    });
});
module.exports = router;
