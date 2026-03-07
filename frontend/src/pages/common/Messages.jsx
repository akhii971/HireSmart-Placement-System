import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  FaPaperPlane,
  FaArrowLeft,
  FaComments,
  FaSearch,
  FaSmile,
  FaCheckDouble,
  FaCheck,
  FaEllipsisV,
  FaCircle,
} from "react-icons/fa";

// ─── Helpers ───
const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDateSeparator = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
};

const shouldShowDateSeparator = (messages, index) => {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].createdAt).toDateString();
  const curr = new Date(messages[index].createdAt).toDateString();
  return prev !== curr;
};

// ─── Main Component ───
export default function Messages() {
  const { user, token: userToken } = useSelector((s) => s.auth);
  const { recruiter, token: recruiterToken } = useSelector((s) => s.recruiterAuth);

  const currentUser = user || recruiter;
  const currentModel = user ? "User" : "Recruiter";

  const { socket } = useSocket();
  const location = useLocation();
  const autoOpenTarget = location.state?.autoOpenChat;

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (activeChat) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [activeChat]);

  // 1. Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get("/messages/conversations");

        if (autoOpenTarget) {
          const existingChat = data.find(
            (c) => c.otherParticipant?._id === autoOpenTarget._id
          );
          if (existingChat) {
            setActiveChat(existingChat);
            setConversations(data);
          } else {
            const virtualChat = {
              _id: "virtual_" + Date.now(),
              otherParticipant: {
                _id: autoOpenTarget._id,
                name: autoOpenTarget.name,
              },
              otherParticipantModel: autoOpenTarget.model,
              unreadCount: 0,
              virtual: true,
            };
            setActiveChat(virtualChat);
            setConversations([virtualChat, ...data]);
          }
        } else {
          setConversations(data);
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoadingChats(false);
      }
    };
    if (currentUser) fetchConversations();
  }, [currentUser, autoOpenTarget]);

  // 2. Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return;
      if (activeChat.virtual) {
        setMessages([]);
        return;
      }
      try {
        const { data } = await api.get(`/messages/${activeChat._id}`);
        setMessages(data);

        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeChat._id ? { ...c, unreadCount: 0 } : c
          )
        );

        if (socket) {
          socket.emit("join_conversation", activeChat._id);
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [activeChat, socket]);

  // 3. Socket Listener
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (incomingMsg) => {
      if (activeChat && incomingMsg.conversationId === activeChat._id) {
        setMessages((prev) => [...prev, incomingMsg]);
      } else {
        setConversations((prev) =>
          prev.map((c) => {
            if (c._id === incomingMsg.conversationId) {
              return {
                ...c,
                unreadCount: (c.unreadCount || 0) + 1,
                lastMessage: incomingMsg.text,
              };
            }
            return c;
          })
        );
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [socket, activeChat]);

  // 4. Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const text = newMessage;
    setNewMessage("");

    const dummyMsg = {
      _id: Date.now().toString(),
      conversationId: activeChat._id,
      senderId: currentUser._id,
      senderModel: currentModel,
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, dummyMsg]);

    try {
      const { data } = await api.post("/messages", {
        text,
        receiverId: activeChat.otherParticipant._id,
        receiverModel: activeChat.otherParticipantModel,
      });

      if (socket) socket.emit("send_message", data);

      setConversations((prev) => {
        const isExisting = prev.some((c) => c._id === activeChat._id);
        if (isExisting) {
          return prev.map((c) =>
            c._id === activeChat._id ? { ...c, lastMessage: text } : c
          );
        } else {
          const newChatObj = {
            _id: data.conversationId,
            otherParticipant: activeChat.otherParticipant,
            otherParticipantModel: activeChat.otherParticipantModel,
            lastMessage: text,
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
          };
          setActiveChat(newChatObj);
          return [newChatObj, ...prev.filter((c) => !c.virtual)];
        }
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    c.otherParticipant?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed top-[64px] bottom-[56px] md:bottom-0 left-0 right-0 bg-white flex overflow-hidden z-40 mt-10">
        {/* ════════════════════════════════════════════
            LEFT SIDEBAR — Contacts / Conversations
        ════════════════════════════════════════════ */}
        <div
          className={`w-full md:w-[380px] flex-shrink-0 border-r border-slate-200 flex flex-col bg-white ${
            activeChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-[64px] px-4 bg-[#f0f2f5] flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-sm">
                {currentUser?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <span className="font-semibold text-slate-700 text-sm hidden sm:inline">
                {currentUser?.name || "Me"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <button className="p-2 rounded-full hover:bg-slate-200 transition">
                <FaComments size={18} />
              </button>
              <button className="p-2 rounded-full hover:bg-slate-200 transition">
                <FaEllipsisV size={16} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-3 py-2 bg-[#f0f2f5]">
            <div className="flex items-center bg-white rounded-lg px-3 py-2 gap-3 border border-slate-100">
              <FaSearch className="text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loadingChats ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Loading chats...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#f0f2f5] flex items-center justify-center">
                  <FaComments className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500 text-sm font-medium">No conversations yet</p>
                <p className="text-slate-400 text-xs mt-1">
                  Start chatting from a candidate's profile!
                </p>
              </div>
            ) : (
              filteredConversations.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  className={`flex items-center gap-3 px-4 py-[14px] cursor-pointer transition-all border-b border-slate-100/80 hover:bg-[#f5f6f6] ${
                    activeChat?._id === chat._id
                      ? "bg-[#f0f2f5]"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-lg">
                      {chat.otherParticipant?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    {/* Online dot */}
                    <FaCircle
                      className="absolute bottom-0 right-0 text-emerald-400 border-2 border-white rounded-full"
                      size={12}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-[2px]">
                      <h3 className="font-semibold text-slate-800 text-[15px] truncate pr-2">
                        {chat.otherParticipant?.name || "Unknown"}
                      </h3>
                      <span
                        className={`text-[11px] flex-shrink-0 ${
                          chat.unreadCount > 0
                            ? "text-emerald-500 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {chat.updatedAt
                          ? new Date(chat.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-[13px] truncate pr-2 ${
                          chat.unreadCount > 0
                            ? "text-slate-800 font-medium"
                            : "text-slate-500"
                        }`}
                      >
                        {chat.lastMessage || "Tap to start chatting"}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-emerald-500 text-white text-[11px] min-w-[20px] h-[20px] flex items-center justify-center rounded-full font-bold px-1 flex-shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT PANE — Chat Window
        ════════════════════════════════════════════ */}
        <div
          className={`flex-1 flex flex-col ${
            !activeChat ? "hidden md:flex" : "flex"
          }`}
        >
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-[64px] px-4 bg-[#f0f2f5] border-b border-slate-200 flex items-center gap-3 flex-shrink-0 z-10">
                <button
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-2 -ml-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
                >
                  <FaArrowLeft size={16} />
                </button>
                <div className="relative">
                  <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold shadow-sm">
                    {activeChat.otherParticipant?.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>
                  <FaCircle
                    className="absolute bottom-0 right-0 text-emerald-400 border-2 border-[#f0f2f5] rounded-full"
                    size={10}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-[15px] truncate">
                    {activeChat.otherParticipant?.name}
                  </h3>
                  <p className="text-[11px] text-emerald-500 font-medium">
                    online
                  </p>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <button className="p-2 rounded-full hover:bg-slate-200 transition">
                    <FaSearch size={15} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-slate-200 transition">
                    <FaEllipsisV size={15} />
                  </button>
                </div>
              </div>

              {/* Chat Body — WhatsApp wallpaper */}
              <div
                className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 py-4 no-scrollbar"
                style={{
                  backgroundColor: "#efeae2",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cfc6' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="bg-[#fcf4cb] rounded-xl px-5 py-3 shadow-sm text-center max-w-sm">
                      <p className="text-[13px] text-[#54656f]">
                        🔒 Messages are end-to-end secured. No one outside of
                        this chat can read them.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((msg, idx) => {
                      const isMine = msg.senderId === currentUser._id;
                      const showDate = shouldShowDateSeparator(messages, idx);

                      return (
                        <div key={msg._id || idx}>
                          {/* Date Separator */}
                          {showDate && (
                            <div className="flex justify-center my-3">
                              <span className="bg-white/90 text-[#54656f] text-[12px] font-medium px-4 py-1.5 rounded-lg shadow-sm">
                                {formatDateSeparator(msg.createdAt)}
                              </span>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.15 }}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            } mb-[3px]`}
                          >
                            <div
                              className={`relative max-w-[75%] sm:max-w-[65%] px-[10px] pt-[7px] pb-[8px] rounded-lg shadow-sm ${
                                isMine
                                  ? "bg-[#d9fdd3] rounded-tr-none"
                                  : "bg-white rounded-tl-none"
                              }`}
                            >
                              {/* Triangle tail */}
                              <div
                                className={`absolute top-0 w-0 h-0 ${
                                  isMine
                                    ? "right-[-8px] border-l-[8px] border-l-[#d9fdd3] border-t-[8px] border-t-transparent border-b-[0px]"
                                    : "left-[-8px] border-r-[8px] border-r-white border-t-[8px] border-t-transparent border-b-[0px]"
                                }`}
                                style={{
                                  ...(isMine
                                    ? { borderTopColor: "#d9fdd3" }
                                    : { borderTopColor: "white" }),
                                  borderLeftColor: isMine ? "transparent" : undefined,
                                  borderRightColor: !isMine ? "transparent" : undefined,
                                }}
                              />

                              <p className="text-[14.2px] leading-[19px] text-[#111b21] whitespace-pre-wrap break-words">
                                {msg.text}
                              </p>

                              {/* Timestamp + read receipts */}
                              <div
                                className={`flex items-center gap-1 mt-[2px] ${
                                  isMine ? "justify-end" : "justify-end"
                                }`}
                              >
                                <span className="text-[11px] text-[#667781]">
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isMine && (
                                  <FaCheckDouble
                                    className="text-[#53bdeb]"
                                    size={13}
                                  />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="h-[62px] px-3 bg-[#f0f2f5] border-t border-slate-200 flex items-center gap-2">
                <button className="p-2 text-[#54656f] hover:text-slate-700 rounded-full hover:bg-slate-200 transition">
                  <FaSmile size={22} />
                </button>

                <form
                  onSubmit={handleSendMessage}
                  className="flex-1 flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 bg-white rounded-lg px-4 py-[9px] outline-none text-[15px] text-[#111b21] placeholder-[#667781] border border-slate-100 focus:border-emerald-300 transition"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-[42px] h-[42px] rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-40 disabled:hover:bg-emerald-500 disabled:active:scale-100 shadow-sm"
                  >
                    <FaPaperPlane className="ml-[-1px] mt-[-1px]" size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* ═══ EMPTY STATE (Desktop) ═══ */
            <div className="h-full flex flex-col items-center justify-center bg-[#f0f2f5]">
              <div className="text-center max-w-md mx-auto px-8">
                <div className="w-[220px] h-[220px] mx-auto mb-8 rounded-full bg-[#e8e8e8]/50 flex items-center justify-center">
                  <FaComments size={80} className="text-[#bfc8d0]" />
                </div>
                <h2 className="text-3xl font-light text-[#41525d] mb-3">
                  HireSmart Messaging
                </h2>
                <p className="text-[#667781] text-sm leading-relaxed">
                  Send and receive messages to candidates and recruiters.
                  <br />
                  Select a conversation or start a new one from a candidate's
                  profile.
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-[#667781]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  End-to-end secured
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
