const multer = require('multer');
const path = require('path');
// Set The Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './public/uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + path.extname(file.originalname));
    }
});
// Initialise Upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    }
}).array('prodUpload',4); // Must be the name as the HTML file upload input

const single_upload1 = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    }
}).single('prodUpload1');

const single_upload2 = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    }
}).single('prodUpload2');

const single_upload3 = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    }
}).single('prodUpload3');

const single_upload4 = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    }
}).single('prodUpload4');

// Check File Type
function checkFileType(file, callback) {
    // Allowed file extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Test extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Test mime
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return callback(null, true);
    } else {
        callback({ message: 'Images Only' });
    }
}
module.exports = { upload: upload, single_upload1: single_upload1, single_upload2: single_upload2, single_upload3: single_upload3, 
    single_upload4: single_upload4
};