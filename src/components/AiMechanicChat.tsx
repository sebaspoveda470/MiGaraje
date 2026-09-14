import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  User, 
  RefreshCw
} from 'lucide-react';
import { Vehicle } from '../types';
import { getClientChatResponse } from '../services/geminiClientService';

interface AiMechanicChatProps {
  isOpen: boolean;
  onClose: () => void;
  activeVehicle: Vehicle | null;
  onNavigateToTab: (tab: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

export const AiMechanicChat: React.FC<AiMechanicChatProps> = ({
  isOpen,
  onClose,
  activeVehicle,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: activeVehicle
        ? `¡Hola! Soy tu asistente mecánico y perito automotriz de MiGaraje. Detecto que tienes registrado tu **${activeVehicle.brand} ${activeVehicle.model} ${activeVehicle.year} (${activeVehicle.mileage.toLocaleString()} km)**. ¿En qué te puedo asesorar hoy? (diagnóstico de ruidos, códigos OBD-II, búsqueda de repuestos, peritajes o detailing).`
        : '¡Hola! Soy tu asistente mecánico y de intermediación automotriz en MiGaraje. Pregúntame sobre cualquier falla, cotizaciones de repuestos, proyectos de restauración o cuidado de motor.',
      time: 'Ahora',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    const newMsgList: Message[] = [
      ...messages,
      { role: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ];
    setMessages(newMsgList);
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          activeVehicle: activeVehicle
            ? {
                brand: activeVehicle.brand,
                model: activeVehicle.model,
                year: activeVehicle.year,
                mileage: activeVehicle.mileage,
                engine: activeVehicle.engine,
              }
            : null,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Hubo un error al procesar tu consulta con la IA. Por favor intenta de nuevo.',
            time: 'Ahora',
          },
        ]);
      }
    } catch (err) {
      console.warn('Backend unavailable, using client AI advisor engine:', err);
      const fallbackReply = getClientChatResponse(userMsg, activeVehicle);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-full sm:max-w-md max-h-[85dvh] sm:max-h-[550px] h-[550px] bg-slate-950/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
      
      {/* Header */}
      <div className="shrink-0 p-3.5 sm:p-4 bg-white/[0.06] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center backdrop-blur-md shrink-0">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white">Mecánico Virtual IA</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-[10px] text-slate-300 truncate">
              {activeVehicle ? `Asesorando: ${activeVehicle.brand} ${activeVehicle.model}` : 'Especialista Multimarca'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer shrink-0 ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600 text-white font-bold' : 'bg-white/10 text-white border border-white/15'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-blue-400" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-lg shadow-blue-600/20'
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none space-y-1.5 backdrop-blur-md'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className={`text-[9px] ${msg.role === 'user' ? 'text-white/80' : 'text-slate-400'} text-right`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-300 text-xs pl-9">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            <span>Consultando manuales de taller y especificaciones...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-black/30 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
        {[
          '¿Qué aceite exacto usa mi motor?',
          'Ruido al girar volante',
          '¿Cómo tramitar placa de antiguo?',
          'Cotizar bujías de iridio',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInputText(prompt)}
            className="px-3 py-1 rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/15 whitespace-nowrap border border-white/10 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-black/40 border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          placeholder="Escribe tu consulta mecánica o de repuestos..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 backdrop-blur-md focus:outline-none focus:border-blue-400/40"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
