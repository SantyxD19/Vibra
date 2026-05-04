const supabase = require("../config/supabase");

const uploadImage = async (file) => {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage
    .from("eventos")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    console.log("UPLOAD ERROR:", error);
    throw new Error("Error subiendo imagen");
  }

  const { data } = supabase.storage.from("eventos").getPublicUrl(fileName);

  return data.publicUrl;
};

module.exports = uploadImage;
