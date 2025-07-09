const express = require('express')
const app = express();

// packages
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

// connection to DB and cloudinary
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

// routes
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');
const contactRoutes = require('./routes/contact');

// middleware 
app.use(express.json({ limit: '50mb' })); // to parse json body
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['set-cookie']
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Configure file upload middleware
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp',
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
        abortOnLimit: true,
        responseOnLimit: 'File size limit has been reached',
        debug: true,
        createParentPath: true,
        preserveExtension: true,
        safeFileNames: true
    })
);

// mount routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/contact', contactRoutes);

// Default Route
app.get('/', (req, res) => {
    return res.json({
        success: true,
        message: 'Your server is up and running....'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        status: err.status,
        name: err.name,
        path: req.path,
        method: req.method
    });
    
    // Handle CORS errors
    if (err.name === 'CORSError' || err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'CORS error - Origin not allowed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Handle other types of errors
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// connections
(async () => {
    try {
        await connectDB();
        cloudinaryConnect();
        
        const PORT = process.env.PORT || 4000;
        const server = app.listen(PORT, () => {
            console.log(`Server Started on PORT ${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using that port.`);
            } else {
                console.error('Error starting server:', err);
            }
            process.exit(1);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('Received SIGTERM. Performing graceful shutdown...');
            server.close(() => {
                console.log('Server closed. Exiting process.');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('Received SIGINT. Performing graceful shutdown...');
            server.close(() => {
                console.log('Server closed. Exiting process.');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
})();
