import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000');

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const room = 'general';
  const bottomRef = useRef();

  useEffect(() => {
    socket.emit('join_room', room);
    socket.on('receive_msg', (data) => {
      setMessages(prev => [...prev, data]);
    });
    return () => socket.off('receive_msg');
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text) return;
    socket.emit('send_msg', { room, message: text, user: user?.name });
    setText('');
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>💬 General Chat</h2>
        <button onClick={() => navigate('/dashboard')}>← Back</button>
      </div>
      <div style={{ height: 400, overflowY: 'auto', background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{m.user}: </strong>{m.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..." style={{ flex: 1, padding: 8 }} />
        <button onClick={sendMessage} style={{ padding: '8px 16px' }}>Send</button>
      </div>
    </div>
  );
}