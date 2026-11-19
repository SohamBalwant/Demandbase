import { Category, ItemCondition, HandoffMethod, PaymentMethod } from "@/types";

export const CATEGORIES: { id: Category; label: string; icon: string; description: string }[] = [
  { id: "tools", label: "Tools & DIY", icon: "Wrench", description: "Drills, hammers, wrenches, ladders" },
  { id: "electronics", label: "Electronics", icon: "Cpu", description: "Projectors, chargers, cameras, adapters" },
  { id: "kitchen", label: "Kitchen & Home", icon: "Utensils", description: "Blenders, air fryers, waffle makers" },
  { id: "sports", label: "Sports & Fitness", icon: "Dumbbell", description: "Badminton sets, footballs, cycles, yoga mats" },
  { id: "books", label: "Books & Study", icon: "BookOpen", description: "Textbooks, novels, exam prep guides" },
  { id: "party_supplies", label: "Party & Events", icon: "Sparkles", description: "Lights, sound systems, board games" },
  { id: "musical_instruments", label: "Music & Audio", icon: "Music", description: "Guitars, keyboards, mics, pedals" },
  { id: "furniture", label: "Furniture", icon: "Armchair", description: "Foldable tables, chairs, beanbags" },
  { id: "clothing", label: "Costumes & Wear", icon: "Shirt", description: "Formal blazers, convocation suits, ethnic wear" },
  { id: "vehicles", label: "Rides & Mobility", icon: "Bike", description: "Bicycles, skateboards, helmets" },
  { id: "other", label: "Other Essentials", icon: "Package", description: "Luggage, camping gear, umbrellas" },
];

export const CONDITIONS: { id: ItemCondition; label: string; badgeClass: string }[] = [
  { id: "new", label: "Brand New", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "like_new", label: "Like New", badgeClass: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "good", label: "Good Condition", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "fair", label: "Fair / Functional", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "poor", label: "Heavily Used", badgeClass: "bg-orange-50 text-orange-700 border-orange-200" },
];

export const HANDOFF_METHODS: { id: HandoffMethod; label: string; description: string }[] = [
  { id: "meet_middle", label: "Meet in the Middle", description: "Agree on a safe campus or community landmark via chat" },
  { id: "specific_location", label: "Lender's Location / Address", description: "Borrower picks up directly from your doorstep or room" },
  { id: "delivery", label: "Third-Party Delivery (Porter/Dunzo)", description: "Arrange local courier or campus delivery" },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "upi", label: "UPI (Google Pay / PhonePe / Paytm)" },
  { id: "cash", label: "Cash on Handoff" },
];
