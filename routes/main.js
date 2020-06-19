const express = require("express");
const router = express.Router();

const alertMessage = require("../helpers/messenger");
const ensureAuthenticated = require("../helpers/auth");

router.get("/", (req, res) => {
	res.render("admin-login")
});

module.exports = router;
