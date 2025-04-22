import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { updateBannerInFirebase } from "../../services/firebaseServices";
import { useRoute, useNavigation } from "@react-navigation/native";

const EditBannerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { banner } = route.params;

  const [title, setTitle] = useState(banner?.title || "");
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl || "");
  const [imageUri, setImageUri] = useState(banner?.imageUrl || "");

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!title || !imageUri) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề và chọn ảnh.");
      return;
    }

    try {
      await updateBannerInFirebase(banner.id, {
        ...banner,
        title,
        linkUrl,
        imageUrl: imageUri,
      });
      Alert.alert("✅ Thành công", "Banner đã được cập nhật.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("❌ Lỗi", "Không thể cập nhật banner.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Tiêu đề Banner</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Nhập tiêu đề"
        style={styles.input}
      />

      <Text style={styles.label}>Liên kết (nếu có)</Text>
      <TextInput
        value={linkUrl}
        onChangeText={setLinkUrl}
        placeholder="https://example.com"
        style={styles.input}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        <Text style={styles.imagePickerText}>📷 Đổi ảnh</Text>
      </TouchableOpacity>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      ) : null}

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.saveButtonText}>💾 Cập nhật Banner</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  imagePicker: {
    backgroundColor: "#eee",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 16,
  },
  imagePickerText: {
    color: "#333",
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#ff4081",
    padding: 14,
    alignItems: "center",
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditBannerScreen;
