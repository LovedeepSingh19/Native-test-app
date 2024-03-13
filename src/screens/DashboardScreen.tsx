import React, { useEffect, useState } from "react";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Paragraph from "../components/Paragraph";
import Button, { ButtonMode } from "../components/Button";
import { Image, Modal, Button as NativeButton, StyleSheet, View } from 'react-native';

import { loadData, removeData } from "../store/store";
import * as ImagePicker from "expo-image-picker"
import axios from "axios";
import { useToast } from "react-native-toast-notifications";
import * as Location from 'expo-location';


export default function Dashboard({ navigation }: any) {
  const [image, setImage] = useState<string|null>();
  const [modalVisible, setModalVisible] = useState(false);
  const toast = useToast()

  const openModalWithImage = (imageUri:string) => {
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
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return false
    }
    return true
  };

  const openCamera = async () => {
    const val = await requestPermissions()
    if(val){
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      console.log(result.assets![0].uri)
      if (!result.canceled) {
        openModalWithImage(result.assets![0].uri)
      }

    }
  
  };

  const PostUploadApiCall = async () => {
    const {token, email} = await loadData(`${process.env.CACHE_KEY}`)
    let location = await Location.getCurrentPositionAsync({});
    axios.post(`${process.env.BACKEND_SERVER_URL}/form`, 
    {
        latitude: location.coords.latitude, longitude: location.coords.longitude, image:"img"
      },
      {headers: {authToken:token, userEmail: email}}
      )
      .then(function (response) {
        console.log(response.data);
        if (response.data.success === true) {
          toast.show("Uploaded", { normalColor: "green" });

          // saveData(`${process.env.CACHE_KEY}`, {email:response.data.email, name:response.data.name, token: response.data.token, })
          // navigation.reset({
          //   index: 0,
          //   routes: [{ name: "Dashboard" }],
          // });
        } else {
          toast.show(response.data.message);
        }
      })
      .catch((error) => toast.show(`${error}`));
  };

  return (
    <Background>
      <Logo />
      <Header>Let’s start</Header>
      <Paragraph>
        Your amazing app starts here. Open you favorite code editor and start
        editing this project.
      </Paragraph>
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
          <NativeButton title="Close" onPress={() => closeModal()} />
          <NativeButton title="Upload" onPress={async () => {await PostUploadApiCall();closeModal()}} />
        </View>
      </Modal>
      <Button
        mode={ButtonMode.Outlined}
        onPress={async () => await openCamera()}
      >
        test
      </Button>
      <Button
        mode={ButtonMode.Outlined}
        onPress={() => {
          removeData(`${process.env.CACHE_KEY}`),
            navigation.reset({
              index: 0,
              routes: [{ name: "StartScreen" }],
            });
        }}
      >
        Logout
      </Button>
      {/* {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />} */}
    </Background>
  );
}

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalImage: {
    width: 200,
    height: 200,
    // marginBottom: 20,
  },
});