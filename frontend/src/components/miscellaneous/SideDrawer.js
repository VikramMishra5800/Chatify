import { Box, Button, Tooltip,Text,Menu, MenuButton, MenuList, Avatar, MenuItem, MenuDivider,useDisclosure} from '@chakra-ui/react';
import React, { useState } from 'react'
import {SearchIcon,BellIcon,ChevronDownIcon} from "@chakra-ui/icons";
import { ChatState } from '../../context/ChatProvider';
import ProfileModel from './ProfileModel';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import UserListItem from "../userAvatar/UserListItem";
import { Input } from "@chakra-ui/input";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import NotificationBadge from "react-notification-badge";
import {Effect} from "react-notification-badge";

const SideDrawer = () => {

  const[search,setSearch] = useState("");
  const[searchResult,setSearchResult] = useState([]);
  const[loading,setLoading] = useState(false);
  const[loadingChat,setLoadingChat] = useState();

  const toast = useToast();

  const {
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification
  } = ChatState();
  
  const logOutHandler = () => {

    localStorage.removeItem("userInfo");
    toast({
      title: "Logged out Successfully!",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    window.open("http://localhost:5000/auth/logout","_self");
  }

  const { isOpen, onOpen, onClose } = useDisclosure();


  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
     <Box
       display={"flex"}
       justifyContent="space-between"
       alignItems={"center"}
       bg="white"
       w={"100%"}
       p="5px 10px 5px 10px"
       borderWidth={"5px"}
     >
      <Tooltip label = "Search Users to chat" hasArrow placement='bottom-end'>
        <Button variant={"ghost"} onClick={onOpen}>
          <SearchIcon />
          <Text display={{base: "none",md: "flex"}} px = "4">
            Search User
          </Text>
        </Button>
      </Tooltip>

      <Text fontSize={"2xl"} fontFamily="Work sans">
        Talk-With-Others
      </Text>

      <div>
        <Menu>
          <MenuButton p={1}>
          <NotificationBadge
            count = {notification.length}
            effect = {Effect.SCALE}
           />
            <BellIcon fontSize={"2xl"} m={1}/>
          </MenuButton>
          <MenuList pl={2}>
            {!notification.length && "No New Messages"}

            {notification.map((notif)=>(
              <MenuItem key = {notif._id} onClick={()=>{
                setSelectedChat(notif.chat);
                setNotification(notification.filter((n)=>n !== notif));
              }}>
                {notif.chat.isGroupChat? `New Message in ${notif.chat.chatName}`
                                      : `New Message from ${notif.sender.name}`
                }
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}/>
          </MenuButton>

          <MenuList>
            <ProfileModel user={user}>
              <MenuItem>My Profile</MenuItem>
            </ProfileModel>
            <MenuDivider />
              <MenuItem onClick={logOutHandler}>Log Out</MenuItem>
          </MenuList>
        </Menu>
      </div>

     </Box>

     <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

    </>
  )
}

export default SideDrawer
