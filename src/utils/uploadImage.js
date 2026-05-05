const supabase = require("../config/supabase");

const uploadImage = async (file, folder = "general") => {
  if (!file) return null;

  const fileName = `${folder}/${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage
    .from("profiles") // puedes cambiar a "uploads" si luego separas buckets
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
