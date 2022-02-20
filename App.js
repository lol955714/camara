import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { AutoFocus } from 'expo-camera/build/Camera.types';
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const ref = React.createRef();
  const [showCamera, setShowCamera] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [facturas, setFacturas]=useState([]);
  const [showMenu, setShowMenu] = useState(true);
  const [foto, setFoto] = useState('');
  const conversion = async (url )=>{
    const base64 = await FileSystem.readAsStringAsync(url, { encoding: 'base64' });
    //console.log(base64);
    return base64;
  };
  const guardarRemoto = async () =>{
    //console.log("voy a guardar en remoto");
    let fot ={
      image: await conversion(foto)
    };
    axios.post("http://192.168.1.104:3000/api/fotos", fot)
      .then((response)=>{
        console.log(response);
    })
    .catch(error=>{
        console.log(error);
        alert('Dificultades de red, comunicarse con el encargado de TI');
    });
    changeShowCamera();
  };
  const changeShowCamera= async()=>{
    //console.log("voy a cambiar el modo");
    {showCamera ? setShowCamera(false) : setShowCamera(true)}
  };
  const changeMenu= async()=>{
    //console.log("voy a cambiar el modo");

    {showMenu ? setShowMenu(false) : setShowMenu(true)}
    setShowCamera(true);
  };
  const takePicture = async () => {
    //console.log("voy a tomarla y guardar en cache");
    if (ref.current) {
      const options = { quality: 0.5, base64: true };
      const data = await ref.current.takePictureAsync(options);
      setFoto(data.uri);
      //await save(data.uri);
      //await guardarRemoto(data.uri);
      await changeShowCamera();
    }
  };
  const save = async()=>{
    //console.log("voy a guardar en local");
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      const assert = await MediaLibrary.createAssetAsync(foto);
      await MediaLibrary.createAlbumAsync("Tutorial", assert);
    } else {
      alert('Olvidaste dar los permisos a la aplicacion')
    }
    changeShowCamera();
  }
  const buscarFacturas = async()=>{
    axios.get("http://192.168.1.104:3000/api/facturas")
      .then((response)=>{
        setFacturas([...response.data]);
    })
    .catch(error=>{
        console.log(error);
        alert('Dificultades de red, comunicarse con el encargado de TI');
    });
  };
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      await buscarFacturas();
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <View>
        {showMenu?(
          <View
          style={styles.container2}
          >
            <View
          style={styles.cameraView}
          >
            <Text>Menú bien perrón</Text>
            {facturas.map(r =>
              <TouchableOpacity
            style={styles.button2}
            onPress={()=>{
              changeMenu();
            }}>
              <Text>
               { r.nombre}
              </Text>
            </TouchableOpacity>
            )}
          </View>
          </View>
          ):(
            showCamera ? (
              <View
              style={styles.container} 
              >
                <View
                style={styles.cameraView} 
                >
                  <Camera 
                  style={styles.camera} 
                  type={type}
                  ref={ref}>
                  </Camera>
                </View>
                <View
                style={styles.buttomView} 
                >
                  <TouchableOpacity
                  style={styles.button}
                  >
                    <Text
                      title="Take"
                      onPress={()=>{
                        takePicture();
                      }}
                    >
                      Tomar foto
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                  style={styles.button3}
                  >
                    <Text
                      title="menu"
                      onPress={()=>{
                        changeMenu();
                      }}
                    >
                      menú 
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ):(
              <View
          style={styles.container}
          >
            <View
            style={styles.cameraView} 
            >
              {foto.length>0?(
                <Image
                style={styles.camera}
                source={{
                  uri: foto,
                }}
                />
              ):(
                <Text>
                  No se ha encontrado la imagen
                </Text>
              )}
            </View>
            <View
            style={styles.buttomView} 
            >
              <TouchableOpacity
              style={styles.button}
              >
                <Text
                  title="Tomar otra"
                  onPress={()=>{
                    changeShowCamera();
                  }}
                >
                  Tomar otra
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              >
                <Text
                  title="Enviar"
                  onPress={()=>{
                    guardarRemoto();
                  }}
                >
                  Subir
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              >
                <Text
                  title="Guardar local"
                  onPress={()=>{
                    save();
                  }}
                >
                  Guardar local
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={styles.button3}
            >
              <Text
                title="menu"
                onPress={()=>{
                  changeMenu();
                }}
              >
                menú 
              </Text>
            </TouchableOpacity>
            </View>
          </View>
            )
          )
        }
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%', 
    height: '100%',
  },
  container2: {
    backgroundColor: '#fff',
    width: '100%', 
    height: '100%',
    alignContent: 'center',
    justifyContent: 'center'
  },
  camera:{
    width: '100%', 
    height: '80%',
  },
  cameraView:{
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttomView:{
    justifyContent: 'center',
    alignItems:'center',
    flexDirection: 'row'
  },
  button:{
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#ccc',
  },
  button2:{
    width: 200,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#ccc',
  },
  button3:{
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#ccc',
  }
});
