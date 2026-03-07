import { configureStore } from "@reduxjs/toolkit";
import candidatesReducer from "./candidatesSlice";
import jobsReducer from "./jobsSlice";
import notificationsReducer from "./notificationsSlice";
import messagesReducer from "./messagesSlice";
import userNotificationsReducer from "../user/notificationsSlice";
import applicationsReducer from "../user/applicationsSlice";
import usermessagesReducer from "../user/messagesSlice";
import authReducer from "../user/authSlice";
import recruiterAuthReducer from "../recruiter/recruiterAuthSlice";
import adminAuthReducer from "../admin/adminAuthSlice";





export const store = configureStore({
  reducer: {
    candidates: candidatesReducer,
    jobs: jobsReducer,
    notifications: notificationsReducer,
    messages: messagesReducer,
    userNotifications: userNotificationsReducer,
    applications: applicationsReducer,
    userMessages: usermessagesReducer,
     auth: authReducer,
        recruiterAuth: recruiterAuthReducer,
    adminAuth: adminAuthReducer,

  

   
   
    
  },
});
