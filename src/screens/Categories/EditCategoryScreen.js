import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { database } from "../../config/firebaseConfig";
import { ref, update } from "firebase/database";

export default function EditCategoryScreen({ navigation, route }) {
  const { category } = route.params;
  const [title, setTitle] = useState(category.title);
  const [image, setImage] = useState(category.image);

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  // Upload ảnh lên Cloudinary
  const uploadImage = async (uri) => {
    let formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "category.jpg",
    });
    formData.append("upload_preset", "your_upload_preset"); // Thay bằng upload_preset của Cloudinary

    try {
      let response = await fetch(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      let data = await response.json();
      setImage(data.secure_url);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải ảnh lên!");
    }
  };

  // Cập nhật danh mục
  const handleUpdate = async () => {
    if (!title.trim()) return alert("⚠️ Vui lòng nhập tiêu đề danh mục!");

    await update(ref(database, `categories/${category.id}`), {
      title,
      image,
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ Chỉnh sửa Danh mục</Text>

      {/* Hiển thị ảnh */}
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Image source={{ uri: image }} style={styles.image} />
        <Text style={styles.changeImageText}>📷 Đổi ảnh</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nhập tiêu đề danh mục..."
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.buttonText}>💾 Lưu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  changeImageText: {
    color: "#2980b9",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#f39c12",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
