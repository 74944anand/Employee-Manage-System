const userService = require('../service/auth');
const response = require('../utils/response');


// login 
exports.login = async (req, res, next) => {
    const { email,password} = req.body
const result = await userService.userLogin(email,password)
if(result.success){
    { return response.ok(res, {...result}) } 
}else  {
    return response.badRequest(res, {...result})  
}
}

exports.register = async(req,res)=>{
    const {firstName ,lastName,email,password,mobileNumber} = req.body
    const result = await userService.userRegister(firstName ,lastName,email,password,mobileNumber)
    if(result.success){
        { return response.ok(res, {...result}) } 
    }else  {
        return response.badRequest(res, {...result})  
    }
}
exports.logout = async (req, res) => {
    const userId  = req.decoded.id
        const token = req.header("Authorization");
    const response = await userService.userLogout(userId, token);
    if (response.result) {
        res.status(200).send({ result: response.result })
    }
    else {
        res.status(400).send({ result: response.message })
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const forgotPasswordData = { email };
    const result = await userService.forgotPasswordService(forgotPasswordData);
    if (!result.error) {
      return response.ok(res, result);
    } else {
      return response.noData(res, result);
    }
  };
  
  exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const verifyOtpData = { email, otp };
    const result = await userService.verifyOtpService(verifyOtpData);
    if (!result.error) {
      return response.ok(res, result);
    } else {
      return response.noData(res, result);
    }
  };
  
  exports.resetPassword = async (req, res) => {
    const { id, password } = req.body;
    const resetPasswordData = {id, password};
    const result = await userService.resetPasswordService(resetPasswordData);
    if (!result.error) {
      return response.ok(res, result);
    } else {
      return response.noData(res, result);
    }
  };
