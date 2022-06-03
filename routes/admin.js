const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const auth = require('../config/auth');

const Admin = require('../models/admin');
const Student = require('../models/student');

const router = express.Router();

router.get("/home", auth.isAdminLoggedIn, (req, res) => {
    res.redirect("/admin/home/students");
});

router.get("/home/students", auth.isAdminLoggedIn, (req, res) => {
    Student.find({}, null, { sort: { created: -1 } }, (err, students) => {
        if (err) console.log(err);
        res.render("admin/home/students", {
            students
        });
    });
});

router.get("/login", (req, res) => {
    if (req.isAuthenticated() && req.user.userType === "ADMIN")
        res.redirect("/admin/home");
    else
        res.render("admin/login");
});

router.post('/login', (req, res, next) => {
    passport.authenticate('admin-local', {
        successRedirect: '/admin/home',
        failureRedirect: '/admin/login',
        failureFlash: 'Invalid username or password'
    })(req, res, next);
});

router.get("/register", auth.isAdminLoggedIn, (req, res) => {
    res.render("admin/register");
});

router.post("/register", auth.isAdminLoggedIn, (req, res) => {
    const { name, email, password1, password2 } = req.body;
    let errors = [];
    if (!name || !email || !password1 || !password2) {
        errors.push('Please fill in all required fields');
    }
    if (password1 !== password2) {
        errors.push('Passwords do not match');
    }
    if (password1.length < 8) {
        errors.push('Password should be at least 8 characters long');
    }
    if (errors.length > 0) {
        res.render("admin/register", { errors, name, email, password1, password2 });
    } else {
        Admin.findOne({ email })
            .then(admin => {
                if (admin) {
                    errors.push('This email has already been registered');
                    res.render("admin/register", { errors, name, email, password1, password2 });
                } else {
                    const newAdmin = new Admin({ name, email, password: password1 });
                    bcrypt.genSalt(process.env.SECRET_NUMBER, (err, salt) => {
                        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                            if (err) { throw err; }
                            newAdmin.password = hash;
                            newAdmin.save()
                                .then(admin => {
                                    req.flash('success_msgs', 'Successfully registered!');
                                    res.redirect('/admin/login');
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            });
    };
});

router.get("/logout", auth.isAdminLoggedIn, (req, res) => {
    req.logout();
    req.flash('success_msgs', 'Successfully logged out');
    res.redirect('/admin/login')
});

module.exports = router;
