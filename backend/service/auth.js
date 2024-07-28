const db = require("../models");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const moment = require("moment");
// const bcrypt = require('bcrypt');

exports.userLogin = async (email, password) => {
  const result = await db.user.findOne({
    where: { email: email },
  });
  if (result) {
    const passwordMatched = await result.comparePassword(password);
    if (passwordMatched) {
      const userRoles = await db.userRole.findAll({
        where: { userId: result.id },
        attributes: ["roleId"],

        include: [
          {
            model: db.role,
            as: "role",
            attributes: ["roleName"],
          },
        ],
      });
      const roleIds = userRoles.map((e) => e.roleId);
      if (!roleIds.length) {
        return { message: "Invalid User" };
      }
      const findPermission = await db.rolePermission.findAll({
        where: {
          roleId: roleIds,
        },
        attributes: ["id", "roleId", "permissionId"],
        include: [
          {
            model: db.permission,
            as: "permission",
            attributes: ["id"],
          },
        ],
      });
      if (!findPermission.length) {
        return { message: "permission not found based on role" };
      }
      const token = jwt.sign(
        { id: result.id, name: result.name },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );
      const findToken = await db.userToken.findOne({
        where: { userId: result.id },
        attributes: ["token", "userId"],
      });
      if (findToken) {
        const user = {
          userId: result.id,
          token: token,
        };
        const updateToken = await db.userToken.update(user, {
          where: { userId: result.id },
        });
      } else {
        const user = {
          userId: result.id,
          token: token,
        };
        const add = await db.userToken.create(user);
      }
      return {
        success: true,
        id: result.id,
        token: token,
        userRole: userRoles,
        permission: findPermission,
        message: "Logged in Successfully",
      };
    } else {
      return { success: false, message: `please enter valid password` };
    }
  } else {
    return { success: false, message: `please enter valid email & password` };
  }
};

exports.userRegister = async (
  firstName,
  lastName,
  email,
  password,
  mobileNumber
) => {
  const existingUser = await db.user.findOne({
    where: {
      [Op.or]: [
        { email: email },
        // { mobileNumber: mobileNumber },
        // { accountNumber: accountNumber }
      ],
    },
  });

  if (existingUser) {
    const messages = [];
    if (existingUser.email === email) {
      messages.push("Email Already Exist");
    }
    // if (existingUser.mobileNumber === mobileNumber) {
    //     messages.push("Mobile Number Already Exist");
    // }
    // if (existingUser.accountNumber === accountNumber) {
    //     messages.push("Account Number Already Exist");
    // }

    return { success: false, message: messages.join(", ") };
  }

  // If no existing user found, create a new user
  password
    ? password
    : (password = email.substring(0, 5) + mobileNumber.substring(0, 5));
  const registerUser = await db.user.create({
    firstName,
    lastName,
    email,
    password,
    mobileNumber,
  });

  return { success: true, message: "User Register Successfully", registerUser };
};

exports.userLogout = async (userId, token) => {
  const bearer = token.split(" ")[1];
  if (bearer) {
    const deleteToken = await db.userToken.destroy({
      where: { user_id: userId, token: bearer },
    });
    if (deleteToken) {
      return { result: "token deleted", data: deleteToken };
    } else {
      return { message: "could not delete token" };
    }
  } else {
    return { message: "could not verify token" };
  }
};

exports.forgotPasswordService = async (forgotPasswordData) => {
  try {
    const { email } = forgotPasswordData;
    const user = await db.user.findOne({ where: { email: email } });
    if (!user) {
      return { error: true, data: user, message: "Email not found!" };
    }
    const baseUrl = process.env.FRONTEND_ORIGIN
      ? process.env.FRONTEND_ORIGIN
      : "http://103.165.118.9:5027";
    const redirectLink = baseUrl + "/verify-password/" + user.id;
    //const otp = Math.floor(1000 + Math.random() * 9000);

    const emailTemplate = forgetPasswordTemplate({
      firstName: user.firstName,
      redirectLink,
      //otp,
    });
    // let expiryTime = moment().add(10, "minutes");
    // const userOtp = await db.userOtp.create({
    //   userId: user.id,
    //   otp,
    //   expiryTime,
    //   otpFor: "resetPassword",
    // });
    const result = await sendEmailForResetPassword(
      emailTemplate.subject,
      emailTemplate.message,
      user.email
    );
    return { error: null, message: "Email sent successfully" };
  } catch (err) {
    return { error: null, message: "error while sending Email" };
  }
};

exports.verifyOtpService = async (verifyOtpData) => {
  const { email, otp } = verifyOtpData;
  const user = await db.user.findOne({ where: { email: email } });
  if (!user) {
    return { error: true, data: user, message: "Email not found!" };
  }
  const userOtp = await db.userOtp.findOne({
    where: { userId: user.id, otp, expiryTime: { [Op.gte]: moment() } },
    order: [["createdAt", "DESC"]],
  });
  if (!userOtp) {
    return { error: true, message: "OTP is invalid or expired!" };
  } else if (userOtp.isVerified) {
    return { error: true, message: "otp already verified!" };
  }
  const result = await db.userOtp.update(
    { isVerified: true },
    {
      where: {
        id: userOtp.id,
      },
    }
  );
  if (result[0]) {
    return { error: null, message: "Otp verified successfully", data: result };
  } else {
    return { error: true, message: "error while verifying OTP!" };
  }
};

exports.resetPasswordService = async (resetPasswordData) => {
  const { id, password } = resetPasswordData;
  const user = await db.user.findOne({ where: { id: id } });
  if (!user) {
    return { error: true, data: user, message: "User not found!" };
  }
  const result = await db.user.update(
    { password },
    {
      where: {
        id: user.id,
      },
      individualHooks: true,
    }
  );
  if (result[0]) {
    return { error: null, message: "Password updated", data: result };
  } else {
    return {
      error: true,
      data: result,
      message: "error while updating password",
    };
  }
};
