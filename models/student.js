const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    contactNum: {type: String, required: true},
    // TODO other stuff
    
    userType: { type: String, default: "STUDENT" },
    created: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Student", studentSchema);
