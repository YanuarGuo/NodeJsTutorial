const express = require("express");
const {
  blogIndex,
  blogCreatePost,
  blogCreateGet,
  blogDelete,
  blogDetails,
} = require("../controllers/blogControllers");
const router = express.Router();

router.get("/", blogIndex);
router.post("/", blogCreatePost);
router.get("/create", blogCreateGet);
router.get("/:id", blogDetails);
router.delete("/:id", blogDelete);

module.exports = router;
