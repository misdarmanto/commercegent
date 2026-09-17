export type IChatMessageRole = "user" | "assistant" | "system";

export interface IChatMessage {
  chatMessageId: number;
  chatMessageSessionId: number;
  chatMessageRole: IChatMessageRole;
  chatMessageContent: string;
  createdAt: string;
}

export interface IChatSession {
  chatSessionId: number;
  chatSessionUserId: number;
  chatSessionTitle: string | null;
  createdAt: string;
}

export interface IChatProductRef {
  productId: number;
  productName: string;
  productImage: string | null;
  productPrice: number;
  productStock: number;
  productCategoryId?: string;
  productCategoryName?: string;
}

export interface IChatFaqRef {
  faqId: number;
  faqQuestion: string;
  faqAnswer: string;
}

export interface ISendChatMessagePayload {
  chatSessionId?: number;
  message: string;
}

export interface ISendChatMessageResponse {
  chatSessionId: number;
  reply: string;
  products: IChatProductRef[];
  faqs: IChatFaqRef[];
}

/** Local-only chat bubble used to render the conversation before/without a server round trip. */
export interface IChatBubble {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: IChatProductRef[];
  pending?: boolean;
}
