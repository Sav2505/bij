import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IFirst, IFirstState } from 'Shared/interfaces/general/interface';

const initialState: IFirstState = {
  firstList: [],
}

const firstSlice = createSlice({
  name: 'first',
  initialState,
  reducers: {
    
    setFirstState: (state, action: PayloadAction<IFirst[]>) => {
      state.firstList = action.payload;
    },

    printState: (state) => {
      console.log('Current First State:', JSON.parse(JSON.stringify(state.firstList)));
    },
    
  },
});

export const { setFirstState, printState } = firstSlice.actions;

export default firstSlice.reducer;
