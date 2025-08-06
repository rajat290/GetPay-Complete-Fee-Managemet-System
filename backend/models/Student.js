const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    registrationNo: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },

    className: {
        type: String,
        required: true,
    },

}, { timestamps: true });


// courses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}]// this is for one to many relationship
// courses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}]// this is for one to many relationship
studentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
studentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('Student', studentSchema);