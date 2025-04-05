import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getDatabase, ref, get, update, remove } from "firebase/database";

export default function UserDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});

  useEffect(() => {
    const db = getDatabase();
    get(ref(db, `users/${userId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.val());
          setUpdatedUser(snapshot.val());
        } else {
          Alert.alert("Lỗi", "Không tìm thấy user!");
          navigation.goBack();
        }
      })
      .catch((error) => Alert.alert("Lỗi", error.message));
  }, [userId]);

  const handleUpdateUser = () => {
    const db = getDatabase();
    update(ref(db, `users/${userId}`), updatedUser)
      .then(() => {
        Alert.alert("Thành công", "Cập nhật thông tin thành công!");
        setEditing(false);
        setUser(updatedUser);
      })
      .catch((error) => Alert.alert("Lỗi", error.message));
  };

  const handleDeleteUser = () => {
    Alert.alert("Xóa User", "Bạn có chắc muốn xóa người dùng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          const db = getDatabase();
          remove(ref(db, `users/${userId}`))
            .then(() => {
              Alert.alert("Thành công", "Người dùng đã bị xóa!");
              navigation.goBack();
            })
            .catch((error) => Alert.alert("Lỗi", error.message));
        },
      },
    ]);
  };

  const toggleBanUser = () => {
    const newStatus = user.status === "banned" ? "active" : "banned";
    const db = getDatabase();
    update(ref(db, `users/${userId}`), { status: newStatus })
      .then(() => {
        Alert.alert(
          "Thành công",
          `Tài khoản đã được ${newStatus === "banned" ? "cấm" : "mở khóa"}!`
        );
        setUser((prev) => ({ ...prev, status: newStatus }));
      })
      .catch((error) => Alert.alert("Lỗi", error.message));
  };

  if (!user) return <Text>Đang tải...</Text>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      {editing ? (
        <>
          <TextInput
            style={styles.input}
            value={updatedUser.name}
            onChangeText={(text) =>
              setUpdatedUser({ ...updatedUser, name: text })
            }
          />
          <TextInput
            style={styles.input}
            value={updatedUser.email}
            onChangeText={(text) =>
              setUpdatedUser({ ...updatedUser, email: text })
            }
          />
          <TextInput
            style={styles.input}
            value={updatedUser.phone}
            onChangeText={(text) =>
              setUpdatedUser({ ...updatedUser, phone: text })
            }
          />
          <TextInput
            style={styles.input}
            value={updatedUser.address}
            onChangeText={(text) =>
              setUpdatedUser({ ...updatedUser, address: text })
            }
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
            <Text style={styles.buttonText}>Lưu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setEditing(false)}
          >
            <Text style={styles.buttonText}>Hủy</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.info}>Tên: {user.name}</Text>
          <Text style={styles.info}>Email: {user.email}</Text>
          <Text style={styles.info}>SĐT: {user.phone}</Text>
          <Text style={styles.info}>Địa chỉ: {user.address}</Text>
          <Text style={styles.info}>Trạng thái: {user.status}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.buttonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.banButton]}
            onPress={toggleBanUser}
          >
            <Text style={styles.buttonText}>
              {user.status === "banned" ? "Mở khóa" : "Cấm"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteUser}
          >
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  info: { fontSize: 18, marginBottom: 5 },
  button: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: { color: "#fff", fontSize: 16 },
  cancelButton: { backgroundColor: "#95a5a6" },
  deleteButton: { backgroundColor: "#e74c3c" },
  banButton: { backgroundColor: "#f39c12" },
});
