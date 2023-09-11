import { Button, FormControl, FormLabel, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import React from 'react'
import { useState } from 'react'
import { Input } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import axios from "axios";
import {useHistory} from "react-router-dom";


const Login = () => {

    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [show,setShow] = useState(false)
    const [loading,setLoading] = useState(false);
    const toast = useToast();
    const history = useHistory();

    const handleClick = () => setShow(!show)

    const Gauth = () => {
      // console.log(process.env.REACT_APP_Website_URL);
      window.open(
      `${process.env.REACT_APP_Website_URL}/auth/google`,"_self"
      );
  }

    const submitHandler = async() => {
        setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    // console.log(email, password);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const {data} = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      // console.log(JSON.stringify(data));
      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } 
    
    catch (error) {
      toast({
        title: "Invalid Username or Password!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    }

  return (
    // vstack is used to align the elements in a vertical stack or column properly, it comes from chakra ui
    <VStack>
        
        <FormControl isRequired>
            <FormLabel>Email</FormLabel>
                <Input 
                    value={email}
                    type={"email"}
                    placeholder="Enter your email"
                    onChange={(e)=> setEmail(e.target.value)}
                />
        </FormControl>

        <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
            <Input 
                    value={password}
                    type={show ? "text" : "password"}
                    placeholder="Enter Password"
                    onChange={(e)=> setPassword(e.target.value)}
                />
                {/* It is used to show and hide password */}
                <InputRightElement>
                    <Button onClick={handleClick}>
                        {show ? "Hide" : "Show"}
                    </Button>
                </InputRightElement>
            </InputGroup>
                
        </FormControl>

        <Button 
            colorScheme="blue"
            width="100%"
            style={{marginTop: 15}}
            onClick={submitHandler}
            isLoading={loading}
            >
            Login
        </Button>

        <Button 
            colorScheme="red"
            width="100%"
            style={{marginTop: 15}}
            onClick={Gauth}
            isLoading={loading}
            >
            Sign In with Google
        </Button>
    </VStack>
  )
}

export default Login
