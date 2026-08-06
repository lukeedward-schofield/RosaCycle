import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/shared/components/layout/Header';
import MessageThread from '@/features/trades/components/trade/MessageThread';
import { fetchTradeById, fetchMessages, sendMessage } from '@/shared/services/api';

export default function MessageThreadScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trade, setTrade] = useState(null);

useEffect(() => {
  async function loadConversation() {
    try {
      const trade = await fetchTradeById(id);
      setTrade(trade);

      if (!trade.conversationId) {
        setMessages([]);
        return;
      }

      const data = await fetchMessages(trade.conversationId);

      setMessages(
        data.map((message) => ({
          id: message.id,
          text: message.content,
          fromMe: message.fromCurrentUser,
        }))
      );
    } catch (err) {
      console.error(err);
      setTrade(null);
    } finally {
      setLoading(false);
    }
  }

  loadConversation();
}, [id]);

const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(true);

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
