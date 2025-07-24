import React, { useState } from "react";
import { Search, Bell, User, Send, Paperclip } from "lucide-react"; // Icons for NavbarDashboard and chat
import IntervieweeSidebar from "../../components/IntervieweeSidebar"; // Adjust path if needed
import NavbarDashboard from "../../components/NavbarDashboard"; // Adjust path if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // For message containers
import { Button } from "@/components/ui/button"; // For send button, etc.
import { Input } from "@/components/ui/input"; // For message input
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For user avatars

// Mock data for conversations list
const conversationsData = [
  {
    id: "conv1",
    name: "John Doe",
    lastMessage: "Hey, are you free for a quick call?",
    time: "10:30 AM",
    unreadCount: 2,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    avatarFallback: "JD",
  },
  {
    id: "conv2",
    name: "Jane Smith",
    lastMessage: "Thanks for the update!",
    time: "Yesterday",
    unreadCount: 0,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    avatarFallback: "JS",
  },
  {
    id: "conv3",
    name: "Recruiter Team",
    lastMessage: "Your interview is confirmed.",
    time: "Mon",
    unreadCount: 1,
    avatar: "https://placehold.co/40x40/FF7F50/FFFFFF?text=RT",
    avatarFallback: "RT",
  },
  {
    id: "conv4",
    name: "Alice Brown",
    lastMessage: "See you then!",
    time: "Last Week",
    unreadCount: 0,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    avatarFallback: "AB",
  },
];

// Mock data for messages within a selected conversation
const messagesData = {
  conv1: [
    { id: "msg1", sender: "John Doe", text: "Hi Dorothy, how are you?", time: "10:25 AM", isMe: false },
    { id: "msg2", sender: "Me", text: "I'm good, thanks! How can I help?", time: "10:26 AM", isMe: true },
    { id: "msg3", sender: "John Doe", text: "Hey, are you free for a quick call?", time: "10:30 AM", isMe: false },
  ],
  conv2: [
    { id: "msg4", sender: "Me", text: "Just sent over the documents.", time: "Yesterday", isMe: true },
    { id: "msg5", sender: "Jane Smith", text: "Thanks for the update!", time: "Yesterday", isMe: false },
  ],
  conv3: [
    { id: "msg6", sender: "Recruiter Team", text: "Your interview for the Senior React Developer role is confirmed for next Tuesday at 2 PM.", time: "Mon", isMe: false },
    { id: "msg7", sender: "Me", text: "Great, thank you!", time: "Mon", isMe: true },
  ],
};

const MyMessages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState("conv1"); // State to manage selected conversation

  const selectedConversation = conversationsData.find(
    (conv) => conv.id === selectedConversationId
  );
  const currentMessages = messagesData[selectedConversationId] || [];

  return (
    <div className="flex min-h-screen font-sans bg-gray-50 dark:bg-gray-900">
      <div className="w-64 fixed top-0 left-0 h-full z-50">
        <IntervieweeSidebar />
      </div>

      <div className="flex-1 ml-64 flex flex-col bg-gray-50 dark:bg-gray-900">
        <NavbarDashboard />

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Messages
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Communicate with recruiters and other users.
              </p>
            </div>
            {/* Action buttons could go here if needed, but not in current design */}
          </div>

          {/* Main Messaging Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]"> {/* Adjusted height for full view */}
            {/* Left Column: Conversations List */}
            <Card className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-100 dark:border-gray-700 flex flex-col">
              <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                {conversationsData.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors duration-200
                      ${selectedConversationId === conv.id ? "bg-blue-50 dark:bg-blue-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
                    `}
                    onClick={() => setSelectedConversationId(conv.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conv.avatar} alt={conv.name} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        {conv.avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900 dark:text-white">{conv.name}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{conv.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Right Column: Chat Window */}
            <Card className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-100 dark:border-gray-700 flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-row items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        {selectedConversation.avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">{selectedConversation.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Online</p> {/* Placeholder for online status */}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                    {currentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                            msg.isMe
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-200 text-gray-900 rounded-bl-none dark:bg-gray-700 dark:text-white"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <span className={`block text-right mt-1 ${msg.isMe ? "text-blue-100" : "text-gray-600 dark:text-gray-400"} text-xs`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <Button variant="default" size="icon" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Select a conversation to start chatting.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyMessages;
