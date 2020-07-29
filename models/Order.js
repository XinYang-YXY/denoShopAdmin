const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const Order = db.define("order", {
    chargeId: {
        type: Sequelize.STRING,
    },
<<<<<<< HEAD
=======
    paypalId: {
        type: Sequelize.STRING,
    },
>>>>>>> develop
    deliveryDate: {
        type: Sequelize.DATEONLY,
    },
    deliveryTime: {
        type: Sequelize.STRING,
    },
    orderDescription: {
        type: Sequelize.STRING,
<<<<<<< HEAD
=======
    },
    orderStatus: {
        type: Sequelize.INTEGER,
    },
    orderSum: {
        type: Sequelize.FLOAT,
>>>>>>> develop
    }
})

module.exports = Order;