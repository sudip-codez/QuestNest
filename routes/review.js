const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {validatingReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");

const reviewController=require("../controllers/reviews.js");

//post REVIEW route for a given listing
router.post(
  "/",
  isLoggedIn,validatingReview,
  wrapAsync(reviewController.createReview)
);

//delete REVIEW route for a given listing
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports=router;