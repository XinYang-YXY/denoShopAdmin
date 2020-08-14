const express = require("express");
const router = express.Router();
const passport = require("passport");

const alertMessage = require("../helpers/messenger");
const ensureAuthenticated = require("../helpers/auth");

const Order = require("../models/Order");

router.get("/", (req, res) => {
    res.render("admin-login", {
        title: "Denoshop Admin"
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/analytics/', // Route to /video/listVideos URL
        failureRedirect: '/', // Route to /login URL
        failureFlash: true
        /* Setting the failureFlash option to true instructs Passport to flash an error message using the
message given by the strategy's verify callback, if any. When a failure occur passport passes the message
object as error */
    })(req, res, next);
});

router.get("/error", (req, res) => {
    res.render("error");
});

module.exports = router;
