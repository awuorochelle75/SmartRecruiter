const API_URL = import.meta.env.VITE_API_URL

export const messagingService = {
  async getConversations() {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      credentials: "include",
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch conversations")
    }
    
    return response.json()
  },

  // Get messages for a specific conversation
  async getMessages(conversationId) {
    const response = await fetch(`${API_URL}/messages/${conversationId}`, {
      credentials: "include",
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch messages")
    }
    
    return response.json()
  },

  // Send a message
  async sendMessage(receiverId, content) {
    const response = await fetch(`${API_URL}/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        receiver_id: receiverId,
        content: content,
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to send message")
    }
    
    const data = await response.json()
    return {
      id: data.message_id,
      message: data.message
    }
  },

  

  async markMessageRead(messageId) {
    const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
      method: "POST",
      credentials: "include",
    })
    
    if (!response.ok) {
      throw new Error("Failed to mark message as read")
    }
    
    return response.json()
  },

  

  async deleteMessage(messageId) {
    const response = await fetch(`${API_URL}/messages/${messageId}`, {
      method: "DELETE",
      credentials: "include",
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete message")
    }
    
    return response.json()
  },

  

  async getAvailableCandidates() {
    const response = await fetch(`${API_URL}/messages/available-candidates`, {
      credentials: "include",
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch available candidates")
    }
    
    return response.json()
  },
} 


