// AUTH , IS STUDENT , IS INSTRUCTOR , IS ADMIN

const jwt = require("jsonwebtoken");
require('dotenv').config();


// ================ AUTH ================
// user Authentication by checking token validating
exports.auth = (req, res, next) => {
    try {
        // extract token from Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token is Missing or Invalid Format'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // verify token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            if (!decode || !decode.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Token Payload'
                });
            }
            req.user = decode;
            next();
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired',
                    error: error.message
                });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Token',
                    error: error.message
                });
            }
            console.log('Error while decoding token:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Token validation failed',
                error: error.message
            });
        }
    }
    catch (error) {
        console.log('Error in auth middleware:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while validating the token',
            error: error.message
        });
    }
}





// ================ IS STUDENT ================
exports.isStudent = (req, res, next) => {
    try {
        // console.log('User data -> ', req.user)
        if (req.user?.accountType != 'Student') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for student'
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('Error while cheching user validity with student accountType');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with student accountType'
        })
    }
}


// ================ IS INSTRUCTOR ================
exports.isInstructor = (req, res, next) => {
    try {
        // console.log('User data -> ', req.user)
        if (req.user?.accountType != 'Instructor') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for Instructor'
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('Error while cheching user validity with Instructor accountType');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with Instructor accountType'
        })
    }
}


// ================ IS ADMIN ================
exports.isAdmin = (req, res, next) => {
    try {
        // console.log('User data -> ', req.user)
        if (req.user.accountType != 'Admin') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for Admin'
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('Error while cheching user validity with Admin accountType');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with Admin accountType'
        })
    }
}


