const express = require('express');
const ProductStats = require('../models/ProductStats');
const ProductRatings = require('../models/ProductRatings');
const router = express.Router();
const currentDate = new Date();

router.get('/product-sold-rate/:id', (req, res) => {
    ProductStats.findOne({
        where: {
            year: currentDate.getFullYear(),
            hackingProductId: req.params.id
        }
    })
        .then(statsData => {
            return [statsData.jan, statsData.feb, statsData.mar, statsData.apr, statsData.may, statsData.jun,
            statsData.jul, statsData.aug, statsData.sep, statsData.oct, statsData.nov, statsData.dec];
        })
        .then(statsData => {
            ProductRatings.findOne({
                where: {
                    year: currentDate.getFullYear(),
                    hackingProductId: req.params.id
                }
            }).then(ratingsData => {
                res.json(JSON.stringify([statsData, [ratingsData.jan, ratingsData.feb, ratingsData.mar, ratingsData.apr, ratingsData.may, ratingsData.jun,
                ratingsData.jul, ratingsData.aug, ratingsData.sep, ratingsData.oct, ratingsData.nov, ratingsData.dec]]))
            })
        })
});

module.exports = router;