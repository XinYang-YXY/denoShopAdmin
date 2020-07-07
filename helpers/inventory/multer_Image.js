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

let multer_obj = {
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    }
};

// Initialise Upload
const upload = multer(multer_obj).array('prodUpload',4); // Must be the name as the HTML file upload input
const single_upload1 = multer(multer_obj).single('prodUpload1');
const single_upload2 = multer(multer_obj).single('prodUpload2');
const single_upload3 = multer(multer_obj).single('prodUpload3');
const single_upload4 = multer(multer_obj).single('prodUpload4');
const single_upload_banner = multer(multer_obj).single('bannerUpload');

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
    single_upload4: single_upload4, single_upload_banner: single_upload_banner
};