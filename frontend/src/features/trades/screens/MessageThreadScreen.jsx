import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/shared/components/layout/Header';
import MessageThread from '@/features/trades/components/trade/MessageThread';
import { fetchTradeById, fetchMessages, sendMessage } from '@/shared/services/api';

export default function MessageThreadScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [trade, setTrade] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  const loadMessages = async (conversationId) => {
    const backendMessages = await fetchMessages(conversationId);

    setMessages(
      backendMessages.map((message) => ({
        id: message.id,
        text: message.content,
        fromMe: message.fromMe,
      }))
    );
  };

  const handleSend = async (text) => {
    if (!trade?.conversationId) return;

    try {
      await sendMessage(trade.conversationId, text);
      await loadMessages(trade.conversationId);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let interval;

    async function loadConversation() {
      try {
        const trade = await fetchTradeById(id);
        setTrade(trade);

        if (!trade.conversationId) {
          setMessages([]);
          return;
        }

      await loadMessages(trade.conversationId);

        interval = setInterval(() => {
          loadMessages(trade.conversationId).catch(console.error);
        }, 3000);
        
      } catch (err) {
        console.error(err);
        setTrade(null);
      } finally {
        setLoading(false);
      }
    }

    loadConversation();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
    
  }, [id]);


  if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      Loading...
    </div>
    );
  }

  if (!trade?.conversationId) {
    return (
      <div className="flex flex-col h-screen">
        <Header
          onBack={() => navigate(-1)}
          title={trade?.posterName || 'Conversation'}
          showBell={false}
        />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">
            No conversation has been created yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header onBack={() => navigate(-1)} title={trade?.posterName || 'Conversation'} showBell={false} />
      <div className="flex-1 overflow-hidden">
        
        <MessageThread messages={messages} onSend={handleSend} />
      </div>
    </div>
  );
}

