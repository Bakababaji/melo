const router = require("express").Router();
const { User } = require("../models/user");
const { Song, validate } = require("../models/songs");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { date } = require("joi");
const validObjectId = require("../middleware/validObjectId");
const { users, route } = require("./users");

//create song
router.post("/", admin, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send({ message: error.details[0].message });

  const song = await Song(req.body).save();
  res.status(201).send({ data: song, message: "Song created sucessfully" });
});

//get all songs
router.get("/", async (req, res) => {
  const songs = await Song.find();
  res.status(200).send({ date: songs });
});

//update song
router.put("/:id", [validObjectId, admin], async (req, res) => {
  const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).send({ data: song, message: "Updated sucessfully" });
});

//delete song by id
router.delete("/:id", [validObjectId, admin], async (req, res) => {
  await Song.findByIdAndDelete(req.params.id);
  res.status(200).send({ message: "Song deleted successfully" });
});

//like song
router.put("/like/:id", [validObjectId, auth], async (req, res) => {
  let resMessage = "";
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(400).send({ message: "Song does not exist" });

  const user = await User.findById(req.user._id);
  const index = user.likedSongs.indexOf(song._id);
  if (index === -1) {
    user.likedSongs.push(song._id);
    resMessage = "Added to your liked songs";
  } else {
    user.likedSongs.splice(index, 1);
    resMessage = "Removed from your liked songs";
  }

  await user.save();
  res.status(200).send({ message: resMessage });
});

//get all liked songs
router.get("/like", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const songs = await Song.find({ _id: { $in: user.likedSongs } });
    res.status(200).send({ data: songs });
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    res.status(500).send({ message: "Error fetching liked songs" });
  }
});

module.exports = router;
