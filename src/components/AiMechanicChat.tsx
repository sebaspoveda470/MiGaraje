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
        throw new Error('Fallback required');
      }
    } catch {
      const fallbackReply = getClientChatResponse(
        userMsg,
        activeVehicle
          ? {
              brand: activeVehicle.brand,
              model: activeVehicle.model,
              year: activeVehicle.year,
              mileage: activeVehicle.mileage,
              engine: activeVehicle.engine,
            }
          : null
      );

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
    <div className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-full sm:max-w-md max-h-[85dvh] sm:max-h-[550px] h-[550px] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
      
      {/* Header */}
      <div className="shrink-0 p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-950">Mecánico Virtual IA</h3>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">
              {activeVehicle ? `Asesorando: ${activeVehicle.brand} ${activeVehicle.model}` : 'Especialista Multimarca'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-800 p-1 rounded-lg cursor-pointer shrink-0 ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-slate-950 text-white font-bold' : 'bg-white text-slate-900 border border-slate-200 shadow-xs'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-slate-900" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-950 text-white font-medium rounded-tr-none shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-1.5 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className={`text-[9px] ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'} text-right`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs pl-9">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-900" />
            <span>Consultando manuales de taller y especificaciones...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
        {[
          '¿Qué aceite exacto usa mi motor?',
          'Ruido al girar volante',
          '¿Cómo tramitar placa de antiguo?',
          'Cotizar bujías de iridio',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInputText(prompt)}
            className="px-3 py-1 rounded-full bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 whitespace-nowrap border border-slate-200 transition-colors cursor-pointer shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          placeholder="Escribe tu consulta mecánica o repuesto..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white p-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
