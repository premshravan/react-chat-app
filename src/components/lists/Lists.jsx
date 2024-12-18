import React from 'react'
import './lists.css'
import UserInfo from './userInfo/UserInfo'
import ChatLists from './chatLists/ChatLists'

const Lists = () => {
  return (
    <div className='lists'>
      <UserInfo/>
      <ChatLists />
    </div>
  )
}

export default Lists