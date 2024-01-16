const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  CreateBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampInRdius,
  bootcampPhotoUpload
} = require("../controllers/bootcamps");
const Bootcamp = require("../models/bootcamp");
const advancedResults = require("../middlewares/advancedResults");

//Include other routes
const courseRoute = require("./courses");

const router = express.Router();
// Re-route in other resorucce
router.use("/:bootcampId/courses", courseRoute);

router.route("/").get(advancedResults(Bootcamp, "courses"), getBootcamps).post(CreateBootcamp);

router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

router.route("/radius/:zipcode/:distance").get(getBootcampInRdius);

router.route("/:id/photo").put(bootcampPhotoUpload);

module.exports = router;
