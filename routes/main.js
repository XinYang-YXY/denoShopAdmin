const express = require("express");
const router = express.Router();

const alertMessage = require("../helpers/messenger");
const ensureAuthenticated = require("../helpers/auth");

router.get("/", (req, res) => {
	res.render("admin-login")
});

router.get('/order-history', (req, res) => {
    res.render('order-history', {
        title: "Order History",
        order: orderData,
        style: { sidemenu: "sidemenu-styling.css" },
        script: { sidemenu: "sidemenu-script.js" }
    });
});

module.exports = router;
