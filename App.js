import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View , TouchableOpacity,TextInput,ScrollView, Alert } from 'react-native';
import { theme } from './color';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome from '@expo/vector-icons/FontAwesome';
const STORAGE_KEY = '@todos'

export default function App() {
  const [working,setWorking] = useState('work');
  const travelTouch = ()=>{
    setWorking('travel');
  }
  const workTouch = ()=>{
    setWorking('work');
  }

  const [modiState,setModiState] = useState(false);
  const [modiData,setModiData] = useState({});
  const [txt,setTxt] = useState('');
  const [todos,setTodos] = useState([]);
  const saveTxt = async ()=>{
    if(txt===''){
      setModiState(false);
      return;
    }
    if(!modiState){
      const newTodos = {
        id : Date.now(),
        text : txt,
        work : working==='work'?'work':'travel',
        state : false,
      }
      const updateData = [...todos, newTodos];
      setTodos(updateData);
      saveTodo(updateData);
    } else {
      const updateData = todos.map(obj => 
        obj.id===modiData.id ? {...obj, text:txt} : obj
      );
      setTodos(updateData);
      saveTodo(updateData);
      setModiState(false);
      setModiData(null);
    }
    setTxt('');
  }

  const filtered = todos.filter(obj => obj.work === working);
  const saveTodo = async (data)=>{
    try{
      await AsyncStorage.setItem( STORAGE_KEY ,JSON.stringify(data));
    }
    catch (error) {
      console.error('에러 :', error);
    }
  }

  const loadTodo = async()=>{
    try{
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if(!data){
        return
      }
      setTodos(JSON.parse(data));
    }
    catch(error){
      console.error('에러 : ',error);
    }
  }

  const delTodo = async(id)=>{
    Alert.alert('삭제하시겠습니까?','삭제된 데이터는 되돌릴수 없습니다.',[
      {
        text:'취소'
      },
      {
        text:'삭제',
        onPress : async()=>{
          try{
            const delData = todos.filter(obj=>obj.id!==id);
            setTodos(delData);
            await saveTodo(delData);
          }
          catch(error){
            console.error('삭제 에러 : ',error);
          }
        }
      }
    ]);
  }

  const modiTodo = (id)=>{
    setModiState(true);
    const data = todos.find(obj=>obj.id===id);
    setModiData(data);
    setTxt(data.text);
  }

  const checkTodo = (id)=>{
    const data = todos.find(obj=>obj.id===id);
    const checkData = todos.map(obj=>
      obj.id===data.id ? {...obj,state:!obj.state} : obj
    )
    setTodos(checkData);
    saveTodo(checkData);
  }

  useEffect(()=>{
    loadTodo();
  },[])

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <TouchableOpacity onPress={workTouch}>
          <Text style={{...styles.btnText,color:working==='work'?'white':theme.gray}}>ToDo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travelTouch}>
          <Text style={{...styles.btnText,color:working==='travel'?'white':theme.gray}}>Memo</Text>
        </TouchableOpacity>
      </View>

      <TextInput placeholder={working==='work'?'할 일을 입력해주세요.':'메모를 입력해주세요.'} style={styles.input} value={txt} onChangeText={(e)=>{setTxt(e)}} onSubmitEditing={saveTxt} />
      {
        filtered.length>0 ?
        <ScrollView>
        {
          filtered.map((obj)=>(
            <View key={obj.id} style={styles.todo_list}>
              <Text style={obj.state?styles.todo_text_done:styles.todo_text}>{obj.text}</Text>
              <View style={styles.icon_box}>
                <TouchableOpacity onPress={()=>{delTodo(obj.id)}}>
                  <Fontisto name="trash" size={18} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>{modiTodo(obj.id)}}>
                  <FontAwesome name="pencil" size={18} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={()=>{checkTodo(obj.id)}}>
                  <Fontisto name="check" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        }
      </ScrollView>
      :
      <View style={styles.todo_list}>
        <Text style={styles.todo_text}>리스트가 없습니다.</Text>
      </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal:10,
  },
  header:{
    flexDirection : 'row',
    justifyContent : 'space-between',
    marginTop:100,
    paddingHorizontal :20,

  },
  btnText:{
    fontSize : 38,
    fontWeight : '600',
  },
  input :{
    backgroundColor : 'white',
    paddingVertical : 15,
    paddingHorizontal : 20,
    borderRadius :30,
    marginVertical :20,
    fontSize : 16,
  },
  todo_list:{
    backgroundColor : theme.gray,
    marginBottom:10,
    paddingVertical:20,
    paddingHorizontal:20,
    borderRadius:15,
    flexDirection : 'row',
    justifyContent : 'space-between',
    alignItems : 'center',
  },
  todo_text:{
    color:'white',
    fontSize : 16,
    fontWeight:500,
  },
  todo_text_done:{
    color:'white',
    fontSize : 16,
    fontWeight:500,
    opacity:0.3,
    textDecorationLine:'line-through',
  },
  icon_box : {
    flexDirection:'row',
    gap:25,
  },
  
});
