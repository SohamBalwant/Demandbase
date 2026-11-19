"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Listing,
  BorrowRequest,
  ChatThread,
  ChatMessage,
  CalendarDemand,
  CommunityGroup,
  Review,
  AppNotification,
  ListingStatus,
  RequestStatus,
  DepositStatus,
  ListingAvailability,
  ConflictCheckResult,
} from "@/types";
import { formatDateTime } from "@/lib/utils";
import {
  DEMO_LISTINGS,
  DEMO_CALENDAR_DEMANDS,
  DEMO_GROUPS,
  DEMO_REVIEWS,
} from "@/lib/demo-data";
import { useAuth } from "./AuthContext";

interface DataContextType {
  listings: Listing[];
  addListing: (newListing: Omit<Listing, "id" | "createdAt" | "updatedAt" | "userRating">) => Listing;
  updateListingStatus: (id: string, status: ListingStatus) => void;
  deleteListing: (id: string) => void;
  getListingById: (id: string) => Listing | undefined;
  getListingAvailability: (listingId: string) => ListingAvailability;
  checkAvailabilityConflict: (
    listingId: string,
    requestedFrom: string,
    requestedTo: string
  ) => ConflictCheckResult;

  requests: BorrowRequest[];
  createRequest: (data: {
    listingId: string;
    borrowDates: { from: string; to: string };
    message: string;
  }) => BorrowRequest | null;
  updateRequestStatus: (
    requestId: string,
    status: RequestStatus,
    depositStatus?: DepositStatus
  ) => void;
  documentCondition: (
    requestId: string,
    phase: "before" | "after",
    images: string[],
    notes: string
  ) => void;

  chats: ChatThread[];
  messages: Record<string, ChatMessage[]>;
  sendMessage: (chatId: string, text: string, imageUrl?: string) => void;
  getChatById: (chatId: string) => ChatThread | undefined;

  calendarDemands: CalendarDemand[];
  addCalendarDemand: (demand: Omit<CalendarDemand, "id" | "createdAt" | "status">) => CalendarDemand;
  fulfillDemand: (demand: CalendarDemand) => string | null;

  groups: CommunityGroup[];
  createGroup: (group: Omit<CommunityGroup, "id" | "createdAt" | "members" | "memberCount" | "joinCode">) => CommunityGroup;
  joinGroup: (joinCode: string) => { success: boolean; message: string; group?: CommunityGroup };

  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
  getReviewsForUser: (userId: string) => Review[];

  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  unreadNotificationsCount: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_LISTINGS = "demandbase_listings";
const STORAGE_REQUESTS = "demandbase_requests";
const STORAGE_CHATS = "demandbase_chats";
const STORAGE_MESSAGES = "demandbase_messages";
const STORAGE_DEMANDS = "demandbase_demands";
const STORAGE_GROUPS = "demandbase_groups";
const STORAGE_REVIEWS = "demandbase_reviews";
const STORAGE_NOTIFICATIONS = "demandbase_notifications";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>(DEMO_LISTINGS);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [calendarDemands, setCalendarDemands] = useState<CalendarDemand[]>(DEMO_CALENDAR_DEMANDS);
  const [groups, setGroups] = useState<CommunityGroup[]>(DEMO_GROUPS);
  const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Initialize from LocalStorage or seed with DEMO data
  useEffect(() => {
    try {
      const storedListings = localStorage.getItem(STORAGE_LISTINGS);
      if (storedListings) {
        const parsed = JSON.parse(storedListings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setListings(parsed);
        } else {
          setListings(DEMO_LISTINGS);
          localStorage.setItem(STORAGE_LISTINGS, JSON.stringify(DEMO_LISTINGS));
        }
      } else {
        localStorage.setItem(STORAGE_LISTINGS, JSON.stringify(DEMO_LISTINGS));
      }

      const storedDemands = localStorage.getItem(STORAGE_DEMANDS);
      if (storedDemands) {
        const parsed = JSON.parse(storedDemands);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCalendarDemands(parsed);
        } else {
          setCalendarDemands(DEMO_CALENDAR_DEMANDS);
          localStorage.setItem(STORAGE_DEMANDS, JSON.stringify(DEMO_CALENDAR_DEMANDS));
        }
      } else {
        localStorage.setItem(STORAGE_DEMANDS, JSON.stringify(DEMO_CALENDAR_DEMANDS));
      }

      const storedGroups = localStorage.getItem(STORAGE_GROUPS);
      setGroups(storedGroups ? JSON.parse(storedGroups) : DEMO_GROUPS);
      if (!storedGroups) localStorage.setItem(STORAGE_GROUPS, JSON.stringify(DEMO_GROUPS));

      const storedReviews = localStorage.getItem(STORAGE_REVIEWS);
      setReviews(storedReviews ? JSON.parse(storedReviews) : DEMO_REVIEWS);
      if (!storedReviews) localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(DEMO_REVIEWS));

      const storedRequests = localStorage.getItem(STORAGE_REQUESTS);
      const initialRequests: BorrowRequest[] = [
        {
          id: "req-1",
          listingId: "item-1",
          listingTitle: "Bosch GSB 550W Impact Drill Kit with Bits",
          borrowerId: "user-2",
          borrowerName: "Priya Sharma",
          lenderId: "user-1",
          lenderName: "Soham Balwant",
          message: "Hi Soham! Need your drill for Saturday to hang some design boards in my dorm room.",
          borrowDates: {
            from: "2026-11-20T09:00:00Z",
            to: "2026-11-22T18:00:00Z",
          },
          status: "active",
          securityDeposit: {
            amount: 400,
            status: "held",
          },
          conditionBefore: {
            images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80"],
            notes: "Drill body clean, all 6 bits present, power cord in excellent condition.",
            documentedAt: "2026-11-20T09:15:00Z",
          },
          returnDate: "2026-11-22T18:00:00Z",
          chatId: "chat-1",
          createdAt: "2026-11-19T10:00:00Z",
        },
      ];
      if (storedRequests) {
        const parsed = JSON.parse(storedRequests);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRequests(parsed);
        } else {
          setRequests(initialRequests);
          localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(initialRequests));
        }
      } else {
        setRequests(initialRequests);
        localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(initialRequests));
      }

      const storedChats = localStorage.getItem(STORAGE_CHATS);
      const initialChats: ChatThread[] = storedChats
        ? JSON.parse(storedChats)
        : [
          {
            id: "chat-1",
            participants: ["user-1", "user-2"],
            participantNames: {
              "user-1": "Soham Balwant",
              "user-2": "Priya Sharma",
            },
            listingId: "item-1",
            listingTitle: "Bosch GSB 550W Impact Drill Kit with Bits",
            listingImage: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80",
            requestId: "req-1",
            lastMessage: "Sounds great, see you at SAC entrance at 10 AM!",
            lastMessageAt: "2026-11-20T09:30:00Z",
          },
        ];
      setChats(initialChats);
      if (!storedChats) localStorage.setItem(STORAGE_CHATS, JSON.stringify(initialChats));

      const storedMessages = localStorage.getItem(STORAGE_MESSAGES);
      const initialMessages: Record<string, ChatMessage[]> = storedMessages
        ? JSON.parse(storedMessages)
        : {
          "chat-1": [
            {
              id: "m-1",
              senderId: "system",
              senderName: "System",
              text: "Borrow request accepted! You can now coordinate handoff details.",
              type: "system",
              createdAt: "2026-11-20T09:05:00Z",
            },
            {
              id: "m-2",
              senderId: "user-2",
              senderName: "Priya Sharma",
              text: "Hey Soham, thanks for accepting! Can we meet near the SAC entrance?",
              type: "text",
              createdAt: "2026-11-20T09:10:00Z",
            },
            {
              id: "m-3",
              senderId: "user-1",
              senderName: "Soham Balwant",
              text: "Sounds great, see you at SAC entrance at 10 AM!",
              type: "text",
              createdAt: "2026-11-20T09:30:00Z",
            },
          ],
        };
      setMessages(initialMessages);
      if (!storedMessages) localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(initialMessages));

      const storedNotifs = localStorage.getItem(STORAGE_NOTIFICATIONS);
      const initialNotifs: AppNotification[] = storedNotifs
        ? JSON.parse(storedNotifs)
        : [
          {
            id: "notif-1",
            userId: "user-1",
            type: "return_reminder",
            title: "Return Reminder: Bosch Drill",
            message: "Priya is scheduled to return the Bosch Impact Drill tomorrow by 6:00 PM.",
            read: false,
            linkTo: "/dashboard",
            createdAt: "2026-11-21T09:00:00Z",
          },
          {
            id: "notif-2",
            userId: "user-1",
            type: "demand_match",
            title: "AI Demand Match Found!",
            message: "Rahul Verma posted a need for Camping Gear matching your community group.",
            read: false,
            linkTo: "/calendar",
            createdAt: "2026-11-19T14:00:00Z",
          },
        ];
      setNotifications(initialNotifs);
      if (!storedNotifs) localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(initialNotifs));
    } catch (e) {
      console.error("Error loading mock storage data:", e);
    }
  }, []);

  // Real-time cross-tab synchronization listener (Edge / Chrome multi-tab testing)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === STORAGE_DEMANDS) setCalendarDemands(JSON.parse(e.newValue));
        if (e.key === STORAGE_LISTINGS) setListings(JSON.parse(e.newValue));
        if (e.key === STORAGE_CHATS) setChats(JSON.parse(e.newValue));
        if (e.key === STORAGE_MESSAGES) setMessages(JSON.parse(e.newValue));
        if (e.key === STORAGE_REQUESTS) setRequests(JSON.parse(e.newValue));
        if (e.key === STORAGE_GROUPS) setGroups(JSON.parse(e.newValue));
        if (e.key === STORAGE_REVIEWS) setReviews(JSON.parse(e.newValue));
        if (e.key === STORAGE_NOTIFICATIONS) setNotifications(JSON.parse(e.newValue));
      } catch (err) {
        console.error("Cross-tab sync error:", err);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addListing = (
    newListing: Omit<Listing, "id" | "createdAt" | "updatedAt" | "userRating">
  ): Listing => {
    const item: Listing = {
      ...newListing,
      id: `item-${Date.now()}`,
      userRating: user?.stats.avgRating || 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      distanceKm: 0.2,
    };
    const updated = [item, ...listings];
    setListings(updated);
    localStorage.setItem(STORAGE_LISTINGS, JSON.stringify(updated));
    return item;
  };

  const updateListingStatus = (id: string, status: ListingStatus) => {
    const updated = listings.map((l) =>
      l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l
    );
    setListings(updated);
    localStorage.setItem(STORAGE_LISTINGS, JSON.stringify(updated));
  };

  const deleteListing = (id: string) => {
    const updated = listings.filter((l) => l.id !== id);
    setListings(updated);
    localStorage.setItem(STORAGE_LISTINGS, JSON.stringify(updated));
  };

  const getListingById = (id: string) => listings.find((l) => l.id === id);

  const getListingAvailability = (listingId: string): ListingAvailability => {
    const listing = listings.find((l) => l.id === listingId);
    const bufferHours = listing?.turnaroundBufferHours !== undefined ? listing.turnaroundBufferHours : 2;

    const relevantRequests = requests.filter(
      (r) => r.listingId === listingId && (r.status === "active" || r.status === "accepted")
    );

    const bookedSlots = relevantRequests.map((r) => {
      const returnTime = new Date(r.returnDate || r.borrowDates.to).getTime();
      const availableAfterTime = returnTime + bufferHours * 60 * 60 * 1000;
      return {
        id: r.id,
        from: r.borrowDates.from,
        to: r.returnDate || r.borrowDates.to,
        availableAfter: new Date(availableAfterTime).toISOString(),
        borrowerName: r.borrowerName,
        status: r.status,
      };
    });

    const activeReq = relevantRequests.find((r) => r.status === "active");

    if (activeReq) {
      const returnTime = new Date(activeReq.returnDate || activeReq.borrowDates.to).getTime();
      const nextAvailableTime = returnTime + bufferHours * 60 * 60 * 1000;

      return {
        isCurrentlyLent: true,
        activeBorrowerName: activeReq.borrowerName,
        currentReturnDate: activeReq.returnDate || activeReq.borrowDates.to,
        bufferHours,
        nextAvailableDate: new Date(nextAvailableTime).toISOString(),
        activeRequest: activeReq,
        bookedSlots,
      };
    }

    return {
      isCurrentlyLent: false,
      bufferHours,
      bookedSlots,
    };
  };

  const checkAvailabilityConflict = (
    listingId: string,
    requestedFrom: string,
    requestedTo: string
  ): ConflictCheckResult => {
    const listing = listings.find((l) => l.id === listingId);
    const bufferHours = listing?.turnaroundBufferHours !== undefined ? listing.turnaroundBufferHours : 2;
    const reqFromTime = new Date(requestedFrom).getTime();
    const reqToTime = new Date(requestedTo).getTime();

    if (isNaN(reqFromTime) || isNaN(reqToTime)) {
      return { hasConflict: false };
    }

    const relevantRequests = requests.filter(
      (r) => r.listingId === listingId && (r.status === "active" || r.status === "accepted")
    );

    for (const req of relevantRequests) {
      const slotStart = new Date(req.borrowDates.from).getTime();
      const slotReturn = new Date(req.returnDate || req.borrowDates.to).getTime();
      const slotAvailableAfter = slotReturn + bufferHours * 60 * 60 * 1000;

      // Overlap condition:
      // Requested interval [reqFromTime, reqToTime] overlaps with [slotStart, slotAvailableAfter]
      if (reqFromTime < slotAvailableAfter && reqToTime > slotStart) {
        return {
          hasConflict: true,
          conflictReason: `Item is currently with ${req.borrowerName} until ${formatDateTime(
            slotReturn
          )}${bufferHours > 0 ? ` (+ ${bufferHours}h inspection buffer)` : ""}.`,
          conflictingSlot: {
            id: req.id,
            borrowerName: req.borrowerName,
            from: req.borrowDates.from,
            returnDate: req.returnDate || req.borrowDates.to,
            availableAfter: new Date(slotAvailableAfter).toISOString(),
            bufferHours,
          },
          suggestedFromDate: new Date(slotAvailableAfter).toISOString(),
        };
      }
    }

    return { hasConflict: false };
  };

  const createRequest = ({
    listingId,
    borrowDates,
    message,
  }: {
    listingId: string;
    borrowDates: { from: string; to: string };
    message: string;
  }): BorrowRequest | null => {
    if (!user) return null;
    const targetListing = getListingById(listingId);
    if (!targetListing) return null;

    const reqId = `req-${Date.now()}`;
    const chatId = `chat-${Date.now()}`;

    const newRequest: BorrowRequest = {
      id: reqId,
      listingId,
      listingTitle: targetListing.title,
      borrowerId: user.uid,
      borrowerName: user.displayName,
      lenderId: targetListing.userId,
      lenderName: targetListing.userName,
      message,
      borrowDates,
      status: "pending",
      securityDeposit: {
        amount: targetListing.securityDeposit,
        status: targetListing.securityDeposit > 0 ? "pending" : "not_required",
      },
      returnDate: borrowDates.to,
      chatId,
      createdAt: new Date().toISOString(),
    };

    const newChat: ChatThread = {
      id: chatId,
      participants: [user.uid, targetListing.userId],
      participantNames: {
        [user.uid]: user.displayName,
        [targetListing.userId]: targetListing.userName,
      },
      listingId,
      listingTitle: targetListing.title,
      listingImage: targetListing.images[0] || "",
      requestId: reqId,
      lastMessage: message,
      lastMessageAt: new Date().toISOString(),
    };

    const initialChatMessages: ChatMessage[] = [
      {
        id: `m-${Date.now()}-sys`,
        senderId: "system",
        senderName: "System",
        text: `Borrow request submitted for ${targetListing.title}.`,
        type: "system",
        createdAt: new Date().toISOString(),
      },
      {
        id: `m-${Date.now()}`,
        senderId: user.uid,
        senderName: user.displayName,
        text: message,
        type: "text",
        createdAt: new Date().toISOString(),
      },
    ];

    const updatedRequests = [newRequest, ...requests];
    const updatedChats = [newChat, ...chats];
    const updatedMessages = { ...messages, [chatId]: initialChatMessages };

    setRequests(updatedRequests);
    setChats(updatedChats);
    setMessages(updatedMessages);

    localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(updatedRequests));
    localStorage.setItem(STORAGE_CHATS, JSON.stringify(updatedChats));
    localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updatedMessages));

    // Send notification to lender
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: targetListing.userId,
      type: "request_received",
      title: "New Borrow Request",
      message: `${user.displayName} requested to borrow "${targetListing.title}".`,
      read: false,
      linkTo: `/chat/${chatId}`,
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(updatedNotifs));

    return newRequest;
  };

  const updateRequestStatus = (
    requestId: string,
    status: RequestStatus,
    depositStatus?: DepositStatus
  ) => {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          securityDeposit: {
            ...r.securityDeposit,
            status: depositStatus || r.securityDeposit.status,
          },
        };
      }
      return r;
    });
    setRequests(updated);
    localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(updated));

    // Also update listing status if accepted/completed
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      if (status === "accepted" || status === "active") {
        updateListingStatus(req.listingId, "reserved");
      } else if (status === "completed") {
        updateListingStatus(req.listingId, "available");
      }
    }
  };

  const documentCondition = (
    requestId: string,
    phase: "before" | "after",
    images: string[],
    notes: string
  ) => {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        const docField = phase === "before" ? "conditionBefore" : "conditionAfter";
        return {
          ...r,
          [docField]: {
            images,
            notes,
            documentedAt: new Date().toISOString(),
          },
        };
      }
      return r;
    });
    setRequests(updated);
    localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(updated));
  };

  const sendMessage = (chatId: string, text: string, imageUrl?: string) => {
    if (!user) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.uid,
      senderName: user.displayName,
      text,
      type: imageUrl ? "image" : "text",
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    const currentChatMsgs = messages[chatId] || [];
    const updatedMsgs = { ...messages, [chatId]: [...currentChatMsgs, newMsg] };
    setMessages(updatedMsgs);
    localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updatedMsgs));

    const updatedChats = chats.map((c) =>
      c.id === chatId
        ? {
          ...c,
          lastMessage: text,
          lastMessageAt: new Date().toISOString(),
        }
        : c
    );
    setChats(updatedChats);
    localStorage.setItem(STORAGE_CHATS, JSON.stringify(updatedChats));
  };

  const getChatById = (chatId: string) => chats.find((c) => c.id === chatId);

  const addCalendarDemand = (
    demand: Omit<CalendarDemand, "id" | "createdAt" | "status">
  ): CalendarDemand => {
    const newDemand: CalendarDemand = {
      ...demand,
      id: `demand-${Date.now()}`,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    const updated = [newDemand, ...calendarDemands];
    setCalendarDemands(updated);
    localStorage.setItem(STORAGE_DEMANDS, JSON.stringify(updated));
    return newDemand;
  };

  const fulfillDemand = (demand: CalendarDemand): string | null => {
    if (!user) return null;

    const fulfillMsg = `Hey ${demand.userName}! I saw your request for "${demand.title}" on the Demand Calendar. I can fulfill this for you!`;

    // Check if an existing chat thread already exists between these two users for this demand
    const existingChat = chats.find(
      (c) =>
        c.participants.includes(user.uid) &&
        c.participants.includes(demand.userId) &&
        (c.listingId === demand.id || c.listingTitle.includes(demand.title))
    );

    let targetChatId = existingChat?.id;

    if (!existingChat) {
      targetChatId = `chat-demand-${Date.now()}`;
      const newChat: ChatThread = {
        id: targetChatId,
        participants: [user.uid, demand.userId],
        participantNames: {
          [user.uid]: user.displayName,
          [demand.userId]: demand.userName,
        },
        listingId: demand.id,
        listingTitle: `Need: ${demand.title}`,
        listingImage:
          "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=300&q=80",
        requestId: `req-demand-${demand.id}`,
        lastMessage: fulfillMsg,
        lastMessageAt: new Date().toISOString(),
      };

      const initialMsgs: ChatMessage[] = [
        {
          id: `m-sys-${Date.now()}`,
          senderId: "system",
          senderName: "System",
          text: `Demand match initiated! ${user.displayName} offered to fulfill "${demand.title}".`,
          type: "system",
          createdAt: new Date().toISOString(),
        },
        {
          id: `m-user-${Date.now()}`,
          senderId: user.uid,
          senderName: user.displayName,
          text: fulfillMsg,
          type: "text",
          createdAt: new Date().toISOString(),
        },
      ];

      const updatedChats = [newChat, ...chats];
      const updatedMessages = { ...messages, [targetChatId]: initialMsgs };

      setChats(updatedChats);
      setMessages(updatedMessages);

      localStorage.setItem(STORAGE_CHATS, JSON.stringify(updatedChats));
      localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updatedMessages));
    } else {
      sendMessage(existingChat.id, fulfillMsg);
    }

    // Mark demand as fulfilled
    const updatedDemands = calendarDemands.map((d) =>
      d.id === demand.id
        ? { ...d, status: "fulfilled" as const, fulfilledBy: user.uid }
        : d
    );
    setCalendarDemands(updatedDemands);
    localStorage.setItem(STORAGE_DEMANDS, JSON.stringify(updatedDemands));

    // Send notification to the demand poster
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: demand.userId,
      type: "demand_match",
      title: "Someone Can Fulfill Your Need!",
      message: `${user.displayName} offered to fulfill "${demand.title}"! Open chat to coordinate.`,
      read: false,
      linkTo: `/chat/${targetChatId}`,
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(updatedNotifs));

    return targetChatId || null;
  };

  const createGroup = (
    group: Omit<CommunityGroup, "id" | "createdAt" | "members" | "memberCount" | "joinCode">
  ): CommunityGroup => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let joinCode = "";
    for (let i = 0; i < 6; i++) {
      joinCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newGroup: CommunityGroup = {
      ...group,
      id: `group-${Date.now()}`,
      members: user ? [user.uid] : [],
      memberCount: 1,
      joinCode,
      createdAt: new Date().toISOString(),
    };

    const updated = [newGroup, ...groups];
    setGroups(updated);
    localStorage.setItem(STORAGE_GROUPS, JSON.stringify(updated));
    return newGroup;
  };

  const joinGroup = (
    joinCode: string
  ): { success: boolean; message: string; group?: CommunityGroup } => {
    if (!user) return { success: false, message: "Please log in first" };
    const code = joinCode.trim().toUpperCase();
    const found = groups.find((g) => g.joinCode.toUpperCase() === code);
    if (!found) {
      return { success: false, message: "Invalid group code. Please check with your community." };
    }
    if (found.members.includes(user.uid)) {
      return { success: true, message: "You are already a member of this group!", group: found };
    }
    const updatedGroup: CommunityGroup = {
      ...found,
      members: [...found.members, user.uid],
      memberCount: found.memberCount + 1,
    };
    const updated = groups.map((g) => (g.id === found.id ? updatedGroup : g));
    setGroups(updated);
    localStorage.setItem(STORAGE_GROUPS, JSON.stringify(updated));
    return { success: true, message: `Successfully joined ${found.name}!`, group: updatedGroup };
  };

  const addReview = (reviewData: Omit<Review, "id" | "createdAt">) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(updated));
  };

  const getReviewsForUser = (userId: string) => reviews.filter((r) => r.revieweeId === userId);

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(updated));
  };

  const unreadNotificationsCount = notifications.filter(
    (n) => user && n.userId === user.uid && !n.read
  ).length;

  return (
    <DataContext.Provider
      value={{
        listings,
        addListing,
        updateListingStatus,
        deleteListing,
        getListingById,
        getListingAvailability,
        checkAvailabilityConflict,
        requests,
        createRequest,
        updateRequestStatus,
        documentCondition,
        chats,
        messages,
        sendMessage,
        getChatById,
        calendarDemands,
        addCalendarDemand,
        fulfillDemand,
        groups,
        createGroup,
        joinGroup,
        reviews,
        addReview,
        getReviewsForUser,
        notifications,
        markNotificationAsRead,
        unreadNotificationsCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
