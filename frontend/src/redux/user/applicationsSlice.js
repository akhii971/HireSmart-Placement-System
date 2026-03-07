import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [], // applied jobs
};

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    addApplication: (state, action) => {
      state.list.unshift({
        id: Date.now(),
        appliedAt: new Date().toLocaleString(),
        ...action.payload,
      });
    },
  },
});

export const { addApplication } = applicationsSlice.actions;
export default applicationsSlice.reducer;
