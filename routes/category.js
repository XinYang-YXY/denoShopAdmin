const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const Category = require('../models/Category');
const ensureAuthenticated = require("../helpers/auth");

router.get('/', ensureAuthenticated, (req, res) => {
    Category.findAll()
        .then((category) => {
            res.render('category/category', {
                title: "Product Categories",
                style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/inventory.css" },
                script: { sidemenu: "sidemenu-script.js", datatable: "/inventory/datatable.js" },
                category: category
            });
        })
        .catch(err => console.log(err));
})


router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('category/add_category', {
        title: "Add a product category",
        style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/create_products.css" },
        script: { sidemenu: "sidemenu-script.js" }
    });
});


router.get('/update/:id', ensureAuthenticated, (req, res) => {
    Category.findOne({
        where: {
            id: req.params.id
        }
    }).then((category) => {
        res.render('category/update_category', {
            category: category,
            style: { sidemenu: "sidemenu-styling.css", dashboard: "dashboard-styling.css", text: "inventory/update_products.css" },
            script: { sidemenu: "sidemenu-script.js" },
            title: "Update Category"
        });

    }).catch(err => console.log(err));
});


router.post('/addcategory', (req, res) => {
    let category_name = req.body.category;
    Category.findAll({
        where: {
            category: category_name
        }
    }).then((category) => {
        if (category.length > 0) {
            alertMessage(res, 'danger', 'Category already exists', 'fas fa-exclamation-circle', true);
            res.redirect('add');
        } else {
            Category.create({
                category: category_name
            }).then(() => {
                alertMessage(res, 'success', 'Category succesfully added!', 'fas fa-check-circle', true);
                res.redirect('/category');
            }).catch((err) => console.log(err));
        }
    }).catch((err) => console.log(err))

})


router.put('/updatecategory/:id', (req, res) => {
    let category_name = req.body.category;
    Category.findAll({
        where: {
            category: category_name
        }
    }).then((category) => {
        if (category.length > 0) {
            alertMessage(res, 'danger', 'Category already exists', 'fas fa-exclamation-circle', true);
            res.redirect('/category/update/' + req.params.id);
        } else {
            Category.update({
                category:category_name
            }, {
                where: {
                    id: req.params.id
                }
            }).then(() => {
                alertMessage(res, 'success', 'Category succesfully updated!', 'fas fa-check-circle', true);
                res.redirect('/category');
            }).catch((err) => console.log(err));
        }
    }).catch((err) => console.log(err));
})


router.get('/delete/:id', ensureAuthenticated, (req, res) => {
    let categoryId = req.params.id;
    Category.findOne({
        where: {
            id: categoryId
        }
    }).then((category) => {
        if (category === null) {
            // alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
            // res.redirect('/logout');
        } else {
            Category.destroy({
                where: {
                    id: categoryId
                }
            }).then(() => {
                alertMessage(res, 'success', 'Category succesfully deleted!', 'far fa-trash-alt', true);
                res.redirect('/category');
            }).catch((err) => console.log(err));
        }
    }).catch(err => console.log(err));
})


module.exports = router
