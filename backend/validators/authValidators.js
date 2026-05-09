const registerStudentSchema = {
  body: {
    institutionCode: { required: true, minLength: 2, maxLength: 40 },
    name: { required: true, minLength: 2, maxLength: 120 },
    email: { required: true, type: "email" },
    registrationNo: { required: true, minLength: 1, maxLength: 60 },
    className: { required: true, minLength: 1, maxLength: 80 },
    password: { required: true, minLength: 8, maxLength: 128 }
  }
};

const loginSchema = {
  body: {
    email: { required: true, type: "email" },
    password: { required: true, minLength: 1, maxLength: 128 },
    institutionCode: { maxLength: 40 }
  }
};

const requestPasswordResetSchema = {
  body: {
    institutionCode: { required: true, maxLength: 40 },
    email: { required: true, type: "email" }
  }
};

const resetPasswordSchema = {
  body: {
    institutionCode: { required: true, maxLength: 40 },
    token: { required: true, minLength: 8, maxLength: 256 },
    password: { required: true, minLength: 8, maxLength: 128 }
  }
};

const activateAccountSchema = {
  body: {
    institutionCode: { required: true, maxLength: 40 },
    token: { required: true, minLength: 32, maxLength: 256 },
    password: { required: true, minLength: 8, maxLength: 128 }
  }
};

const changePasswordSchema = {
  body: {
    currentPassword: { required: true, minLength: 1, maxLength: 128 },
    newPassword: { required: true, minLength: 8, maxLength: 128 }
  }
};

module.exports = {
  registerStudentSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  activateAccountSchema,
  changePasswordSchema
};
