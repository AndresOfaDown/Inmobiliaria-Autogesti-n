import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  MessageSquare,
  Send,
  X,
  Compass,
  MapPin,
  Image,
  Paperclip,
  CheckCheck,
  User,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function LiveChatModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName = 'Propietario',
  inmuebleId = null,
  inmuebleTitulo = null,
}) {
  const { user } = useAuthStore();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Initialize Socket.io
  useEffect(() => {
    if (!isOpen || !user) return;

    const s = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      s.emit('register_user', { userId: user.id });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [isOpen, user]);

  // Load or initiate conversation
  useEffect(() => {
    if (!isOpen || !user || !targetUserId) return;

    setLoading(true);
    api
      .post('/chat/initiate', {
        targetUserId,
        inmuebleId,
      })
      .then((res) => {
        setChat(res.data);
        return api.get(`/chat/${res.data.id}/messages`);
      })
      .then((res) => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error initiating chat:', err);
        setLoading(false);
      });
  }, [isOpen, targetUserId, inmuebleId, user]);

  // Join chat room via Socket.io
  useEffect(() => {
    if (!socket || !chat) return;

    socket.emit('join_chat', { chatId: chat.id });

    socket.on('new_message', (msg) => {
      if (msg.chatId === chat.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.emit('leave_chat', { chatId: chat.id });
      socket.off('new_message');
    };
  }, [socket, chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !chat || !user) return;

    const payload = {
      chatId: chat.id,
      remitenteId: user.id,
      tipo: 'texto',
      contenido: text.trim(),
    };

    if (socket) {
      socket.emit('send_message', payload);
    } else {
      await api.post(`/chat/${chat.id}/messages`, payload);
      const res = await api.get(`/chat/${chat.id}/messages`);
      setMessages(res.data);
    }

    setText('');
  };

  const sendTourShortcut = () => {
    if (!chat || !user) return;
    const payload = {
      chatId: chat.id,
      remitenteId: user.id,
      tipo: 'recorrido360',
      contenido: `He iniciado una consulta sobre el recorrido virtual 360° para: "${inmuebleTitulo || 'este inmueble'}". ¿Podemos coordinar detalles?`,
    };
    if (socket) socket.emit('send_message', payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col h-[580px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm">
              {targetUserName[0] || 'U'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {targetUserName}
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {inmuebleTitulo ? `Ref: ${inmuebleTitulo}` : 'Chat en Tiempo Real'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick action bar */}
        {inmuebleTitulo && (
          <div className="px-4 py-2 bg-indigo-950/30 border-b border-indigo-900/40 flex items-center justify-between text-xs">
            <span className="text-indigo-300 truncate max-w-[280px]">
              {inmuebleTitulo}
            </span>
            <button
              onClick={sendTourShortcut}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-medium"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Vincular 360°</span>
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/60">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Conectando canal seguro de mensajería...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center p-6">
              <MessageSquare className="w-8 h-8 text-slate-700 mb-2" />
              <p>Inicia la conversación directamente con el propietario sin intermediarios.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.remitenteId === user?.id;
              return (
                <div
                  key={m.id || Math.random()}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                      isMine
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/80'
                    }`}
                  >
                    {m.tipo === 'recorrido360' && (
                      <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1 text-emerald-300">
                        <Compass className="w-3.5 h-3.5" />
                        <span>Recorrido 360° Asociado</span>
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{m.contenido}</p>
                    <div
                      className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                        isMine ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      <span>{new Date(m.creado || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMine && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje seguro..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
