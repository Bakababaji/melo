const router = require("express").Router();
const { Song } = require("../models/songs");
const { Playlist } = require("../models/playlist");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const search = req.query.search;
  if (search !== "") {
    const songs = await Song.find({
      name: { $regex: search, $options: "i" },
    }).limit(10);
    const playlists = await Playlist.find({
      name: { $regex: search, $options: "i" },
    }).limit(10);
    const result = { songs, playlists };
    res.status(200).send({ data: result });
  } else {
    res.status(200).send({});
  }
});

module.exports = router;
