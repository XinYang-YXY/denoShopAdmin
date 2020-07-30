const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const UserRating = db.define("UserRating", {
	date: {
		type: Sequelize.DATE,
	},
	comment: {
		type: Sequelize.STRING(2000),
	},
	rating: {
		type: Sequelize.FLOAT,
	},
	deltaContent: {
		type: Sequelize.TEXT
	},
});

module.exports = UserRating;
