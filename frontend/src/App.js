import './App.css';
// import { Button} from '@chakra-ui/react'
import { Route,Redirect } from 'react-router-dom';

// Components
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import { useState,useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@chakra-ui/react'

function App() {

  const [user, setUser] = useState(null);
  const toast = useToast();

	const getUser = async () => {
		try {
      console.log("api called");
			const url = "http://localhost:5000/auth/login/success";
			const { data } = await axios.get(url, { withCredentials: true });
			setUser(data);
      localStorage.setItem("userInfo",JSON.stringify(data));

      toast({
        title: "Login Successful!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
		} 
    catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		getUser();
	}, []);

  return (
    <div className="App">
     {/* <Button colorScheme='blue'>Button</Button> */}
      <Route path="/" exact render={() => (user ? <Redirect to="/chats" /> : <HomePage />)}/>
      <Route path="/chats" exact render={() => <ChatPage/>}/>
    </div>
  );
}

export default App;
