export type ReturnStatus = 
  | 'pending' 
  | 'approved' 
  | 'denied' 
  | 'refunded' 
  | 'completed';

export type ReturnReason = 
  | 'defective' 
  | 'wrong_item' 
  | 'not_as_described' 
  | 'changed_mind' 
  | 'other';

export interface ReturnItem {
  orderItemId: string; // maps to CartItem.id in Order
  productId: string;
  title: string;
  quantity: number;
  reason: ReturnReason;
  photos?: string[]; // URLs to uploaded return photos
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId?: string;
  sessionId?: string;
  items: ReturnItem[];
  totalRefundAmount: number; // KES
  status: ReturnStatus;
  customerNote?: string;
  adminNote?: string;
  approvedBy?: string; // admin userId
  deniedBy?: string;
  refundedAt?: number;
  createdAt: number;
  updatedAt: number;
  events: Array<{ type: string; at: number; by?: string; note?: string }>;
}

export interface CreateReturnInput {
  orderId: string;
  items: Array<{
    orderItemId: string;
    productId: string;
    title: string;
    quantity: number;
    reason: ReturnReason;
    photos?: string[];
  }>;
  customerNote?: string;
}

export interface ReturnDecisionInput {
  decision: 'approve' | 'deny';
  adminNote?: string;
}
