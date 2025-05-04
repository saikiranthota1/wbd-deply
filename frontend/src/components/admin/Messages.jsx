'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ChevronRight, ArrowLeft, MessageCircle } from 'lucide-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import io from 'socket.io-client'

const socket = io(process.env.REACT_APP_BACKENDURL)

export default function StartupMessages() {
  const [startups, setStartups] = useState([])
  const [selectedStartup, setSelectedStartup] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [unreadMessages, setUnreadMessages] = useState({})
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/admin/startups`)
        setStartups(response.data)
      } catch (error) {
        console.error('Error fetching startups:', error)
      }
    }

    fetchStartups()

    socket.on('receiveMessage', (messageData) => {
      console.log("Message received: ", messageData)
      setMessages((prevMessages) => (prevMessages ? [...prevMessages, messageData] : [messageData]))
      setUnreadMessages((prev) => ({
        ...prev,
        [messageData.roomId]: (prev[messageData.roomId] || 0) + 1
      }))
    })

    socket.on('connect', () => {
      console.log('Connected to the server with ID:', socket.id)
    })

    return () => {
      socket.off('receiveMessage')
      socket.off('connect')
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleStartupClick = async (startupId) => {
    setSelectedStartup(startupId)
    socket.emit('joinRoom', startupId)
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKENDURL} /admin/messages/${startupId}`)
      setMessages(response.data.messsages || [])
      setUnreadMessages((prev) => ({ ...prev, [startupId]: 0 }))
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleBackToStartups = () => {
    setSelectedStartup(null)
  }

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return
    const newMessage = {
      message: inputMessage,
      sender: 'admin',
      roomId: selectedStartup,
    }
    socket.emit('sendMessage', {
      roomId: selectedStartup,
      messageData: newMessage,
    })
    // setMessages((prevMessages) => [...prevMessages, newMessage])
    setInputMessage('')
  }

  const handleBroadcastMessage = () => {
    if (inputMessage.trim() === '') return
    console.log("broadcasting message", inputMessage)
    const newMessage = {
      message: inputMessage,
      sender: 'admin',
    }
    socket.emit('BroadcastMessage', {
      messageData: newMessage,
    })
    setInputMessage('')
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AnimatePresence mode="wait">
        {selectedStartup ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-4 flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <motion.button
                onClick={handleBackToStartups}
                className="mr-4 p-2 rounded-full hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
              <h2 className="text-xl font-bold">
                {startups.find((s) => s._id === selectedStartup)?.kyc.company_name}
              </h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl ${
                      message.sender === 'admin'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-white text-gray-800 shadow-lg border border-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="startups"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
              <h1 className="text-2xl font-bold">Startups</h1>
            </div>
            <div className="p-4 bg-white/90 backdrop-blur-sm border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Broadcast message..."
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBroadcastMessage}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {startups.map((startup) => (
                <motion.div
                  key={startup._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    className="w-full p-4 text-left hover:bg-gray-50 rounded-xl flex justify-between items-center focus:outline-none transition-all duration-300 group"
                    onClick={() => handleStartupClick(startup._id)}
                  >
                    <div>
                      <h2 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                        {startup.kyc.company_name}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      {unreadMessages[startup._id] > 0 && (
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {unreadMessages[startup._id]}
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-300" />
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}