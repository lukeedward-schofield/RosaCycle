import { useState } from 'react';
import { Send } from 'lucide-react';

/**
 * Simple message thread — UI shell only.
 * Real-time send/receive logic belongs to Integration Lead ("Future chat integration").
 * This component just needs `messages` (array of { id, text, fromMe }) and an onSend callback.
 */
export default function MessageThread({ messages = [], onSend }) {
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    if (!draft.trim()) return;
    onSend?.(draft.trim());
    setDraft('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                m.fromMe ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10">Say hello to start the conversation.</p>
        )}
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white sticky bottom-0">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          aria-label="Send"
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}
