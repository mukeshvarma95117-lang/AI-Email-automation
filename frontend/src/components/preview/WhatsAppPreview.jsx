import React from 'react';
import { Phone, Video, MoreVertical, CheckCheck, Smile, Paperclip, Mic, Send } from 'lucide-react';

export default function WhatsAppPreview({ contactName = 'Student Contact', contactPhone = '+1 555-0192', text = '', cta = '' }) {
  // Format basic whatsapp bold (*bold* -> <strong>) and italic (_italic_ -> <em>)
  const formatWhatsAppText = (raw) => {
    if (!raw) return 'No message content...';
    let formatted = raw
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
    return formatted;
  };

  return (
    <div className="w-full max-w-sm mx-auto rounded-[36px] p-3 bg-slate-900 shadow-2xl border-4 border-slate-700/80 select-none overflow-hidden">
      {/* Smartphone camera cutout */}
      <div className="flex justify-center mb-1">
        <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
        </div>
      </div>

      {/* Screen container */}
      <div className="rounded-[28px] overflow-hidden bg-[#0b141a] flex flex-col h-[520px] shadow-inner relative border border-slate-800">
        {/* WhatsApp Top App Bar */}
        <div className="bg-[#1f2c34] px-3.5 py-2.5 flex items-center justify-between text-white border-b border-[#2a3942] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white shadow">
              {contactName.charAt(0).toUpperCase()}
            </div>
            <div className="leading-tight">
              <h4 className="text-xs font-semibold text-slate-100 truncate max-w-[120px]">
                {contactName}
              </h4>
              <p className="text-[10px] text-emerald-400">online</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <Video className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
            <Phone className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
            <MoreVertical className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* WhatsApp Chat Area with realistic wallpaper */}
        <div 
          className="flex-1 p-3 overflow-y-auto flex flex-col justify-end space-y-2 relative"
          style={{
            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
            backgroundColor: '#0b141a'
          }}
        >
          {/* Date pill */}
          <div className="flex justify-center my-1">
            <span className="text-[10px] bg-[#182229] text-slate-400 px-2.5 py-0.5 rounded-full shadow-sm">
              Today
            </span>
          </div>

          {/* Outgoing chat bubble */}
          <div className="self-end max-w-[88%] bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-xs p-3 shadow-md relative text-xs leading-relaxed">
            <div 
              className="break-words space-y-1"
              dangerouslySetInnerHTML={{ __html: formatWhatsAppText(text) }}
            />

            {/* Simulated CTA Quick Reply Button */}
            {cta && (
              <div className="mt-2.5 pt-2 border-t border-emerald-700/60">
                <button 
                  type="button"
                  className="w-full py-1.5 px-3 bg-emerald-700/50 hover:bg-emerald-700 rounded-lg text-center text-[11px] font-semibold text-emerald-100 flex items-center justify-center gap-1 transition-colors"
                >
                  <span>{cta}</span>
                </button>
              </div>
            )}

            {/* Timestamp & read ticks */}
            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-emerald-200/80">
              <span>10:02 AM</span>
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* WhatsApp Message Input Bar */}
        <div className="bg-[#1f2c34] p-2 flex items-center gap-2 border-t border-[#2a3942] shrink-0">
          <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 flex items-center gap-2 text-slate-400">
            <Smile className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Message</span>
            <Paperclip className="w-3.5 h-3.5 ml-auto text-slate-400" />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow">
            <Mic className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

