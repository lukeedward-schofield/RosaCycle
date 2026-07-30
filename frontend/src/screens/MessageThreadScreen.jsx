import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import MessageThread from '../components/trade/MessageThread';
import { fetchTradeById } from '../services/api';

export default function MessageThreadScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trade, setTrade] = useState(null);

  useEffect(() => {
    fetchTradeById(id).then(setTrade).catch(() => setTrade(null));
  }, [id]);

  // Placeholder local state — real-time sync is Integration Lead's job.
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi! Is this still available?', fromMe: false },
    { id: 2, text: 'Yes, still open for trade!', fromMe: true },
  ]);

  const handleSend = (text) => {
    setMessages((prev) => [...prev, { id: prev.length + 1, text, fromMe: true }]);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onBack={() => navigate(-1)} title={trade?.posterName || 'Conversation'} showBell={false} />
      <div className="flex-1 overflow-hidden">
        <MessageThread messages={messages} onSend={handleSend} />
      </div>
    </div>
  );
}
