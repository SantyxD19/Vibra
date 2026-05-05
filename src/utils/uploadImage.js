const supabase = require("../config/supabase");

const uploadImage = async (file) => {
  if (!file) return null;

  const fileName = `profiles/${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage
    .from("profiles")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    console.log("UPLOAD ERROR:", error);
    throw new Error("Error subiendo imagen");
  }

  const { data } = supabase.storage.from("profiles").getPublicUrl(fileName);

  return data.publicUrl;
};

module.exports = uploadImage;
