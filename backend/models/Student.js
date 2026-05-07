const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true,
        index: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        index: true
    },
    academicSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicSession',
        index: true
    },
    classGroupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassGroup',
        index: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        lowercase: true,
        trim: true
    },
    registrationNo: {
        type: String,
        required: true,
        trim: true
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
    guardian: {
        name: { type: String, trim: true },
        email: { type: String, lowercase: true, trim: true },
        phone: { type: String, trim: true }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'alumni'],
        default: 'active'
    },

}, { timestamps: true });

studentSchema.index({ institutionId: 1, email: 1 }, { unique: true });
studentSchema.index({ institutionId: 1, registrationNo: 1 }, { unique: true });


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
