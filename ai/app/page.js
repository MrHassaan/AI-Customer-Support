'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Ruby, your support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    setIsLoading(true)

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
    setMessage('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      color="white"
      bgcolor="#121212"  // Dark background color
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid #333"  // Border color
        p={2}
        spacing={3}
        bgcolor="#1e1e1e"  // Slightly lighter background for the chat container
        borderRadius={4}
      >
        <Stack
          direction={'column'}
          spacing={2}
          sx={{ flexGrow: 1, overflow: 'auto', maxHeight: '100%' }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? '#1976d2'  // Blue for assistant messages
                    : '#2e7d32'  // Green for user messages
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            InputLabelProps={{
              style: { color: '#888' },  // Label color
            }}
            InputProps={{
              style: {
                color: 'white',  // Text color
                backgroundColor: '#333',  // Input field background color
                borderRadius: 8,
              },
            }}
          />
          <Button 
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              bgcolor: '#388e3c',  // Default button color (green)
              '&:hover': {
                bgcolor: '#2e7d32',  // Hover color (darker green)
              },
              '&:disabled': {
                bgcolor: '#555',  // Disabled color
              },
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
