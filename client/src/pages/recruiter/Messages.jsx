"use client"

import { useState, useEffect } from "react"
import { Send, Search, Paperclip, MoreVertical, Phone, Video, UserPlus, MessageSquare, Trash2, Download, X } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Textarea } from "../../components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"

import { useToast } from "../../components/ui/use-toast"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { CardSkeleton } from "../../components/LoadingSkeleton"
import { messagingService } from "../../services/messagingService"

export default function Messages() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [availableCandidates, setAvailableCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState("")
  const [newMessageContent, setNewMessageContent] = useState("")
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [archivedConversations, setArchivedConversations] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [selectedUserProfile, setSelectedUserProfile] = useState(null)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showUnarchiveDialog, setShowUnarchiveDialog] = useState(false)
  const [conversationToArchive, setConversationToArchive] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchArchivedConversations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations/archived`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setArchivedConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Error fetching archived conversations:", error)
    }
  }

  const handleArchiveConversation = async (conversationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations/${conversationId}/archive`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Conversation archived successfully",
        })
        fetchConversations()
        fetchArchivedConversations()
        setShowArchiveDialog(false)
        setConversationToArchive(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive conversation",
        variant: "destructive",
      })
    }
  }

  const handleUnarchiveConversation = async (conversationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations/${conversationId}/unarchive`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Conversation unarchived successfully",
        })
        fetchConversations()
        fetchArchivedConversations()
        setShowUnarchiveDialog(false)
        setConversationToArchive(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unarchive conversation",
        variant: "destructive",
      })
    }
  }

  const handleViewProfile = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/profile`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedUserProfile(data)
        setShowProfileDialog(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      })
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUploadAttachment = async (messageId) => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}/attachments`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Attachment uploaded successfully",
        })
        setSelectedFile(null)
        // Refresh messages to show the new attachment
        if (selectedConversation) {
          fetchMessages(selectedConversation.conversation_id)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to upload attachment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload attachment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/attachments/${attachmentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Attachment deleted successfully",
        })
        // Refresh messages to remove the attachment
        if (selectedConversation) {
          fetchMessages(selectedConversation.conversation_id)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete attachment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      })
    }
  }

  const handleDownloadAttachment = async (attachmentId, originalFilename) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/attachments/${attachmentId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = originalFilename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        toast({
          title: "Error",
          description: "Failed to download attachment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download attachment",
        variant: "destructive",
      })
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${conversationId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const fetchAvailableCandidates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/candidates`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setAvailableCandidates(data.candidates || [])
      }
    } catch (error) {
      console.error("Error fetching candidates:", error)
    }
  }

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation)
    await fetchMessages(conversation.conversation_id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const result = await messagingService.sendMessage(selectedConversation.other_user.id, newMessage)
      
      if (result && result.id) {
      setNewMessage("")
      await fetchMessages(selectedConversation.conversation_id)
        
        // Upload attachment if selected
        if (selectedFile) {
          await handleUploadAttachment(result.id)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Message deleted successfully",
        })
      if (selectedConversation) {
          fetchMessages(selectedConversation.conversation_id)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete message",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const handleSendNewMessage = async () => {
    if (!selectedCandidate || !newMessageContent.trim()) return

    setSending(true)
    try {
      const result = await messagingService.sendMessage(selectedCandidate, newMessageContent)
      if (result) {
      setNewMessageContent("")
      setSelectedCandidate("")
      setShowNewMessageDialog(false)
        fetchConversations()
      toast({
        title: "Success",
        description: "Message sent successfully",
      })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleNewMessageClick = () => {
    fetchAvailableCandidates()
    setShowNewMessageDialog(true)
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
      return date.toLocaleDateString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "busy":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const filteredConversations = conversations.filter(conversation =>
    conversation.other_user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.other_user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-screen">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <div className="flex-1 flex">
            <div className="w-1/3 border-r bg-background">
              <div className="p-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <CardSkeleton />
              </div>
              <div className="flex-1 p-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
              </div>
        </div>
      </div>
    )
  }



  return (
    <div className="flex h-screen">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r bg-background">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Messages</h2>
                <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={handleNewMessageClick}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send New Message</DialogTitle>
                      <DialogDescription>
                        Select a candidate to send a message to.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Select Candidate</label>
                        <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a candidate" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCandidates.map((candidate) => (
                              <SelectItem key={candidate.id} value={candidate.id}>
                                {candidate.first_name} {candidate.last_name} ({candidate.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                          value={newMessageContent}
                          onChange={(e) => setNewMessageContent(e.target.value)}
                          placeholder="Type your message..."
                          rows={4}
                        />
                      </div>
                      <Button 
                        onClick={handleSendNewMessage} 
                        disabled={!selectedCandidate || !newMessageContent.trim() || sending}
                        className="w-full"
                      >
                        {sending ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
            </div>
              
              {/* Tabs for Active/Archived */}
              <Tabs value={showArchived ? "archived" : "active"} onValueChange={(value) => {
                setShowArchived(value === "archived")
                if (value === "archived") {
                  fetchArchivedConversations()
                }
              }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="relative p-4 border-b">
              <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
            
            <div className="overflow-y-auto h-[calc(100vh-280px)]">
              {(showArchived ? archivedConversations : filteredConversations).length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p>No {showArchived ? 'archived' : ''} conversations found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              ) : (
                (showArchived ? archivedConversations : filteredConversations).map((conversation) => (
                  <div
                    key={conversation.conversation_id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                      selectedConversation?.conversation_id === conversation.conversation_id
                        ? "bg-muted"
                        : ""
                    }`}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={conversation.other_user.avatar ? `${import.meta.env.VITE_API_URL}/uploads/avatars/${conversation.other_user.avatar}` : "/placeholder.svg"}
                            alt={conversation.other_user.first_name}
                          />
                          <AvatarFallback>
                            {conversation.other_user.first_name?.[0]}{conversation.other_user.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                            conversation.other_user.status || "offline"
                          )}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {conversation.other_user.first_name} {conversation.other_user.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(conversation.last_message_at)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedConversation.other_user.avatar ? `${import.meta.env.VITE_API_URL}/uploads/avatars/${selectedConversation.other_user.avatar}` : "/placeholder.svg"}
                          alt={selectedConversation.other_user.first_name}
                        />
                        <AvatarFallback>
                          {selectedConversation.other_user.first_name?.[0]}{selectedConversation.other_user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                            selectedConversation.other_user.status || "offline"
                          )}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {selectedConversation.other_user.first_name} {selectedConversation.other_user.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.other_user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProfile(selectedConversation.other_user.id)}>
                            View Profile
                          </DropdownMenuItem>
                          {showArchived ? (
                            <DropdownMenuItem onClick={() => {
                              setConversationToArchive(selectedConversation)
                              setShowUnarchiveDialog(true)
                            }}>
                              Unarchive Conversation
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => {
                              setConversationToArchive(selectedConversation)
                              setShowArchiveDialog(true)
                            }}>
                              Archive Conversation
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender_id !== selectedConversation.other_user.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-background/50 rounded">
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-xs truncate flex-1">{attachment.original_filename}</span>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleDownloadAttachment(attachment.id, attachment.original_filename)}
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                    {isOwnMessage && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive"
                                        onClick={() => handleDeleteAttachment(attachment.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(message.created_at)}
                            </p>
                            {isOwnMessage && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete message
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-background">
                  {selectedFile && (
                    <div className="mb-2 p-2 bg-muted rounded flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{selectedFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button variant="ghost" size="icon" asChild>
                        <span>
                      <Paperclip className="h-4 w-4" />
                        </span>
                    </Button>
                    </label>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUserProfile ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedUserProfile.avatar ? `${import.meta.env.VITE_API_URL}/uploads/avatars/${selectedUserProfile.avatar}` : "/placeholder.svg"}
                    alt={selectedUserProfile.first_name}
                  />
                  <AvatarFallback>
                    {selectedUserProfile.first_name?.[0]}{selectedUserProfile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUserProfile.first_name} {selectedUserProfile.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedUserProfile.email}</p>
                  {selectedUserProfile.role === 'interviewee' && (
                    <p className="text-sm text-muted-foreground">{selectedUserProfile.position} at {selectedUserProfile.company}</p>
                  )}
                  {selectedUserProfile.role === 'recruiter' && (
                    <p className="text-sm text-muted-foreground">{selectedUserProfile.position} at {selectedUserProfile.company_name}</p>
                  )}
                </div>
              </div>
              {selectedUserProfile.bio && (
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-sm text-muted-foreground">{selectedUserProfile.bio}</p>
                </div>
              )}
              {selectedUserProfile.skills && (
                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <p className="text-sm text-muted-foreground">{selectedUserProfile.skills}</p>
                </div>
              )}
              {selectedUserProfile.location && (
                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <p className="text-sm text-muted-foreground">{selectedUserProfile.location}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this conversation? You can unarchive it later from the Archived tab.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleArchiveConversation(conversationToArchive?.conversation_id)}>
              Archive
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unarchive Confirmation Dialog */}
      <Dialog open={showUnarchiveDialog} onOpenChange={setShowUnarchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unarchive Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to unarchive this conversation? It will appear in your Active conversations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowUnarchiveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleUnarchiveConversation(conversationToArchive?.conversation_id)}>
              Unarchive
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


