const express = require('express');
const router = express.Router();

const hackingProduct = require('../models/HackingProduct');
const ProductStats = require('../models/ProductStats');
const currentDate = new Date();

router.get('/add-targets', (req, res) => {
    ProductStats.findAll({
        where: {
            year: currentDate.getFullYear()
        },
        include: [
            {
                model: hackingProduct
            }
        ],
    }).then(data => {
        let products = [];
        data.forEach(o => {
            products.push({
                id: o.hackingProductId,
                name: o.hackingProduct.title,
                price: o.hackingProduct.price,
                prev_quota: o.target
            })
        });
        res.render('analytics/target', {
            title: "Add Targets",
            style: { sidemenu: "sidemenu-styling.css", dashboard: "analytics/dashboard-styling.css" },
            script: { sidemenu: "sidemenu-script.js" },
            products: products,
        });
    })
})

router.get('/', (req, res) => {
    res.render('analytics/overview', {
        title: "Overview",
        style: { sidemenu: "sidemenu-styling.css", dashboard: "analytics/dashboard-styling.css" },
        script: { text: "sidemenu-script.js" }
    });
})

router.get('/sales', (req, res) => {
    res.render('analytics/sales', {
        title: "Sales",
        style: { sidemenu: "sidemenu-styling.css", dashboard: "analytics/dashboard-styling.css" },
        script: { sidemenu: "sidemenu-script.js" }
    });
})

router.get('/collections', (req, res) => {
    ProductStats.findAll({
        where: {
            year: currentDate.getFullYear()
        },
        include: [
            {
                model: hackingProduct
            }
        ],
    })
        .then(data => {
            let stats = [];
            data.forEach(o => {
                let sold = o.jan + o.feb + o.mar + o.apr + o.may + o.jun +
                    o.jul + o.aug + o.sep + o.oct + o.nov + o.dec;
                let target = o.target;
                if (target - sold > 0) {
                    let stat = {
                        id: o.hackingProductId,
                        name: o.hackingProduct.title,
                        sold: sold,
                        target: target,
                        short: target - sold,
                    }
                    stats.push(stat)
                }
            });
            res.render('analytics/collections', {
                title: "Product Collections",
                style: { sidemenu: "sidemenu-styling.css", dashboard: "analytics/dashboard-styling.css" },
                script: { sidemenu: "sidemenu-script.js" },
                jsPlugins: { src: "/chart.js/dist/Chart.js" },
                unsold: stats,
            });
            console.log(stats);
        })
})

module.exports = router;