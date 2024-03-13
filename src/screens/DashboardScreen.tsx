import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Button as NativeButton,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";

import { loadData, removeData } from "../store/store";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useToast } from "react-native-toast-notifications";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome from @expo/vector-icons

export default function Dashboard({ navigation }: any) {
  const [image, setImage] = useState<string | null>();
  const [data, setData] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadData(`${process.env.CACHE_KEY}`).then(({ token }) => {
      axios.get(`${process.env.BACKEND_SERVER_URL}/data`, {
        headers: { authToken: token },
      }).then((res) => setData(res.data));
    });
  }, []);

  const openModalWithImage = (imageUri: string) => {
    setImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setImage(null);
    setModalVisible(false);
  };
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    const granted = await Location.requestForegroundPermissionsAsync();
    if (granted) {
      console.log("Location permission granted");
    } else {
      console.log("Location permission denied");
    }
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return false;
    }
    return true;
  };

  const openCamera = async () => {
    const val = await requestPermissions();
    if (val) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      console.log(result.assets![0].uri);
      if (!result.canceled) {
        try {
          openModalWithImage(result.assets![0].uri);

          console.log("Image uploaded to Firebase Storage successfully.");
        } catch (error) {
          console.error("Error uploading image to Firebase Storage:", error);
        }
      }
    }
  };

  const convertImageToBase64 = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const PostUploadApiCall = async () => {
    const { token, email } = await loadData(`${process.env.CACHE_KEY}`);
    let location = await Location.getCurrentPositionAsync({});
    const base64ImageData = await convertImageToBase64(image!);
    console.log("baseImg-----", image!);

    axios
      .post(
        `${process.env.BACKEND_SERVER_URL}/form`,
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          image: base64ImageData,
        },
        { headers: { authToken: token, userEmail: email } }
      )
      .then(function (response) {
        console.log(response.data);
        if (response.data.success === true) {
          toast.show("Uploaded", { normalColor: "green" });
        } else {
          toast.show(response.data.message);
        }
      })
      .catch((error) => toast.show(`${error}`));
  };

  const renderBox = ({item, index }: any) => (
    <TouchableOpacity
    key={index}
    style={styles.box}
    onPress={() => {
      openModalWithImage(item["image"]);
    }}
  >
    <Image source={{uri:item["image"]}} style={styles.image} />
  </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          closeModal();
        }}
      >
        <View style={styles.modalView}>
          <Image source={{ uri: image! }} style={styles.modalImage} />
          <FontAwesome 
  name="times-circle" 
  size={24} 
  color="white" 
  style={styles.closeIcon} 
  onPress={() => closeModal()} 
/>
          <NativeButton
            title="Upload"
            onPress={async () => {
              await PostUploadApiCall();
              closeModal();
            }}
          />
        </View>
      </Modal>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 280,
          paddingBottom: 5,
          padding: 2,
          backgroundColor: "#ffffff",
        }}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={async () => await openCamera()}
        >
          <FontAwesome name="plus" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 10, backgroundColor: "#000000" }]}
          onPress={() => {
            removeData(`${process.env.CACHE_KEY}`);
            navigation.reset({
              index: 0,
              routes: [{ name: "StartScreen" }],
            });
          }}
        >
          <FontAwesome name="sign-out" size={18} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
  data={data}
  renderItem={renderBox}
  numColumns={2}
  keyExtractor={(item, index) => index.toString()}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
    paddingTop: 50,
    backgroundColor: "#ffffff",
  },
  modalView: {
    flex: 1,
    height: 500,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)"
  },
  modalImage: {
    width: 300,
    height: 400,
    borderRadius: 20
  },
  button: {
    backgroundColor: "#000000",
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    borderRadius: 100,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  box: {
    width: "50%",
    aspectRatio: 1,
    margin: "0.5%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#000000",
  },
  image: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    height: '100%',
    resizeMode: 'cover',
  },
  closeIcon: {
    position: 'absolute',
    color: "rgba(0, 0, 0)",
    top: 185,
    fontSize: 50,
    right: 40,
  },
});
