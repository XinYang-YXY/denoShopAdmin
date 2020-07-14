const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const fs = require('fs');
const moment = require('moment');
const Banner = require('../models/Banner');
const cloudinary = require('cloudinary');
require("../helpers/inventory/cloudinary");
const { single_upload_banner } = require('../helpers/inventory/multer_Image');

var original_banner_url = "";


router.get('/test', (req, res) => {
    let a = [];
    Banner.findAll({
        attributes: ["imageFile"],
        where: {
            status: 'Active'
        }
    })
        .then((banner) => {
            for (var i = 1; i < banner.length; i++) {
                a.push(banner[i]);
            }
            res.render('banner/test', {
                title: "test",
                first: banner[0],
                banner: a
                // style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/create_products.css" },
                // script: { sidemenu: "sidemenu-script.js", js: "/inventory/main.js" }
            })
        })
});


router.get('/', (req, res) => {
    Banner.findAll()
        .then((banner) => {
            res.render('banner/banner', {
                title: "Banner",
                style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/inventory.css" },
                script: { sidemenu: "sidemenu-script.js", datatable: "/inventory/datatable.js" },
                banner: banner
            });
        })
        .catch(err => console.log(err));
})


router.get('/add', (req, res) => {
    res.render('banner/add_banner', {
        title: "Add Banner",
        style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/create_products.css" },
        script: { sidemenu: "sidemenu-script.js", js: "/inventory/banner.js" }
    });
});


router.get('/update/:id', (req, res) => {
    Banner.findOne({
        where: {
            id: req.params.id
        }
    }).then((banner) => {
        original_banner_url = banner.imageFile;
        res.render('banner/update_banner', {
            banner: banner,
            style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/update_products.css" },
            script: { sidemenu: "sidemenu-script.js", js: "/inventory/banner.js" },
            title: "Update Banner"
        });

    }).catch(err => console.log(err));
});


router.post('/upload', (req, res) => {
    if (!fs.existsSync('./public/uploads/')) {
        fs.mkdirSync('./public/uploads/');
    }
    single_upload_banner(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/placeholder-banner.png', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/placeholder-banner.png', err: err });
            } else {
                res.json({ file: `/uploads/${req.file.filename}` });
            }
        }
    });
})


router.post('/addBanner', async (req, res) => {
    let title = req.body.title;
    let status = req.body.status;
    let dateAdded = moment(req.body.dateAdded, 'DD/MM/YYYY');
    let image_url = req.body.bannerURL;
    let imageFile = "";

    if (image_url != '/img/no-image.jpg') {
        await cloudinary.v2.uploader.upload('./public/' + image_url, { folder: "denoshop/banners", use_filename: true }, function (error, result) {
            error ? console.log(error) :
                imageFile = cloudinary.image(result.public_id, { secure: true, transformation: [{ width: 1110, height: 333, crop: "scale" }] }).replace("<img src='", '').replace("' />", '');
        })
    }

    Banner.create({
        title,
        imageFile,
        dateAdded,
        status
    }).then(() => {
        fs.rmdirSync('./public/uploads', { recursive: true });
        alertMessage(res, 'success', 'Banner succesfully added!', 'fas fa-check-circle', true);
        res.redirect('/banner');
    }).catch((err) => console.log(err));
});


router.get('/delete/:id', (req, res) => {
    let bannerId = req.params.id;
    Banner.findOne({
        where: {
            id: bannerId,
        },
    }).then((banner) => {
        if (banner === null) {
            // alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
            // res.redirect('/logout');
        } else {
            // let a = banner.imageFile.lastIndexOf('.');
            // let b = banner.imageFile.substring(0, a).split('/').slice(-2).join('/');
            let a = banner.imageFile.lastIndexOf('/');
            let b = banner.imageFile.substring(a + 1);
            cloudinary.v2.uploader.destroy('denoshop/banners/' + b, function (error, result) {
                if (error) { console.log(error) };
            });
            Banner.destroy({
                where: {
                    id: bannerId
                }
            }).then(() => {
                alertMessage(res, 'success', 'Banner succesfully deleted!', 'far fa-trash-alt', true);
                res.redirect('/banner');
            }).catch((err) => console.log(err));
        }
    }).catch(err => console.log(err));
});


router.put('/updatebanner/:id', async (req, res) => {
    let title = req.body.title;
    let status = req.body.status;
    let dateAdded = moment(req.body.dateAdded, 'DD/MM/YYYY');
    let imageFile = req.body.bannerURL;

    if ((!imageFile.startsWith("https://res.cloudinary.com")) && (!imageFile.startsWith('/img/no-image.jpg'))) {
        await cloudinary.v2.uploader.upload('./public/' + imageFile, { folder: "denoshop/banners", use_filename: true }, function (error, result) {
            error ? console.log(error) : imageFile = cloudinary.image(result.public_id, { secure: true, transformation: [{ width: 1110, height: 333, crop: "scale" }] }).replace("<img src='", '').replace("' />", '')})
    }
    Banner.update({
        title,
        status,
        dateAdded,
        imageFile
    }, {
        where: {
            id: req.params.id
        }
    }).then(() => {
        if (original_banner_url != imageFile) {
            // let a = original_banner_url.lastIndexOf('.');
            // let b = original_banner_url.substring(0, a).split('/').slice(-2).join('/');
            let a = banner.imageFile.lastIndexOf('/');
            let b = banner.imageFile.substring(a + 1);
            cloudinary.v2.uploader.destroy('denoshop/banners/' + b, function (error, result) {
                if (error) { console.log(error) };
            });
        }
    }).then(() => {
        fs.rmdirSync('./public/uploads', { recursive: true });
        alertMessage(res, 'success', 'Banner succesfully updated!', 'fas fa-check-circle', true);
        res.redirect('/banner');
    }).catch((err) => console.log(err));

});


module.exports = router;