const express = require("express");

const Admin = require('../models/admin');
const Student = require('../models/student');

const router = express.Router();

router.get('/', (req, res) => {
    res.send('For Developers Only');
});

module.exports = router;
