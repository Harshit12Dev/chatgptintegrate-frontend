import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://192.168.1.230:5000');

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false); // Loader state

  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      setMessages((prev) => [...prev, data]);
      speakMessage(data.botReply);
      setLoading(false);
    });

    socket.on('imageGenerated', (data) => {
      setImageUrl(data.imageUrl);
      setLoading(false);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('imageGenerated');
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    setLoading(true);
    socket.emit('sendMessage', { message, userId: 1 });
    setMessage('');
  };

  const generateImage = () => {
    if (!imagePrompt.trim()) return;
    setLoading(true);
    socket.emit('generateImage', { prompt: imagePrompt, userId: 1 });
    setImagePrompt('');
  };

  // Function to handle text-to-speech
  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-Speech is not supported in this browser.');
    }
  };

  return (
    <div className='max-w-lg mx-auto mt-10 p-5 border rounded shadow'>
      <h2 className='text-xl font-bold mb-3'>ChatGPT Chat</h2>

      {/* Chat Messages */}
      <div className='h-64 overflow-y-auto p-2 border mb-3'>
        {messages.map((msg, index) => (
          <p key={index} className='mb-1'>
            <b>You:</b> {msg.message} <br />
            <b>ChatGPT:</b> {msg.botReply}
          </p>
        ))}
        {loading && <p className='text-gray-500 italic'>Thinking...</p>}
      </div>

      {/* Text Input */}
      <div className='flex gap-2'>
        <input
          type='text'
          className='w-full p-2 border rounded'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Type a message...'
        />
        <button
          className='bg-gray-900 text-white px-3 py-1'
          onClick={sendMessage}
          disabled={loading}>
          {loading ? 'Generating...' : 'Send'}
        </button>
      </div>

      {/* Image Generation */}
      <div className='mt-5'>
        <h2 className='text-xl font-bold mb-3'>Generate Image</h2>
        <input
          type='text'
          className='w-full p-2 border rounded'
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder='Describe an image...'
        />
        <button
          className='bg-blue-600 text-white px-3 py-1 mt-2'
          onClick={generateImage}
          disabled={loading}>
          {loading ? 'Generating Image...' : 'Generate Image'}
        </button>
      </div>

      {/* Display Generated Image */}
      {imageUrl && (
        <div className='mt-5'>
          <h2 className='text-xl font-bold mb-3'>Generated Image</h2>
          <img
            src={imageUrl}
            alt='Generated'
            className='w-full rounded shadow'
          />
        </div>
      )}
    </div>
  );
}
