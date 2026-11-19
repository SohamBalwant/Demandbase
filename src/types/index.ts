export type Category =
  | "electronics"
  | "tools"
  | "sports"
  | "kitchen"
  | "books"
  | "furniture"
  | "clothing"
  | "vehicles"
  | "party_supplies"
  | "musical_instruments"
  | "other";

export type ItemCondition = "new" | "like_new" | "good" | "fair" | "poor";

export type ListingStatus = "available" | "reserved" | "lent" | "returned" | "closed";

export type PaymentMethod = "upi" | "cash";

export type HandoffMethod = "meet_middle" | "delivery" | "specific_location";

export type RequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "active"
  | "completed"
  | "cancelled";

export type DepositStatus = "not_required" | "pending" | "held" | "returned" | "claimed";

export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  geohash?: string;
}

export interface UserStats {
  itemsListed: number;
  itemsLent: number;
  itemsBorrowed: number;
  totalTransactions: number;
  totalRatingSum: number;
  totalReviews: number;
  avgRating: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location: UserLocation;
  stats: UserStats;
  groups: string[];
  role: "user" | "admin";
  createdAt: string;
}

export interface Listing {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRating: number;
  title: string;
  description: string;
  category: Category;
  condition: ItemCondition;
  images: string[];
  price: number; // 0 = free, else ₹/day
  securityDeposit: number;
  location: UserLocation;
  availability: {
    from: string;
    to: string;
  };
  turnaroundBufferHours?: number; // Lister turnaround / inspection buffer in hours (0, 1, 2, 4, 24)
  paymentMethod: PaymentMethod;
  handoffMethod: HandoffMethod;
  handoffDetails?: string;
  groupId?: string | null;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  distanceKm?: number;
}

export interface ListingAvailability {
  isCurrentlyLent: boolean;
  activeBorrowerName?: string;
  currentReturnDate?: string;
  bufferHours: number;
  nextAvailableDate?: string;
  activeRequest?: BorrowRequest;
  bookedSlots: Array<{
    id: string;
    from: string;
    to: string;
    availableAfter: string;
    borrowerName: string;
    status: RequestStatus;
  }>;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictReason?: string;
  conflictingSlot?: {
    id: string;
    borrowerName: string;
    from: string;
    returnDate: string;
    availableAfter: string;
    bufferHours: number;
  };
  suggestedFromDate?: string;
}

export interface BorrowRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  borrowerId: string;
  borrowerName: string;
  lenderId: string;
  lenderName: string;
  message: string;
  borrowDates: {
    from: string;
    to: string;
  };
  status: RequestStatus;
  securityDeposit: {
    amount: number;
    status: DepositStatus;
  };
  conditionBefore?: {
    images: string[];
    notes: string;
    documentedAt?: string;
  };
  conditionAfter?: {
    images: string[];
    notes: string;
    documentedAt?: string;
  };
  returnDate: string;
  chatId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  role: "lender" | "borrower";
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type: "text" | "image" | "system";
  imageUrl?: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  requestId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
}

export interface CalendarDemand {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: Category;
  neededFrom: string;
  neededUntil: string;
  budgetPreference: "free_only" | "up_to_amount" | "any";
  maxBudget?: number | null;
  status: "open" | "fulfilled" | "expired";
  fulfilledBy?: string | null;
  createdAt: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  type: "building" | "hostel" | "community" | "custom";
  adminId: string;
  adminName: string;
  members: string[];
  memberCount: number;
  joinCode: string;
  location: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type:
  | "request_received"
  | "request_accepted"
  | "request_declined"
  | "return_reminder"
  | "review_received"
  | "demand_match"
  | "message";
  title: string;
  message: string;
  read: boolean;
  linkTo: string;
  createdAt: string;
}
