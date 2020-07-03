const mySQLDB = require("./DBConfig");

// Import all the models
const user = require("../models/User");
const purchaseRecord = require("../models/PurchaseRecord");
const cartItem = require("../models/CartItem");
const hackingProduct = require("../models/HackingProduct");
const productStats = require("../models/ProductStats");
const productRating = require("../models/ProductRatings");
const userRating = require("../models/UserRating");
const deliveryInfo = require("../models/DeliveryInfo");
// Import all the models

const setUpDB = (drop) => {
	mySQLDB
		.authenticate()
		.then(() => {
			console.log("Denoshop DB is connected!");
		})
		.then(() => {
			user.hasMany(purchaseRecord); // Define relationship
			user.hasMany(cartItem);
			user.hasMany(deliveryInfo);

			// Product-Stats Relation
			hackingProduct.hasMany(productStats);
			productStats.belongsTo(hackingProduct);

			// Product-Rating Relation
			hackingProduct.hasMany(productRating);
			productRating.belongsTo(hackingProduct);

			// Product-UserRating Relation
			hackingProduct.hasMany(userRating);
			userRating.belongsTo(hackingProduct);

			// User-UserRating Relation
			user.hasMany(userRating);
			userRating.belongsTo(user);
			
			mySQLDB
				.sync({
					// Creates table if none exists
					force: drop,
				})
				.then(() => {
					console.log("Creates tables if none exists");
				})
				.catch((err) => console.log(err));
		})
		.catch((err) => console.log("Error: " + err));
};

module.exports = { setUpDB };