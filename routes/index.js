const router = require("express").Router();


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

const authRoutes = require('./auth.routes')
router.use('/auth', authRoutes)

const profileRoutes = require("./profile.routes")
router.use("/profile", profileRoutes)


module.exports = router;
