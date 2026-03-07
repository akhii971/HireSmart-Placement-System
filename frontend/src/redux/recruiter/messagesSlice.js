// redux/recruiter/messagesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [
    {
      candidateId: 1,
      name: "Rahul Kumar",
      online: true,
      unread: 1,
      profile: {
        email: "rahul@gmail.com",
        phone: "+91 98765 43210",
        job: "Frontend Developer Intern",
      },
      typing: false,
      messages: [
        {
          id: 1,
          from: "candidate",
          text: "Hi, I applied for the Frontend role.",
          time: "10:20 AM",
          status: "seen",
          file: null,
          voice: null,
        },
      ],
    },
  ],
  activeChatId: 1,
  search: "",
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
      const chat = state.chats.find(c => c.candidateId === action.payload);
      if (chat) chat.unread = 0;
    },

    setSearch: (state, action) => {
      state.search = action.payload;
    },

    setTyping: (state, action) => {
      const { candidateId, typing } = action.payload;
      const chat = state.chats.find(c => c.candidateId === candidateId);
      if (chat) chat.typing = typing;
    },

    sendMessage: (state, action) => {
      const { candidateId, text, file, voice } = action.payload;
      const chat = state.chats.find(c => c.candidateId === candidateId);
      if (chat) {
        chat.messages.push({
          id: Date.now(),
          from: "recruiter",
          text: text || null,
          file: file || null,
          voice: voice || null,
          time: new Date().toLocaleTimeString(),
          status: "sent",
        });
      }
    },

    receiveMessage: (state, action) => {
      const { candidateId, text } = action.payload;
      const chat = state.chats.find(c => c.candidateId === candidateId);
      if (chat) {
        chat.messages.push({
          id: Date.now(),
          from: "candidate",
          text,
          file: null,
          voice: null,
          time: new Date().toLocaleTimeString(),
          status: "delivered",
        });
        if (state.activeChatId !== candidateId) chat.unread += 1;
      }
    },

    markSeen: (state, action) => {
      const { candidateId } = action.payload;
      const chat = state.chats.find(c => c.candidateId === candidateId);
      if (chat) {
        chat.messages.forEach(m => {
          if (m.from === "recruiter") m.status = "seen";
        });
      }
    },

    systemMessage: (state, action) => {
      const { candidateId, text } = action.payload;
      const chat = state.chats.find(c => c.candidateId === candidateId);
      if (chat) {
        chat.messages.push({
          id: Date.now(),
          from: "system",
          text,
          file: null,
          voice: null,
          time: new Date().toLocaleTimeString(),
          status: "seen",
        });
      }
    },
  },
});

export const {
  setActiveChat,
  setSearch,
  setTyping,
  sendMessage,
  receiveMessage,
  markSeen,
  systemMessage,
} = messagesSlice.actions;

export default messagesSlice.reducer;
