import { database } from "../config/firebaseConfig";
import { ref, set, remove, update, push } from "firebase/database";
import { uploadToCloudinary } from "../utils/uploadImage"; // ✅ Kiểm tra import

// 🛍 Thêm sản phẩm vào Firebase
export const addProductToFirebase = async (
  name,
  price,
  description,
  imageUri,
  category
) => {
  try {
    if (!name || !price || !description || !imageUri || !category) {
      throw new Error("⚠️ Thiếu thông tin sản phẩm! Vui lòng nhập đầy đủ.");
    }

    console.log("📤 Đang tải ảnh lên Cloudinary...");
    const imageUrl = await uploadToCloudinary(imageUri);

    if (!imageUrl) throw new Error("❌ Upload ảnh thất bại!");

    const newProductRef = push(ref(database, "products"));
    const productData = {
      name,
      price,
      description,
      image: imageUrl,
      category,
    };

    console.log("🟢 Dữ liệu gửi lên Firebase:", productData);
    await set(newProductRef, productData);

    console.log("✅ Sản phẩm đã được thêm vào Firebase!");
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm:", error);
    throw error;
  }
};

// ✏️ Cập nhật sản phẩm trên Firebase
export const updateProductInFirebase = async (productId, updatedProduct) => {
  try {
    if (!productId || !updatedProduct) {
      throw new Error("⚠️ Thiếu thông tin sản phẩm cần cập nhật!");
    }

    // Nếu ảnh được thay đổi, tải ảnh mới lên Cloudinary
    if (updatedProduct.image && updatedProduct.image.startsWith("file://")) {
      console.log("📤 Đang tải ảnh mới lên Cloudinary...");
      const imageUrl = await uploadToCloudinary(updatedProduct.image);
      updatedProduct.image = imageUrl;
    }

    console.log("🟡 Cập nhật sản phẩm:", updatedProduct);
    await update(ref(database, `products/${productId}`), updatedProduct);
    console.log("✅ Sản phẩm đã được cập nhật!");
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    throw error;
  }
};

// 🗑 Xóa sản phẩm khỏi Firebase
export const deleteProductFromFirebase = async (productId) => {
  try {
    if (!productId) throw new Error("⚠️ Thiếu ID sản phẩm để xóa!");
    await remove(ref(database, `products/${productId}`));
    console.log("🗑 Sản phẩm đã bị xóa!");
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
};
