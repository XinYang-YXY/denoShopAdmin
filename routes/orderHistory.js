const express = require('express');
const router = express.Router();
const ensureAuthenticated = require("../helpers/auth");

const Order = require("../models/Order");
const PurchaseRecord = require("../models/PurchaseRecord");
const DeliveryInfo = require("../models/DeliveryInfo");
const HackingProduct = require("../models/HackingProduct");

const alertMessage = require('../helpers/messenger');

const QRCode = require('qrcode');

router.get('/', ensureAuthenticated, async (req, res) => {
    let orderData = await Order.findAll()

    var ordPlacedArr = []
    var ordOTWarr = []
    var ordArriveArr = []
    var ordCompleteArr = []

    orderData.forEach(order => {
        if (order.orderStatus == 1) {
            ordPlacedArr.push(order)
        } else if (order.orderStatus == 2) {
            ordOTWarr.push(order)
        } else if (order.orderStatus == 3) {
            ordArriveArr.push(order)
        } else if (order.orderStatus == 4) {
            ordCompleteArr.push(order)
        }
    });

    res.render('orderHistory/order-history', {
        title: "Order History",
        order: orderData,
        ordPlacedArr,
        ordOTWarr,
        ordArriveArr,
        ordCompleteArr,
        style: {
            sidemenu: "sidemenu-styling.css",
            orderHistory: "orderHistory/orderHistory.css"
        },
        script: { sidemenu: "sidemenu-script.js" }
    });
});

router.get("/invoice/:id", ensureAuthenticated, (req, res) => {
    var orderId = req.params.id

    Order.findOne({
		where: {
			id: orderId,
		},
		include: [PurchaseRecord, DeliveryInfo]
	}).then(async (order) => {
        var purchaseRecordArr = order.purchaseRecords
        var deliveryInfo = order.deliveryInfo

		var titleArr = []
		for (let i = 0; i < purchaseRecordArr.length; i++) {
			titleArr.push(purchaseRecordArr[i].title)
		}

		var prodDetails = await HackingProduct.findAll({
			where: {
				title: titleArr,
			}
		}).then((data) => {return data})

		for (let i = 0; i < purchaseRecordArr.length; i++) {
			var record = purchaseRecordArr[i]
			var recordTitle = purchaseRecordArr[i].title
            var recordFound = prodDetails.filter(function(item) { return item.title === recordTitle})
            var number = i + 1
            record["number"] = number
			record["description"] = recordFound[0].description
			record["price"] = recordFound[0].price
			record["id"] = recordFound[0].id
        }
        console.log(order)
        return res.render("orderHistory/invoice", {
            title: "Invoice",
            order,
            purchaseRecords: order.purchaseRecords,
            deliveryInfo,
            style: {
                sidemenu: "sidemenu-styling.css",
                orderHistory: "orderHistory/invoice.css"
            },
            script: { sidemenu: "sidemenu-script.js" }
        })
	})
})

router.get("/qrcode/:id/:orderStatus", ensureAuthenticated, (req, res) => {
    var orderId = req.params.id
    var orderStatus = req.params.orderStatus

    if (orderStatus == 4) {
        alertMessage(res, 'danger', 'Order has already completed', 'fas fa-exclamation-circle', true);
        res.redirect("/orderHistory/");
    } else {
        var newurl = "http://" + req.hostname + ":" + req.connection.localPort + "/orderHistory/updateStatus/" + orderId + "/"  + orderStatus
        QRCode.toDataURL(newurl, function (err, url) {
    
    
            let data = url.replace(/.*,/,'')
            let img = new Buffer(data,'base64')
            res.writeHead(200,{
                'Content-Type' : 'image/png',
                'Content-Length' : img.length
            })
            res.end(img)
        })
        //     return res.render("orderHistory/qrcode", {
        //         title: "qrcode",
        //         qrcode: img,
        //         style: {
        //             sidemenu: "sidemenu-styling.css",
        //             orderHistory: "orderHistory/invoice.css"
        //         },
        //         script: { sidemenu: "sidemenu-script.js" }
        //     })
        // })
    }
})

router.get("/updateStatus/:id/:orderStatus", async (req, res) => {
    var orderId = req.params.id
    var orderStatus = req.params.orderStatus

    var orderFound = await Order.findOne({
        where: {
            id: orderId
        }
    }).then(order => {return order})

    if (orderStatus != orderFound.orderStatus) {
        alertMessage(res, 'danger', 'Invalid URL', 'fas fa-exclamation-circle', true);
        res.redirect("/");
    } else {
        if (orderStatus == 1) {
            var neworderStatus = 2
        } else if (orderStatus == 2) {
            var neworderStatus = 3
        } else if (orderStatus == 3) {
            var neworderStatus = 4
        }
        
        Order.update(
            {orderStatus: neworderStatus},
            {where: {
                id: orderId
            }}
        ).then(() => {
            res.render("orderHistory/qrcodeSuccess", {
                title: 'Success',
                style: {
                    sidemenu: "sidemenu-styling.css",
                    orderHistory: "orderHistory/invoice.css"
                },
                script: { sidemenu: "sidemenu-script.js" }
            })
        }).catch((err) => {
            res.render("orderHistory/qrcodeError", {
    
            })
        })
    }
})

module.exports = router;