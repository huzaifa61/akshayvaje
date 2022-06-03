const express = require("express");

const router = express.Router({ mergeParams: true });

router.use("/admin", require("./admin"));
router.use("/", require("./student"));

if (process.env.DEVELOPER) {
    router.use("/dev", require("./developer"));
}

router.get("*", (req, res) => res.render("page_not_found"));

module.exports = router;
