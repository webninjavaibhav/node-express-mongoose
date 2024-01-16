const Bootcamp = require("../models/bootcamp");
const ErrorResponse = require("./..//utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const geocoder = require("../utils/geocoder");
const path = require("path");
// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc Create bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.CreateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.create(req.body);
  res.status(201).json({success: true, msg: "Create new bootcamps", data: bootcamps});
});

// @desc Get single bootcamps
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({success: true, msg: `Display bootcamps ${req.params.id}`, data: bootcamp});
});

// @desc Update bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({success: true, msg: `Update bootcamps ${req.params.id}`, data: bootcamp});
});

// @desc Delete bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  bootcamp.remove();
  res.status(200).json({success: true, msg: `Delete bootcamps ${req.params.id}`});
});

// @desc Get bootcamp within s radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampInRdius = asyncHandler(async (req, res, next) => {
  const {zipcode, distance} = req.params;
  console.log(zipcode, distance);
  //get lat/log from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  console.log(lat, lng);
  //calc radius using radians
  //Divide dist by radius of Earth
  //Earth radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [
          [
            lng, lat
          ],
          radius
        ]
      }
    }
  });
  res.status(200).json({success: true, count: bootcamps.length, data: bootcamps});
});

// @desc Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  //Make sure the image is photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload a image file`, 400));
  }

  //Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload a image less then ${process.env.MAX_FILE_UPLOAD}`, 400));
  }

  //Create custom filename
  file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`;
  console.log(file.name);

  //Move file on specefic folder
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

    res.status(200).json({success: true, data: file.name});
  });
});
