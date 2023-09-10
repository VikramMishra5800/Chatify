import { Button, FormControl, FormLabel, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import React from 'react'
import { useState } from 'react'
import { Input } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import axios from "axios";
import {useHistory} from "react-router-dom";

const Signup = () => {

  const [name,setName] = useState()
  const [email,setEmail] = useState()
  const [password,setPassword] = useState()
  const [confirmpassword,setConfirmpassword] = useState()
  const [pic,setPic] = useState()
  const [show,setShow] = useState(false)
  const [loading,setLoading] = useState(false);
  const toast = useToast();
  const history = useHistory();

  const handleClick = () => setShow(!show);

  const Gauth = () => {
      window.open(
      `${process.env.Website_URL}/auth/google`,"_self"
      );
  }

  //Local Registration
  const submitHandler = async() => {
    setLoading(true);
    if (!name || !email || !password || !confirmpassword) {
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

    if (password !== confirmpassword) {
        toast({
          title: "Passwords Do Not Match",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      try{
        const config = {
            headers:{"Content-type":"application/json",}
        }

        const {data} = await axios.post("/api/user",
        {
            name,
            email,
            password,
            pic
        },config)
        
        toast({
            title: "Registration Successful",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          localStorage.setItem("userInfo",JSON.stringify(data))
          setLoading(false);
          history.push("/chats");
      }
      catch(err){
        toast({
            title: "Error Occured! Either Email already exist or please try again!",
            description: err.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false);
      }
  }
  
  const postDetails = (pics) => {
     setLoading(true);

     if(pics===undefined)
     {
        toast({
            title: "Please Select an Image!",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "bottom",
        })
        return;
     }

     if(pics.type ==="image/jpeg" ||  pics.type === "image/png")
     {
        const data = new FormData();
        data.append("file",pics);
        data.append("upload_preset","Web-Chat-App");
        data.append("cloud_name","vikrammishra")

        fetch("https://api.cloudinary.com/v1_1/vikrammishra/image/upload",{
            method: "post",
            body: data,
        }).then((res) => res.json())
        .then((data)=>{
            setPic(data.url.toString())
            console.log(data);
            setLoading(false);
        })
        .catch((err)=>{
            console.log(err);
            setLoading(false);
        })
     }

     else{
        toast({
            title: "Please Select a .jpeg or .png format only!",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "bottom",
        })
        return;
    }
  }
  return (
    <VStack>
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          type={"text"}
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type={"email"}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter your Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* It is used to show and hide password */}
          <InputRightElement>
            <Button onClick={handleClick}>{show ? "Hide" : "Show"}</Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <InputRightElement>
            <Button onClick={handleClick}>{show ? "Hide" : "Show"}</Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl>
        <FormLabel>Upload Your Pic</FormLabel>
        <Input
          type={"file"}
          p={1.5}
          // to select image type file only
          accept="image/*"
          // to select single file only
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign Up
      </Button>

      <Button
        colorScheme="red"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={Gauth}
        isLoading={loading}
        textColor={'white'}
      >
      Sign up with Google
      </Button>
    </VStack>
  );
}

export default Signup
