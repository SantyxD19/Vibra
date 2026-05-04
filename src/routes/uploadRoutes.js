const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const file = req.files.image;

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("eventos")
      .upload(fileName, file.data, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("eventos").getPublicUrl(fileName);

    res.json({ url: data.publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error subiendo imagen" });
  }
});

module.exports = router;
