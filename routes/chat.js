const express = require("express");
const router = express.Router();
const io = require("socket.io-client");
const alertMessage = require("../helpers/messenger");
const Chat = require("../models/Chat");

const ensureAuthenticated = require("../helpers/auth");

const rooms = []
var request = {}

router.get("/viewRequests", ensureAuthenticated , (req, res) => {
	res.render("chat/viewRequests.handlebars", {
        title: "Chat Requests",
        style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/acceptChat.css" },
        script: { text: "sidemenu-script.js" }
	});
});

router.get("/videoRequests", ensureAuthenticated, (req, res) => {
    res.render("chat/videoRequests.handlebars", {
        title: "Chat Requests",
        style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/acceptChat.css" },
        script: { text: "sidemenu-script.js" }
	});
})

router.get("/room/:room", ensureAuthenticated , (req, res) => {
    console.log(req.user.username);
    var msgList = []
    Chat.findOne({
        where: {
            Ended: false,
            id : req.params.room,
        }
    }) .then(function(room){
            if (!(room)) {
                return res.redirect('/chat/viewRequests')
            } else {
                if(room.StaffID == null || room.StaffID == req.user.id) {
                    if (room.StaffID == null) {
                        Chat.update(
                            { StaffID: req.user.id , StaffName: req.user.username },
                            { where: { id: req.params.room } }
                        )
                    }
                } else {
                    alertMessage(
                        res,
                        "danger",
                        "Only 1 staff allowed per room",
                        "fas fa-exclamation-triangle",
                        true
                    );
                    res.redirect("/chat/viewRequests");
                }
                if (room.Messages != null) {
                    let messages = room.Messages.split('-')
                    for (i=0; i < messages.length; i++) {
                        msgList.push(JSON.parse(messages[i]));
                    }
                }
                res.render("chat/room.handlebars", {
                    title: `Chat Room ${req.params.room}`,
                    style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/room.css" },
                    roomName: req.params.room,
                    username: req.user.username,
                    msgList,
                    script: { text: "sidemenu-script.js" }
                });
            }
    });
});

router.get("/oneroom/:roomid" , ensureAuthenticated , (req, res) => {
    var alert = res.flashMessenger.danger('Only one live support chat can be active at any time');
        //Make the alert box dismissable
        alert.isDismissible = true;
        alert.titleIcon = "fas fa-exclamation-triangle";
        //set an font awesome icon
        alert.addMessage({chatid: req.params.roomid ,type:'return'});
        alert.addMessage({chatid: req.params.roomid ,type: 'delete'});
        res.redirect("/chat/viewRequests");
})

router.get("/redirect/:message" , ensureAuthenticated , (req, res) => {
    if (req.params.message == 'roomend'){
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

router.get("/viewLogs" , ensureAuthenticated , (req, res) => {
    Chat.findAll({
        where:{
            Ended : true,
        },
        raw: true,
    }) .then(chats => {
        res.render("chat/viewLogs.handlebars", {
            title: "Chat Logs",
            style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/acceptChat.css" },
            chats : chats,
            script: { text: "sidemenu-script.js" }
        });
    })
})

router.get("/log/:id" , ensureAuthenticated , (req, res) => {
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
        title: `Chat Log ${req.params.id}`,
		style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/room.css" },
        roomName: req.params.room,
        msgList,
        script: { text: "sidemenu-script.js" }
    });
});

router.get("/test" , (req , res) => {
    res.render("chat/videoChatcopy.handlebars", {
        style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/styles.css" },
    })
})

router.get("/videoRoom/:room", ensureAuthenticated, (req, res) => {
    // if (!(req.user)){
    //     return res.redirect('/chat/videoRequests')
    // }
    res.render("chat/videoChat.handlebars", {
        title: `Chat Room ${req.params.room}`,
        style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "chat/video.css" },
        roomName: req.params.room,
        username: req.user.username,
        script: { text: "sidemenu-script.js" }
    });
});
module.exports = router;

router.get("/ended" , ensureAuthenticated , (req, res) => {
    var alert = res.flashMessenger.danger('Live video chat has ended');
        //Make the alert box dismissable
        alert.isDismissible = true;
        alert.titleIcon = "fas fa-exclamation-triangle";
        //set an font awesome icon
        res.redirect("/chat/videoRequests");
})

router.get("/error" , ensureAuthenticated , (req, res) => {
    var alert = res.flashMessenger.danger("Room does not exist");
        //Make the alert box dismissable
        alert.isDismissible = true;
        alert.titleIcon = "fas fa-exclamation-triangle";
        //set an font awesome icon
        res.redirect("/chat/videoRequests");
})