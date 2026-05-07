const registerStudentSchema = {
  body: {
    institutionCode: { required: true },
    name: { required: true },
    email: { required: true, type: "email" },
    registrationNo: { required: true },
    className: { required: true },
    password: { required: true }
  }
};

const loginSchema = {
  body: {
    email: { required: true, type: "email" },
    password: { required: true }
  }
};

module.exports = { registerStudentSchema, loginSchema };
