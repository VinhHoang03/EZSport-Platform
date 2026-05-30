import api from '../api/api';

export interface Message {
  sender: string;
  senderRole: 'player' | 'owner';
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  _id: string;
  participants: {
    player: {
      _id: string;
      fullName: string;
      email: string;
      avatar?: string;
    };
    owner: {
      _id: string;
      fullName: string;
      email: string;
      avatar?: string;
    };
  };
  venue?: {
    _id: string;
    name: string;
  };
  messages: Message[];
  lastMessage?: {
    text: string;
    timestamp: Date;
    sender: string;
  };
  unreadCount: {
    player: number;
    owner: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationRequest {
  otherUserId: string;
  venueId?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
}

export const conversationService = {
  /**
   * Lấy danh sách tất cả conversations
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await api.get('/conversations');
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting conversations:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách hội thoại');
    }
  },

  /**
   * Lấy chi tiết một conversation
   */
  async getConversationById(id: string): Promise<Conversation> {
    try {
      const response = await api.get(`/conversations/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting conversation:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy chi tiết hội thoại');
    }
  },

  /**
   * Tạo hoặc lấy conversation với user khác
   */
  async createOrGetConversation(data: CreateConversationRequest): Promise<Conversation> {
    try {
      const response = await api.post('/conversations', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating/getting conversation:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo hội thoại');
    }
  },

  /**
   * Gửi tin nhắn
   */
  async sendMessage(data: SendMessageRequest): Promise<Conversation> {
    try {
      const response = await api.post('/conversations/message', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw new Error(error.response?.data?.message || 'Không thể gửi tin nhắn');
    }
  },

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  async markAsRead(conversationId: string): Promise<Conversation> {
    try {
      const response = await api.put(`/conversations/${conversationId}/read`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error marking as read:', error);
      throw new Error(error.response?.data?.message || 'Không thể đánh dấu đã đọc');
    }
  },

  /**
   * Xóa conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await api.delete(`/conversations/${conversationId}`);
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa hội thoại');
    }
  },
};
