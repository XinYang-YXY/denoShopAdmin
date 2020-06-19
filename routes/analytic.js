const express = require('express');
const router = express.Router();

// test data
orderData = [{ order_id: 1, user_id: 31, date: "03-02-2019" },
{ order_id: 2, user_id: 39, date: "03-09-2019" },
{ order_id: 3, user_id: 121, date: "21-12-2019" },
{ order_id: 4, user_id: 21, date: "16-01-2020" },
{ order_id: 5, user_id: 53, date: "27-03-2020" }]


router.get('/add-targets', (req, res) => {
    return "placeholder"
})

router.get('/executive', (req, res) => {
    res.render('analytics/executive', {
        title: "Executive Dashboard",
        style: { sidemenu: "sidemenu-styling.css" , dashboard: "dashboard-styling.css"},
        script: { text: "sidemenu-script.js" }
    });
})

router.get('/gross-profit', (req, res) => {
    res.render('analytics/gross-profit', {
        title: "Gross Profit Dashboard",
        style: { sidemenu: "sidemenu-styling.css" , dashboard: "dashboard-styling.css"},
        script: { sidemenu: "sidemenu-script.js" }
    });
})

router.get('/order-history', (req, res) => {
    res.render('order-history', {
        title: "Order History",
        order: orderData,
        style: { sidemenu: "sidemenu-styling.css" },
        script: { sidemenu: "sidemenu-script.js" }
    });
});

module.exports = router;