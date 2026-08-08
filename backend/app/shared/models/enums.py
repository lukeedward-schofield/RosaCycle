import enum


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class TradeStatus(str, enum.Enum):
    OPEN = "open"
    RESERVED = "reserved"
    COMPLETED = "completed"
    DELETED = "deleted"


class OfferStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"


class ResourceSpotStatus(str, enum.Enum):
    ACTIVE = "active"
    COLLECTED = "collected"


class TradingForType(str, enum.Enum):
    SPECIFIC = "specific"
    NOTHING = "nothing"
    NEGOTIATING = "negotiating"


class NotificationType(str, enum.Enum):
    OFFER_RECEIVED = "offer_received"
    OFFER_ACCEPTED = "offer_accepted"
    OFFER_DECLINED = "offer_declined"
    TRADE_DELETED = "trade_deleted"
