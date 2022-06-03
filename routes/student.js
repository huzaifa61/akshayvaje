const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const auth = require('../config/auth');
const { vaildateEmail } = require('../config/constants');
const multer = require('multer');

const Student = require("../models/student");

const router = express.Router();
const upload = multer();

router.get("/", (req, res) => res.render("home"));

router.get("/home", (req, res) => {
    res.render("student/home");
});

router.get("/profile/:id", (req, res) => {
    Student.findById(req.params.id, (err, student) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            if (student && req.user && req.isAuthenticated() && ((req.user.userType === "STUDENT" && student._id.equals(req.user._id)) || req.user.userType == "ADMIN")) {
                Student.findById(req.params.id).exec((err, student) => {
                        if (err) console.log(err);
                        else {
                            console.log(student);
                            res.render("student/profile", { student });
                        }
                    });
            }
            else {
                req.flash('error_msgs', "You cannot view some other user's profile");
                res.redirect("/");
            }
        }
    });
});

router.get("/login", (req, res) => {
    if (req.isAuthenticated() && req.user.userType === "STUDENT") {
        res.redirect("/home");
    } else {
        res.render("student/login");
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('student-local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get("/register", (req, res) => {
    res.render("student/register");
});

router.post("/register", upload.single("file"), (req, res) => {
    const { name, email, dob, contactNum, password1, password2 } = req.body;
    let errors = [];
    if (!name || !email || !dob || !contactNum || !password1 || !password2) {
        errors.push('Please fill in all required fields');
    }
    if (password1 !== password2) {
        errors.push('Passwords do not match');
    }
    if (password1.length < 8) {
        errors.push('Password should be at least 8 characters long');
    }
    if (contactNum.length != 10) {
        errors.push('Contact Number should be excatly 10 digits');
    }
    if (!vaildateEmail(email)) {
        errors.push('Please enter a valid email');
    }
    let d = new Date();
    if (d != "Invalid Date") {
        d.setFullYear(d.getFullYear() - 18);
        let DoB = new Date(dob)
        if (DoB > d) {
            errors.push('To register, you must be at least 18 years old');
        }
    } else
        errors.push('To register, you must enter valid date');
    if (req.file)
        if (req.file.size > 2000 * 1000)
            errors.push('Cannot upload files greater than 2 MB');
    if (errors.length > 0) {
        res.render("student/register", { errors, name, email, dob, contactNum, password1, password2 });
    } else {
        Student.findOne({ email })
            .then(student => {
                if (student) {
                    errors.push('This email has already been registered');
                    res.render("student/register", { errors, name, email, dob, contactNum, password1, password2 });
                } else {
                    let image = '';
                    if (req.file) {
                        image = {
                            data: req.file.buffer,
                            contentType: req.file.mimetype
                        };
                    }
                    const newStudent = new Student({
                        name,
                        dob: new Date(dob),
                        email,
                        contactNum,
                        password: password1
                    });
                    bcrypt.genSalt(process.env.SECRET_NUMBER, (err, salt) => {
                        bcrypt.hash(newStudent.password, salt, (err, hash) => {
                            if (err) { throw err; }
                            newStudent.password = hash;
                            newStudent.save()
                                .then(student => {
                                    req.flash('success_msgs', 'Successfully registered!');
                                    res.redirect('/login');
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            })
    }
});

router.get("/edit", auth.isStudentLoggedIn, (req, res) => {
    res.render("student/edit", req.user);
});

router.post("/edit", auth.isStudentLoggedIn, upload.single("file"), (req, res) => {
    const { name, dob, contactNum, password1, password2 } = req.body;
    let errors = [];
    if (!name || !dob || !contactNum) {
        errors.push('Please fill in all required fields');
    }
    if ((password1 || password2) && password1 !== password2) {
        errors.push('Passwords do not match');
    }
    if ((password1 && password1.length < 8) || (password2 && password2.length < 8)) {
        errors.push('Password should be at least 8 characters long');
    }
    if (contactNum.length != 10) {
        errors.push('Contact Number should be excatly 10 digits');
    }
    if (!vaildateEmail(email)) {
        errors.push('Please enter a valid email');
    }
    let d = new Date();
    if (d != "Invalid Date") {
        d.setFullYear(d.getFullYear() - 18);
        let DoB = new Date(dob);
        if (DoB > d) {
            errors.push('You must be at least 18 years old');
        }
    } else
        errors.push('You must enter valid date');
    if (req.file)
        if (req.file.size > 2000 * 1000)
            errors.push('Cannot upload files greater than 2 MB');
    if (errors.length > 0) {
        res.render("student/edit", { errors, name, dob, password1, password2, contactNum, _id: req.user._id });
    } else {
        let update;
        if (req.file) {
            let image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
            if (password1) {
                let password = password1;
                bcrypt.genSalt(process.env.SECRET_NUMBER, (err, salt) => {
                    bcrypt.hash(newStudent.password, salt, (err, hash) => {
                        if (err) { throw err; }
                        password = hash;
                    })
                });
                update = { $set: { name, dob, contactNum, password } };
            } else {
                update = { $set: { name, dob, contactNum } };
            }
        } else {
            if (password1) {
                let password = password1;
                bcrypt.genSalt(process.env.SECRET_NUMBER, (err, salt) => {
                    bcrypt.hash(newStudent.password, salt, (err, hash) => {
                        if (err) { throw err; }
                        password = hash;
                    })
                });
                update = { $set: { name, dob, contactNum, password } };
            } else {
                update = { $set: { name, dob, contactNum } };
            }
        }

        Student.findOneAndUpdate({ email: req.user.email }, update, { new: false, upsert: false }, (err, student) => {
            if (err) console.log(err);
            else {
                req.flash('success_msgs', 'Profile updated.');
                res.redirect(`/profile/${req.user._id}`);
            }
        });
    }
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash('success_msgs', 'Successfully logged out');
    res.redirect('/login')
});

/*
router.get('/get_image/:id', function (req, res) {
    Student.findById(req.params.id, (err, student) => {
        if (err) {
            console.log(err);
            res.contentType("image/png");
            res.send(fs.readFileSync("public/assets/student_profile.png"));
        }
        else if (student.image) {
            if (student.image.contentType && student.image.data) {
                res.contentType(student.image.contentType);
                res.send(student.image.data);
            } else {
                res.contentType("image/png");
                res.send(fs.readFileSync("public/assets/student_profile.png"));
            }
        }
    });
});
*/

module.exports = router;
