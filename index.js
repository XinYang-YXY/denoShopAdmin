/*
 * 'require' is similar to import used in Java and Python. It brings in the libraries required to be used
 * in this JS file.
 * */
const express = require("express");
const session = require("express-session");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override"); // Override POST method to PUT
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

const flash = require("connect-flash");
const FlashMessenger = require("flash-messenger");

const passport = require("passport"); // User authentication with passport

// mySQL
const denoShopDB = require("./config/DBConnection");
denoShopDB.setUpDB(false);

const authenticate = require("./config/passport"); // Passport Config
authenticate.localStrategy(passport); // Using Local Strategy with infp passport.js in config

// mySQL session
const MySQLStore = require("express-mysql-session");
const db = require("./config/db");

// env file
require("dotenv").config();
/*
 * Loads routes file main.js in routes directory. The main.js determines which function
 * will be called based on the HTTP request and URL.
 */
const mainRoute = require("./routes/main");
const analyticRoute = require("./routes/analytic");
const apiRoute = require("./routes/api");
const inventoryRoute = require("./routes/inventory");
const bannerRoute = require("./routes/banner");
const categoryRoute = require("./routes/category");
const chatRoute = require("./routes/chat");
const codesRoute = require("./routes/codes");
const orderHistoryRoute = require("./routes/orderHistory");
// const videoRoute = require("./routes/video");

// const { formatDate, radioCheck, checkboxFormatter } = require("./helpers/hbs");

/*
 * Creates an Express server - Express is a web application framework for creating web applications
 * in Node JS.
 */
const app = express();

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

// Handlebars Middleware
/*
 * 1. Handlebars is a front-end web templating engine that helps to create dynamic web pages using variables
 * from Node JS.
 *
 * 2. Node JS will look at Handlebars files under the views directory
 *
 * 3. 'defaultLayout' specifies the main.handlebars file under views/layouts as the main template
 *
 * */

const { multiply } = require("./helpers/hbs");
const { equal, noEqual } = require("./helpers/hbs");
const { imageUrl, readMore, formatDate, select} = require("./helpers/inventory/inventory_helper");
const { Op } = require("sequelize");
app.engine(
	"handlebars",
	exphbs({
		helpers: {
			equal,
			noEqual,
			multiply,
			imageUrl,
			readMore,
			formatDate,
			select
			// radioCheck,
			// checkboxFormatter,
		},
		handlebars: allowInsecurePrototypeAccess(Handlebars),
		defaultLayout: "layout", // Specify default template views/layout/main.handlebar
	})
);
app.set("view engine", "handlebars");

// Body parser middleware to parse HTTP body in order to read HTTP data
/*app.use(
	bodyParser.urlencoded({
		extended: false,
	})
);
app.use(bodyParser.json());*/
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, "public")));

// serve node_modules to frontend
// without using webpack or browserify
app.use(express.static(path.join(__dirname, 'node_modules')));

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride("_method"));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// To store session information. By default it is stored as a cookie on browser
// mySQL Session
let sessionStore = new MySQLStore({
	host: db.host,
	port: 3306,
	user: db.username,
	password: db.password,
	database: db.database,
	clearExpired: true,
	checkExpirationalInterval: 900000, // How frequently expired sessions will be cleared, ms
	expiration: 900000, // The maximum age of a valid session, ms
}); // session DB setting
let sessionIns = session({
	key: "denoshop_session",
	secret:
		"8y89y3249t3grf34rg~@@#fhf3fg23?>>kIL:$%^YUl$^LYU:,2,2;4k5t$#^563@^K12K5t34ty'",
	store: sessionStore,
	resave: false,
	saveUninitialized: false,
}); // middle for session + DB

app.use(sessionIns);

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// // Flash Messages
app.use(flash());
app.use(FlashMessenger.middleware); // Initialize flash-messenger

// // Add local variables with a middle ware
app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	res.locals.user = req.user || null; // After authenticated, the user object is set into req.user, referring to /config/passport.js
	next();
});

// Place to define global variables - not used in practical 1
app.use(function (req, res, next) {
	next();
});

// This will be called every request
// Inventory = require("./models/HackingProduct")
// app.all("*",function(req, res, next){
// 	Inventory.update({
//         status: "Inactive"
//     }, {
//         where: {
// 			[Op.or]:[{category: null}, {quantity: 0}]
//         }
//     })
// 	next();
// })

// Use Routes
/*
 * Defines that any root URL with '/' that Node JS receives request from, for eg. http://localhost:5000/, will be handled by
 * mainRoute which was defined earlier to point to routes/main.js
//  * */
app.use("/", mainRoute); // mainRoute is declared to point to routes/main.js
app.use("/analytics", analyticRoute);
app.use("/api", apiRoute);
app.use('/inventory', inventoryRoute);
app.use('/banner', bannerRoute);
app.use('/category', categoryRoute);
app.use("/chat",chatRoute);
app.use("/codes", codesRoute);
app.use("/orderHistory", orderHistoryRoute);
// app.use("/video", videoRoute);
// This route maps the root URL to any path defined in main.js

/*
 * Creates a unknown port 5000 for express server since we don't want our app to clash with well known
 * ports such as 80 or 8080.
 * */
const port = process.env.PORT || 5000;
// Starts the server and listen to port 5000
app.listen(port, "0.0.0.0", () => {
	console.log(`Server started on port ${port}`);
});
