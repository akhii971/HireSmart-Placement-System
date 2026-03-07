import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [
    {
      id: 1,
      jobTitle: "Frontend Developer",
      company: "TechNova",
      unread: 1,
      typing: false,
      messages: [
        {
          id: 101,
          sender: "recruiter",
          text: "Hi Akhinesh, we reviewed your profile.",
          time: Date.now() - 1000 * 60 * 60,
          seen: false,
          delivered: true,
        },
      ],
    },
    {
      id: 2,
      jobTitle: "MERN Stack Intern",
      company: "InnoSoft",
      unread: 0,
      typing: false,
      messages: [],
    },
  ],
  activeConversationId: null,
};

const usermessagesSlice = createSlice({
  name: "usermessages",
  initialState,
  reducers: {
    openConversation(state, action) {
      state.activeConversationId = action.payload;
      const conv = state.conversations.find(c => c.id === action.payload);
      if (conv) {
        conv.unread = 0;
        // mark recruiter messages as seen
        conv.messages.forEach(m => {
          if (m.sender === "recruiter") m.seen = true;
        });
      }
    },

    sendMessage(state, action) {
      const { conversationId, text } = action.payload;
      const conv = state.conversations.find(c => c.id === conversationId);
      if (!conv) return;

      const msg = {
        id: Date.now(),
        sender: "user",
        text,
        time: Date.now(),
        delivered: true,
        seen: false, // recruiter hasn't seen yet
      };

      conv.messages.push(msg);

      // simulate recruiter "seen" after 2s
      setTimeout(() => {
        msg.seen = true;
      }, 2000);
    },

    receiveMessage(state, action) {
      const { conversationId, text } = action.payload;
      const conv = state.conversations.find(c => c.id === conversationId);
      if (!conv) return;

      conv.messages.push({
        id: Date.now(),
        sender: "recruiter",
        text,
        time: Date.now(),
        delivered: true,
        seen: false,
      });

      if (state.activeConversationId !== conversationId) {
        conv.unread += 1;
      }
    },

    setTyping(state, action) {
      const { conversationId, typing } = action.payload;
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv) conv.typing = typing;
    },
    createConversation(state, action) {
  const { jobTitle, company } = action.payload;

  const newConv = {
    id: Date.now(),
    jobTitle,
    company,
    unread: 0,
    typing: false,
    messages: [
      {
        id: Date.now() + 1,
        sender: "recruiter",
        text: `Hi! Thanks for applying to ${jobTitle} at ${company}.`,
        time: Date.now(),
        seen: false,
        delivered: true,
      },
    ],
  };

  state.conversations.unshift(newConv);
  state.activeConversationId = newConv.id;
},
  },
});

export const {
  openConversation,
  sendMessage,
  receiveMessage,
  setTyping,
  createConversation,
} = usermessagesSlice.actions;

export default usermessagesSlice.reducer;
