import { useEffect, useState, useRef } from 'react';
import { Send, Loader2, MessageCircle, LayoutGrid, LogOut, Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const SOCKET_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : window.location.origin;

const socket = io(SOCKET_URL, {
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

const Orbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="orb bg-primary/40 w-[500px] h-[500px] -top-32 -left-32 animate-float-slow" />
    <div className="orb bg-accent/40 w-[600px] h-[600px] top-1/3 -right-40 animate-float-slower" />
    <div className="orb bg-primary/30 w-[400px] h-[400px] bottom-0 left-1/3 animate-float-slow" style={{ animationDelay: '4s' }} />
  </div>
);

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef();
  const room = 'general';

  useEffect(() => {
    socket.emit('join_room', room);
    socket.on('receive_msg', data => setMessages(m => [...m, data]));
    return () => socket.off('receive_msg');
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    socket.emit('send_msg', { room, message: text.trim(), user: user?.name });
    setText('');
    setSending(false);
  };

  const navItem = (to, label, Icon) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <Orbs />

      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 btn-gradient rounded-lg blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative btn-gradient h-9 w-9 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">Task<span className="gradient-text">Flow</span></span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItem('/dashboard', 'Board', LayoutGrid)}
            {navItem('/chat', 'Chat', MessageCircle)}
          </nav>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="container flex-1 flex flex-col py-6 max-w-3xl">
        <div className="glass-strong rounded-2xl flex-1 flex flex-col overflow-hidden animate-fade-in">
          <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div>
              <h1 className="text-lg font-semibold">Team Chat</h1>
              <p className="text-xs text-muted-foreground">Real-time conversation</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-done/10 border border-status-done/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-status-done animate-pulse-dot" />
                <span className="relative rounded-full h-2 w-2 bg-status-done" />
              </span>
              <span className="text-xs font-medium text-status-done">Live</span>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-6 space-y-3 min-h-[50vh]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-1">Say hello to start the conversation 👋</p>
              </div>
            ) : (
              messages.map((m, i) => {
                const mine = m.user === user?.name;
                return (
                  <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {!mine && <span className="text-[11px] text-muted-foreground px-3">{m.user}</span>}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${mine ? 'btn-gradient text-white rounded-br-sm' : 'glass rounded-bl-sm'}`}>
                        {m.message}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={send} className="p-4 border-t border-white/5 flex gap-2">
            <input value={text} onChange={e => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
            <button type="submit" disabled={sending || !text.trim()}
              className="h-11 px-5 rounded-xl btn-gradient text-white font-medium flex items-center gap-2 disabled:opacity-50">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Send</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}