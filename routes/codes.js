const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const Codes = require('../models/PromoCode');


router.get('/', (req, res) => {
    Codes.findAll()
        .then((codes) => {
            res.render('promocodes/codes', {
                title: "Codes",
                style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/inventory.css" },
                script: { sidemenu: "sidemenu-script.js", datatable: "/inventory/datatable.js" },
                codes: codes
            });
        })
        .catch(err => console.log(err));
})


router.get('/add', (req, res) => {
    res.render('promocodes/add_codes', {
        title: "Add code",
        style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/create_products.css" },
        script: { sidemenu: "sidemenu-script.js", codes: "/inventory/codes.js" }
    });
});


router.get('/update/:id', (req, res) => {
    Codes.findOne({
        where: {
            id: req.params.id
        }
    }).then((codes) => {
        res.render('promocodes/update_codes', {
            codes: codes,
            style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/update_products.css" },
            script: { sidemenu: "sidemenu-script.js", codes: "/inventory/codes.js" },
            title: "Update Code"
        });

    }).catch(err => console.log(err));
});


router.post('/addcodes', (req, res) => {
    let code = req.body.code;
    let status = req.body.status;
    let discount = req.body.discount;

    Codes.create({
        code, status, discount
    }).then(() => {
        alertMessage(res, 'success', 'Code succesfully added!', 'fas fa-check-circle', true);
        res.redirect('/codes');
    }).catch((err) => console.log(err));
})


router.put('/updatecodes/:id', (req, res) => {
    let code = req.body.code;
    let status = req.body.status;
    let discount = req.body.discount;

    Codes.update({
        code, status, discount
    }, {
        where: {
            id: req.params.id
        }
    }).then(() => {
        alertMessage(res, 'success', 'Code succesfully updated!', 'fas fa-check-circle', true);
        res.redirect('/codes');
    }).catch((err) => console.log(err));

})


router.get('/delete/:id', (req, res) => {
    let codesID = req.params.id;
    Codes.findOne({
        where: {
            id: codesID
        }
    }).then((codes) => {
        if (codes === null) {
            // alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
            // res.redirect('/logout');
        } else {
            Codes.destroy({
                where: {
                    id: codesID
                }
            }).then(() => {
                alertMessage(res, 'success', 'Code succesfully deleted!', 'far fa-trash-alt', true);
                res.redirect('/codes');
            }).catch((err) => console.log(err));
        }
    }).catch(err => console.log(err));
})


module.exports = router
