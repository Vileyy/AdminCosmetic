import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { database } from "../../config/firebaseConfig";
import { ref, onValue, remove, query, orderByChild } from "firebase/database";
import { useFocusEffect } from "@react-navigation/native";

const NotificationListScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notifications when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
      return () => {};
    }, [])
  );

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const notificationsRef = ref(database, "notifications");
      const notificationsQuery = query(
        notificationsRef,
        orderByChild("createdAt")
      );

      onValue(
        notificationsQuery,
        (snapshot) => {
          const data = snapshot.val();
          const notificationsList = [];

          if (data) {
            // Convert object to array and reverse to get newest first
            Object.keys(data).forEach((key) => {
              notificationsList.push({
                id: key,
                ...data[key],
              });
            });
            // Sort by createdAt in descending order (newest first)
            notificationsList.sort(
              (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
            );
          }

          setNotifications(notificationsList);
          setLoading(false);
        },
        {
          onlyOnce: true,
        }
      );
    } catch (error) {
      console.error("Error fetching notifications: ", error);
      Alert.alert("Error", "Failed to load notifications");
      setLoading(false);
    }
  };

  const deleteNotification = (id) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa thông báo này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const notificationRef = ref(database, `notifications/${id}`);
            await remove(notificationRef);
            // Update the state to remove the deleted notification
            setNotifications((prev) => prev.filter((item) => item.id !== id));
            Alert.alert("Thành công", "Đã xóa thông báo");
          } catch (error) {
            console.error("Error deleting notification: ", error);
            Alert.alert("Lỗi", "Không thể xóa thông báo");
          }
        },
      },
    ]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";

    const date = new Date(timestamp);
    return (
      date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.date}>Ngày tạo: {formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý thông báo</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddNotificationScreen")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có thông báo nào</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    padding: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  actions: {
    justifyContent: "center",
    marginLeft: 12,
  },
  deleteButton: {
    padding: 8,
  },
});

export default NotificationListScreen;
