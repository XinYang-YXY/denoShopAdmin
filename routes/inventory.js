const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const fs = require('fs');
const moment = require('moment');
const Inventory = require('../models/HackingProduct');
const Category = require('../models/Category');
const cloudinary = require('cloudinary');
require("../helpers/inventory/cloudinary");
const { upload, single_upload1, single_upload2, single_upload3, single_upload4 } = require('../helpers/inventory/multer_Image');

const ProductStats = require('../models/ProductStats');
const ProductRatings = require('../models/ProductRatings');
const currentDate = new Date();

var original_image_url = [];

router.get('/', (req, res) => {
    Inventory.findAll()
        .then((inventory) => {
            res.render('inventory/inventory', {
                title: "Inventory",
                style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/inventory.css" },
                script: { sidemenu: "sidemenu-script.js", datatable: "/inventory/datatable.js" },
                product: inventory
            });
        })
        .catch(err => console.log(err));
});


router.get('/update/:id', (req, res) => {
    let category_names;
    Category.findAll()
        .then((category) => {
            category_names = category;
        })
    Inventory.findOne({
        where: {
            id: req.params.id
        }
    }).then((inventory) => {
        original_image_url = JSON.parse(inventory.imageFile);
        res.render('inventory/update_product', {
            inventory: inventory,
            style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/update_products.css" },
            script: { sidemenu: "sidemenu-script.js", js: "/inventory/main.js" },
            title: "Update Product",
            category: category_names
        });
    }).catch(err => console.log(err));
});


router.get('/delete/:id', (req, res) => {
    let itemId = req.params.id;
    Inventory.findOne({
        where: {
            id: itemId,
        },
    }).then((inventory) => {
        if (inventory === null) {
            // alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
            // res.redirect('/logout');
        } else {
            var json = JSON.parse(inventory.imageFile);
            for (var i = 0; i < json.length; i++) {
                if (json[i].startsWith('http')) {
                    // let a = json[i].lastIndexOf('.');
                    // let public_url = json[i].substring(0, a).split('/').slice(-3).join('/');
                    let a = json[i].lastIndexOf('/');
                    let public_url = json[i].substring(a + 1);
                    cloudinary.v2.uploader.destroy('denoshop/products/' + public_url, function (error, result) {
                        if (error) { console.log(error) };
                    });
                }
            }
            Inventory.destroy({
                where: {
                    id: itemId
                }
            }).then(() => {
                alertMessage(res, 'success', 'Product succesfully deleted!', 'far fa-trash-alt', true);
                res.redirect('/inventory');
            }).catch((err) => console.log(err));
        }
    }).catch(err => console.log(err));
});


router.get('/add', (req, res) => {
    Category.findAll()
        .then((category) => {
            res.render('inventory/add_product', {
                title: "Add Inventory",
                style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/create_products.css" },
                script: { sidemenu: "sidemenu-script.js", js: "/inventory/main.js" },
                category: category
            });
        })
});


router.post('/addproduct', async (req, res) => {
    let price = parseFloat(req.body.price).toFixed(2);
    let dateAdded = moment(req.body.dateAdded, 'DD/MM/YYYY');
    let title = req.body.title;
    let description = req.body.description.slice(0, 1999);
    let category = req.body.category;
    let quantity = parseInt(req.body.quantity);
    let image_urls = req.body.prodURL;
    // let status = req.body.status;
    var new_url = [];


    for (var i = 0; i < image_urls.length; i++) {
        if (image_urls[i] != '/img/no-image.jpg') {
            await cloudinary.v2.uploader.upload('./public/' + image_urls[i], { folder: "denoshop/products", use_filename: true }, 
            function (error, result) { 
                error ? console.log(error) : new_url.push(cloudinary.image(result.public_id, { secure: true, transformation: [{ width: 300, height: 300, crop: "scale" }] }).replace("<img src='", '').replace("' />", '')); })
        } else {
            // new_url.push('/img/no-image.jpg');
            console.log('OMEGALUL');
        }
    }
    let imageFile = JSON.stringify(new_url);
    Inventory.create({
        price, imageFile, dateAdded, title, description, category, quantity
    }).then((result) => {
        result.id

        // Creating ProductStats & ProductRating
        ProductStats.create({ year: currentDate.getFullYear(), hackingProductId: result.id });
        ProductRatings.create({ year: currentDate.getFullYear(), hackingProductId: result.id })
        // End

        fs.rmdirSync('./public/uploads', { recursive: true });
        alertMessage(res, 'success', 'Product succesfully added!', 'fas fa-check-circle', true);
        res.redirect('/inventory');
    }).catch((err) => { console.log(err); alertMessage(res, 'danger', 'Error! Check logs', 'fas fa-exclamation-circle', true); res.redirect('add'); });

});


router.post('/upload', (req, res) => {
    if (!fs.existsSync('./public/uploads/')) {
        fs.mkdirSync('./public/uploads/');
    }
    upload(req, res, (err) => {
        image_obj = {}
        if (err) {
            image_obj[err] = err;
        } else {
            for (var i = 0; i < 4; i++) {
                if (req.files[i] === undefined) {
                    image_obj["file" + i.toString()] = '/img/no-image.jpg';
                } else {
                    image_obj["file" + i.toString()] = `/uploads/${req.files[i].filename}`;
                }
            }
        }
        res.json(image_obj);
    });
})


router.put('/updateproduct/:id', async (req, res) => {
    let price = parseFloat(req.body.price).toFixed(2);
    let dateAdded = moment(req.body.dateAdded, 'DD/MM/YYYY');
    let title = req.body.title;
    let description = req.body.description.slice(0, 1999);
    let category = req.body.category;
    let quantity = parseInt(req.body.quantity);
    // let status = req.body.status;
    var image_urls = [req.body.prodURL1, req.body.prodURL2, req.body.prodURL3, req.body.prodURL4];
    var new_url = [];

    for (var i = 0; i < image_urls.length; i++) {
        if (image_urls[i].startsWith('https://res.cloudinary.com')) {
            new_url.push(image_urls[i])
        } else if (image_urls[i].startsWith('/img/no-image.jpg')) {
            // new_url.push(image_urls[i]);
            console.log('OMEGALUL');
        } else {
            await cloudinary.v2.uploader.upload('./public/' + image_urls[i], { folder: "denoshop/products", use_filename: true }, function (error, result) { 
                error ? console.log('cloudinary upload error', error) : new_url.push(cloudinary.image(result.public_id, { secure: true, transformation: [{ width: 300, height: 300, crop: "scale" }] }).replace("<img src='", '').replace("' />", '')); })
        }
    }
    let imageFile = JSON.stringify(new_url);
    Inventory.update({
        price, imageFile, dateAdded, title, description, category, quantity
    }, {
        where: {
            id: req.params.id
        }
    }).then(() => {
        for (var i = 0; i < image_urls.length; i++) {
            if (image_urls[i] != original_image_url[i]) {
                if (original_image_url[i] === undefined) {
                    console.log('OMEGALUL');
                }
                else if (original_image_url[i].startsWith('https')) {
                    console.log(original_image_url[i]);
                    let a = original_image_url[i].lastIndexOf('/');
                    let public_url = original_image_url[i].substring(a + 1);
                    cloudinary.v2.uploader.destroy('denoshop/products/' + public_url, function (error, result) {
                        if (error) { console.log('cloudinary upload error', error) };
                    });
                }
            }
        }
    }).then(() => {
        fs.rmdirSync('./public/uploads', { recursive: true });
        alertMessage(res, 'success', 'Product succesfully updated!', 'fas fa-check-circle', true);
        res.redirect('/inventory');
    }).catch((err) => console.log(err));

});


router.post('/upload1', (req, res) => {
    if (!fs.existsSync('./public/uploads/')) {
        fs.mkdirSync('./public/uploads/');
    }
    single_upload1(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/no-image.jpg', err: err });
            } else {
                res.json({ file: `/uploads/${req.file.filename}` });
            }
        }
    });
})


router.post('/upload2', (req, res) => {
    if (!fs.existsSync('./public/uploads/')) {
        fs.mkdirSync('./public/uploads/');
    }
    single_upload2(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/no-image.jpg', err: err });
            } else {
                res.json({ file: `/uploads/${req.file.filename}` });
            }
        }
    });
})


router.post('/upload3', (req, res) => {
    if (!fs.existsSync('./public/uploads/')) {
        fs.mkdirSync('./public/uploads/');
    }
    single_upload3(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/no-image.jpg', err: err });
            } else {
                res.json({ file: `/uploads/${req.file.filename}` });
            }
        }
    });
})

router.post('/upload4', (req, res) => {
    if (!fs.existsSync('./public/uploads/')) {
        fs.mkdirSync('./public/uploads/');
    }
    single_upload4(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/no-image.jpg', err: err });
            } else {
                res.json({ file: `/uploads/${req.file.filename}` });
            }
        }
    });
})


module.exports = router;