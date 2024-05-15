const router = require("express").Router();
const { user, validate, User } = require("../models/user");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validObject = require("../middleware/validObjectId");
const { route } = require("./users");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (user)
    return res
      .status(403)
      .send({ message: "User with given email already exist" });

  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassowrd = await bcrypt.hash(req.body.password, salt);
  let newUser = await new User({
    ...req.body,
    password: hashPassowrd,
  }).save();

  newUser.password = undefined;
  newUser.__v = undefined;

  res
    .status(200)
    .send({ data: newUser, message: "Account created successfully" });
});

//get all user
router.get("/", admin, async (req, res) => {
  const users = await User.find().select("-password-__v");
  res.status(200).send({ data: users });
});

//get user by id
router.get("/:id", [validObject, auth], async (req, res) => {
  const user = await User.findById(req.params.id).select("-password-__v");
  res.status(200).send({ data: user });
});

//update user by id
router.put("/:id", [validObject, auth], async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  ).select("-password-_v");
  res.status(200).send({ data: user });
});

//delete user by id

router.delete("/del/:id", [validObject, admin], async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: "Successfully deleted user" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ message: "Error deleting user" });
  }
});

module.exports = router;
