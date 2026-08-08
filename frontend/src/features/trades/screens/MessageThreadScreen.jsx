import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';
import Header from '@/shared/components/layout/Header';
import MessageThread from '@/features/trades/components/trade/MessageThread';
import { useAuth } from '@/features/auth/AuthContext';
import {
  fetchMessages,
  fetchOffersForTrade,
  fetchTradeById,
  fetchUserRatings,
  sendMessage,
} from '@/shared/services/api';

export default function MessageThreadScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [trade, setTrade] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [myRating, setMyRating] = useState(null);
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
        const tradeData = await fetchTradeById(id);
        setTrade(tradeData);

        let otherUser = {
          id: tradeData.posterId,
          name: tradeData.posterName,
        };

        // If the current user owns the trade, the other participant is the
        // accepted offerer rather than the trade poster (which would be self).
        if (user?.id === tradeData.posterId) {
          try {
            const offers = await fetchOffersForTrade(id);
            const acceptedOffer = offers.find((offer) => offer.status === 'accepted');
            if (acceptedOffer) {
              otherUser = {
                id: acceptedOffer.offererId,
                name: acceptedOffer.offererName,
              };
            }
          } catch (err) {
            console.error('Could not resolve trade partner:', err);
          }
        }

        setPartner(otherUser);

        // Reuse the existing user-ratings endpoint to determine whether this
        // current user has already rated the other party for this trade.
        if (tradeData.status === 'completed' && otherUser.id && user?.id) {
          try {
            const ratingData = await fetchUserRatings(otherUser.id);
            const existingRating = ratingData.ratings?.find(
              (rating) => rating.tradeId === tradeData.id && rating.raterId === user.id
            );
            setMyRating(existingRating || null);
          } catch (err) {
            console.error('Could not load rating status:', err);
            setMyRating(null);
          }
        } else {
          setMyRating(null);
        }

        if (!tradeData.conversationId) {
          setMessages([]);
          return;
        }

        await loadMessages(tradeData.conversationId);

        interval = setInterval(() => {
          loadMessages(tradeData.conversationId).catch(console.error);
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
  }, [id, user?.id]);

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
          title={partner?.name || trade?.posterName || 'Conversation'}
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
      <Header
        onBack={() => navigate(-1)}
        title={partner?.name || trade?.posterName || 'Conversation'}
        showBell={false}
      />

      {trade.status === 'completed' && (
        <div className="px-4 py-3 border-b border-gray-100 bg-white">
          {myRating ? (
            <div className="w-full flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">You rated this user</p>
                <p className="text-xs text-gray-500 truncate">
                  {partner?.name || 'Trade partner'} • {myRating.score}/5 stars
                </p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                navigate(`/rate/${trade.id}`, {
                  state: {
                    partnerName: partner?.name,
                    returnTo: `/trades/${trade.id}/messages`,
                  },
                })
              }
              className="w-full flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-left active:scale-[0.99] transition-transform"
            >
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                <Star size={18} className="text-brand-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-700">Rate this user</p>
                <p className="text-xs text-gray-500 truncate">
                  Share your experience with {partner?.name || 'your trade partner'}
                </p>
              </div>
              <ChevronRight size={18} className="text-brand-500 shrink-0" />
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <MessageThread messages={messages} onSend={handleSend} />
      </div>
    </div>
  );
}
