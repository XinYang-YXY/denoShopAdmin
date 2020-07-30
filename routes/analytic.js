const express = require('express');
const router = express.Router();

const hackingProduct = require('../models/HackingProduct');
const ProductStats = require('../models/ProductStats');
const currentDate = new Date();

const ensureAuthenticated = require("../helpers/auth");

// Note by Yong Yudh:
// The queries implemented here are very inefficient way of getting data
// this is a temporary solution until I've figure out how to better query datas from mysql with sequelize
// To be optimized: '/' and '/targets'

router.get('/', ensureAuthenticated, (req, res) => {
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
        let currentProfit = 0;
        let monthlyProfit = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        data.forEach(o => {
            let sold = o.jan + o.feb + o.mar + o.apr + o.may + o.jun +
                o.jul + o.aug + o.sep + o.oct + o.nov + o.dec;
            currentProfit += (o.hackingProduct.price * sold);

            // This is omfg, the most horrendous code I've ever written in my entire life.
            // I seriously need to find a better solution to this when I have enough time...
            monthlyProfit[0] += o.hackingProduct.price * o.jan;
            monthlyProfit[1] += o.hackingProduct.price * o.feb;
            monthlyProfit[2] += o.hackingProduct.price * o.mar;
            monthlyProfit[3] += o.hackingProduct.price * o.apr;
            monthlyProfit[4] += o.hackingProduct.price * o.may;
            monthlyProfit[5] += o.hackingProduct.price * o.jun;
            monthlyProfit[6] += o.hackingProduct.price * o.jul;
            monthlyProfit[7] += o.hackingProduct.price * o.aug;
            monthlyProfit[8] += o.hackingProduct.price * o.sep;
            monthlyProfit[9] += o.hackingProduct.price * o.oct;
            monthlyProfit[10] += o.hackingProduct.price * o.nov;
            monthlyProfit[11] += o.hackingProduct.price * o.dec;
        })
        return [ currentProfit, monthlyProfit ]
    }).then(currentData => {
        
        ProductStats.findAll({
            where: {
                year: currentDate.getFullYear() - 1
            },
            include: [
                {
                    model: hackingProduct
                }
            ],
        }).then(data => {
            let lastProfit = 0;
            data.forEach(o => {
                let sold = o.jan + o.feb + o.mar + o.apr + o.may + o.jun +
                    o.jul + o.aug + o.sep + o.oct + o.nov + o.dec;
                lastProfit += (o.hackingProduct.price * sold);
            })
            return lastProfit
        }).then(lastData => {
            res.render('analytics/overview', {
                title: "Overview",
                style: { sidemenu: "sidemenu-styling.css", dashboard: "analytics/dashboard-styling.css" },
                script: { text: "sidemenu-script.js" },
                jsPlugins: { src: "/chart.js/dist/Chart.js" },
                currentProfit: currentData[0],
                vsLastProfile: currentData[0] - lastData,
                monthlyProfit: currentData[1],
                profitPercentChange: (((currentData[0] - lastData) / lastData) * 100).toFixed(1)
            });
            console.log(currentData[0], currentData[1], lastData);
        })
    })
})

router.get('/targets', ensureAuthenticated, (req, res) => {
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
        let productList = [];
        let currentTarget = 0;
        let fulfilledTarget = 0;

        data.forEach(o => {
            currentTarget += (o.hackingProduct.price * o.target)
            let sold = o.jan + o.feb + o.mar + o.apr + o.may + o.jun +
                o.jul + o.aug + o.sep + o.oct + o.nov + o.dec;
            fulfilledTarget += (o.hackingProduct.price * sold);
            productList.push({
                id: o.hackingProductId,
                name: o.hackingProduct.title,
                price: o.hackingProduct.price,
                current_quota: o.target
            })
        });
        deficit = (fulfilledTarget > currentTarget) ? 0 : parseFloat(fulfilledTarget - currentTarget).toFixed(2);
        return {
            productList: productList,
            current: parseInt(currentTarget),
            fulfilled: parseInt(fulfilledTarget),
            deficit: parseInt(deficit)
        };
    }).then(data => {
        res.render('analytics/target', {
            title: "Current Targets",
            style: { sidemenu: "sidemenu-styling.css", dashboard: "analytics/dashboard-styling.css" },
            script: { sidemenu: "sidemenu-script.js" },
            products: data.productList,
            current: data.current,
            fulfilled: data.fulfilled,
            deficit: data.deficit
        });
    });
})

// cont
router.post('/update-target/:id', (req, res) => {
    let id = req.params.id;
    let newTarget = req.body.newTarget;

    console.log(`ID: ${id}, Value: ${newTarget}`);

    ProductStats.update({
        target: newTarget
    }, {
        where: {
            hackingProductId: id,
            year: currentDate.getFullYear()
        }
    }).then(() => {
        res.redirect('/analytics/targets');
    }).catch(err => { console.log(err) });
});

router.get('/collections', ensureAuthenticated, (req, res) => {
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
        return stats;
    }).then(stats => {
        res.render('analytics/collections', {
            title: "Product Collections",
            style: { sidemenu: "sidemenu-styling.css", dashboard: "analytics/dashboard-styling.css" },
            script: { sidemenu: "sidemenu-script.js" },
            jsPlugins: { src: "/chart.js/dist/Chart.js" },
            unsold: stats,
        });
        console.log(stats);
    });
})

module.exports = router;