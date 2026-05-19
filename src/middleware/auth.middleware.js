const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlackListModel = require("../models/blackList.model")

/**
 * Verify token helper
 */
async function verifyUser(req) {

    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1]

    if (!token) {
        throw new Error("TOKEN_MISSING")
    }

    const isBlacklisted =
        await tokenBlackListModel.findOne({ token })

    if (isBlacklisted) {
        throw new Error("TOKEN_INVALID")
    }

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    )

    const user = await userModel.findById(decoded.userId)

    if (!user) {
        throw new Error("USER_NOT_FOUND")
    }

    return user
}

/**
 * Normal Auth Middleware
 */
async function authMiddleware(req, res, next) {

    try {

        const user = await verifyUser(req)

        req.user = user

        next()

    } catch (err) {

        if (err.message === "TOKEN_MISSING") {
            return res.status(401).json({
                message: "Unauthorized access, token is missing"
            })
        }

        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

/**
 * System User Middleware
 */
async function authSystemUserMiddleware(req, res, next) {

    try {

        const user = await verifyUser(req)

        const systemUser = await userModel
            .findById(user._id)
            .select("+systemUser")

        if (!systemUser.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, not a system user"
            })
        }

        req.user = systemUser

        next()

    } catch (err) {

        if (err.message === "TOKEN_MISSING") {
            return res.status(401).json({
                message: "Unauthorized access, token is missing"
            })
        }

        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}