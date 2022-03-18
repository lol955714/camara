import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; 
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { Entypo } from '@expo/vector-icons'; 
import { CrossBusyIndicator } from 'react-native-cross-components';
import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
import DatePicker from 'react-native-datepicker'
import * as FileSystem from 'expo-file-system';
import Prompt from 'react-native-prompt-crossplatform';
export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const ref = React.createRef();
  const [showCamera, setShowCamera] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [comentarioIsSet, setComentarioIsSet]=useState(false);
  const [facturas, setFacturas]=useState([]);
  const [prompt, setPrompt]=useState(false);
  const [comentario, setComentario]=useState('');
  const [isBusy, setIsBusy]=useState(false);
  const [tipoFactura, setTipoFactura]=useState(0);
  const [objFoto, setObjFoto]=useState(Object);
  const [showMenu, setShowMenu] = useState(true);
  const [foto, setFoto] = useState('');
  const conversion = async (url )=>{
    const base64 = await FileSystem.readAsStringAsync(url, { encoding: 'base64' });
    //console.log(base64);
    return base64;
  };
  const guardarRemoto = async () =>{
    setIsBusy(true);
    //console.log("voy a guardar en remoto");
    let image= 'data:image/jpeg;base64,' + await conversion(foto)
    let factura={
              "fecha": fecha,
              "comentario": comentario,
              "fkTipoDeFactura": tipoFactura,
              "foto":image,
            }
    axios.post("http://10.168.241.38:8000/facturas/facturasp/", factura)
      .then((response)=>{
        //console.log(response);
        setComentario('');
        setIsBusy(false);
    })
    .catch(error=>{
        console.log(error.response.data.error);
        alert('Dificultades de red, comunicarse con el encargado de TI');
    });
    changeShowCamera();
  };
  const formatDate=(date)=> {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
  const [fecha, setFecha]=useState(formatDate(Date()));
  const changeShowCamera= async()=>{
    //console.log("voy a cambiar el modo");
    setFecha(formatDate(Date()));
    setComentarioIsSet(false);
    setComentario('');
    {showCamera ? setShowCamera(false) : setShowCamera(true)}
  };
  const changeMenu= async()=>{
    //console.log("voy a cambiar el modo");

    {showMenu ? setShowMenu(false) : setShowMenu(true)}
    setShowCamera(true);
    setComentarioIsSet(false);
  };
  const takePicture = async () => {
    setIsBusy(true);
    //console.log("voy a tomarla y guardar en cache");
    if (ref.current) {
      const options = { 
                        skipProcessing:true
                      };
      const data = await ref.current.takePictureAsync(options);
      setFoto(data.uri);
      setObjFoto(data);
      //await save(data.uri);
      //await guardarRemoto(data.uri);
      setIsBusy(false);
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
    axios.get("http://10.168.241.38:8000/facturas/tipofactura")
      .then((response)=>{
        setFacturas([...response.data]);
        setIsBusy(false);
    })
    .catch(error=>{
        console.log(error);
        alert('Dificultades de red, comunicarse con el encargado de TI');
    });
  };
  useEffect(() => {
    (async () => {
      setIsBusy(true);
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
      <CrossBusyIndicator
          isBusy={isBusy}
          type='BarIndicator'
          isCancelButtonVisible={false}
          message="Procesando"
    />
        {showMenu?(
          <View
          style={styles.container2}
          >
            <View
          style={styles.cameraView}
          >
            <Text
            style={styles.textEncabezado}
            >{`Seleccion el tipo de factura a procesar \n`}</Text>
            {facturas.length>0?
            facturas.map(r =>
              <View >
                <TouchableOpacity
                style={styles.button6}
                onPress={()=>{
                  changeMenu();
                  setTipoFactura(r.id);
                }}>
                  <Text
                  style={styles.textBoton}
                  >
                  { `${r.nombre}` } 
                  </Text>
                </TouchableOpacity>
                <Text>{` \n`}</Text>
              </View>
              ):
              <Text
              style={styles.textEncabezado}
              >{`Hay problemas de comuncacion con el servidor \n Por favor reportarlo al encargado de TI `}</Text>}
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
                <View
                  style={styles.buttomView2} 
                  >
                   <TouchableOpacity
                  style={styles.back}
                  >
                    <Entypo 
                    name="cross" 
                    size={45} 
                    color="black" 
                    onPress={()=>{
                      changeMenu();
                    }}/>
                  </TouchableOpacity>
                </View>
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
                    <AntDesign 
                      name="camera" 
                      size={40} 
                      color="black" 
                      onPress={()=>{
                        takePicture();
                      }}
                      />
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
             <View
                  style={styles.buttomView2} 
                  >
                   <TouchableOpacity
                  style={styles.back}
                  >
                    <Entypo 
                    name="cross" 
                    size={45} 
                    color="black" 
                    onPress={()=>{
                      changeMenu();
                    }}/>
                  </TouchableOpacity>
                  <TouchableOpacity
                  style={styles.back}
                  >
                    <Entypo 
                      name="cw" 
                      size={45} 
                      color="black" 
                      onPress={()=>{
                        changeShowCamera();
                      }}/>
                </TouchableOpacity>
                </View>
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
            <DatePicker
              style={styles.button4}
              date={fecha}
              mode="date"
              placeholder="Seleccione la fecha"
              format="YYYY-MM-DD"
              minDate="2020-01-01"
              maxDate={formatDate(Date())}
              confirmBtnText="Modificar"
              cancelBtnText="Cancelar"
              hideText= "True"
              onDateChange={
                (date) => {
                  setFecha(date)
                }
              }
            />
              <Prompt
              title="Ingrese Una descripción"
              placeholder="Detalle de la factura"
              submitButtonText="Listo"
              cancelButtonText="Cancelar"
              isVisible={prompt}
              defaultValue={comentario}
              onChangeText={(text) => {
                setComentario(text);
              }}
              onCancel={() => {
                setPrompt(false);
                if(comentario==''){
                  setComentarioIsSet(false);
                }
              }}
              onSubmit={() => {
                if(comentario!=''){
                  setPrompt(false);
                  setComentarioIsSet(true);
                }
              }}
            />
            <TouchableOpacity
              style={styles.button}
              >
                <AntDesign 
                  name="form" 
                  size={45} 
                  color="black" 
                  onPress={()=>{
                    setPrompt(true);
                  }}/>
            </TouchableOpacity>
            {comentarioIsSet?
            <TouchableOpacity
              style={styles.button}
              >
                <AntDesign 
                  name="upload" 
                  size={24} 
                  color="black" 
                  onPress={()=>{
                    guardarRemoto();
                  }}/>
            </TouchableOpacity>:
            <Text></Text>}
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
  back:{
    width: 100,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#ccc',
  },
  container: {
    backgroundColor: '#4b545d',
    width: '100%', 
    height: '100%',
  },
  textEncabezado: {
    fontSize: 40,
    color: '#000',
  },
  textBoton: {
    fontSize: 30,
    color: '#000',
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
  buttomView2:{
    justifyContent: 'flex-start',
    alignItems:'center',
    flexDirection: 'row'
  },
  button:{
    width: 85,
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
  },
  button6:{
    width: 350,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#ccc',
  },
  button4:{
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#ccc',
  },
});