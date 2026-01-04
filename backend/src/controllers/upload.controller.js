const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new Error('No file uploaded');
    }
    // Cloudinary storage puts the url in `path`
    res.status(200).json(new ApiResponse(200, { url: req.file.path }, 'File uploaded successfully'));
});

module.exports = { uploadFile };
