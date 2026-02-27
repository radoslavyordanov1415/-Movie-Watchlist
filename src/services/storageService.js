import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export async function uploadImage(uri, _path) {
  try {
 
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 400 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG },
    );

    const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const dataUri = `data:image/jpeg;base64,${base64}`;
    return { url: dataUri };
  } catch (err) {
    console.error("uploadImage error:", err.message);
    return { error: "Failed to read image. Please try again." };
  }
}


export async function deleteImage(_downloadUrl) {

}
