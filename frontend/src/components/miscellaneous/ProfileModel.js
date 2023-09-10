import React from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    IconButton,
    Button,
    Image,
    Text,
    useDisclosure
  } from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons';

const ProfileModel = ({user,children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>{
      children ? (<span onClick={onOpen}>{children}</span>) : (
        <IconButton d={{base: "flex"}} icon={<ViewIcon />} onClick={onOpen}/>)
    }

    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent height="380px">
          <ModalHeader
             fontSize="30px"
             fontFamily="Work sans"
             display="flex"
             justifyContent="center"
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image 
               borderRadius="full"
               boxSize="150px"
               src={user.pic}
               alt={user.name} 
            />

            <Text>{user.email}</Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  )
}

export default ProfileModel
