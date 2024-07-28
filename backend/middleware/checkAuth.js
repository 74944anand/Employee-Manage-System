const jwt = require('jsonwebtoken')
const models = require('../models')

exports.checkAuth = async (req, res, next) => {
    try {
        const bearer = req.header("Authorization");
        if (!bearer) {
            return res.status(401).send({ result: `please enter a valid token .` })
        }
        else {
            const token = bearer.split(" ")[1];
            if (!token) {
                return res.status(401).send({ result: `please enter a token .` })
            } else {
                const decode = jwt.verify(token, process.env.JWT_SECRET);
                if (decode) {
                    const find = await models.userToken.findOne({ where: { token: token } });
                    if (!find) {
                        return res.status(401).send({ result: `token not found.` });
                    } else {
                        req.decoded = decode;
                        next()
                    }
                }
                if (!decode) {
                    return res.status(401).send({ result: `not a valid token.` })
                }
            }
        }


    } catch (error) {
        return res.status(401).send({ result: `${error}` })
    }
}

