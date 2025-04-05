import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";

export default function UserListScreen({ navigation }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setUsers(userList);
      }
    });
  }, []);

  // Render mỗi user
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("UserDetailScreen", { userId: item.id })
      }
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.status}>
          {item.status === "active" ? "🟢 Hoạt động" : "🔴 Bị khóa"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Danh sách người dùng</Text>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 30,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold" },
  email: { fontSize: 14, color: "gray" },
  status: { fontSize: 14, fontWeight: "bold", marginTop: 5 },
});
