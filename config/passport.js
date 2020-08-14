const LocalStrategy = require("passport-local").Strategy; // Get the local strategy
const bcrypt = require("bcryptjs"); // Use to compare the salted password
const Admin = require("../models/Admin"); 

function localStrategy(passport) {
	passport.use(
		new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
			console.log(email, password)
			Admin.findOne({ where: { email: email } }).then((admin) => {
				console.log(admin)
				// If admin not found
				if (!admin) return done(null, false, { message: "No User Found" })
				
				// If admin found
				bcrypt.compare(password, admin.password, (err, isMatch) => {
					if (err) throw err; // If any unexpected err happened
					if (isMatch) {
						return done(null, admin); // If matched return the admin, the admin object will also be set into req.admin for app to retrieve admin object. referring to index.js
					} else {
						return done(null, false, { message: "Password Incorrect" }) // If admin is not found
					}
				});
			});
		}
			// Creating a method to find,compare and return
		)
	);

	// When admin is authenticated
	//
	// Serializes (stores) admin id into session which is stored in the session table of mysql upon successful authentication
	passport.serializeUser((admin, done) => {
		done(null, admin.id); // admin.id used to identify authenticated admin
	});

	// User object is retrieved by userId from session for every subsequent admin request if passport finds a admin object in the session table
	// Passport then passes userId
	passport.deserializeUser((userId, done) => {
		Admin.findByPk(userId)
			.then((admin) => {
				done(null, admin); // admin object saved in req.session - set admin object into req.admin
			})
			.catch((done) => {
				console.log(done); // No admin found, not stored in req.session
			});
	});
}

module.exports = { localStrategy };
