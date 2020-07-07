const express = require('express');
const router = express.Router();

const hackingProduct = require('../models/HackingProduct');
const ProductStats = require('../models/ProductStats');
const currentDate = new Date();

router.get('/', (req, res) => {
    res.render('analytics/overview', {
        title: "Overview",
        style: { sidemenu: "sidemenu-styling.css", dashboard: "analytics/dashboard-styling.css" },
        script: { text: "sidemenu-script.js" }
    });
})

router.get('/targets', (req, res) => {
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
        return { productList: productList,
            current: parseFloat(currentTarget).toFixed(2), 
            fulfilled: parseFloat(fulfilledTarget).toFixed(2), 
            deficit: parseFloat(fulfilledTarget - currentTarget).toFixed(2) };
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