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

const requestPasswordResetSchema = {
  body: {
    institutionCode: { required: true },
    email: { required: true, type: "email" }
  }
};

const resetPasswordSchema = {
  body: {
    institutionCode: { required: true },
    token: { required: true },
    password: { required: true }
  }
};

const activateAccountSchema = {
  body: {
    institutionCode: { required: true },
    token: { required: true },
    password: { required: true }
  }
};

const changePasswordSchema = {
  body: {
    currentPassword: { required: true },
    newPassword: { required: true }
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
