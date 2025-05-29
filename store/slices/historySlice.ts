import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { Question, Solution } from '../../types/question';

interface HistoryState {
  questions: Question[];
  solutions: { [key: string]: Solution };
  isLoading: boolean;
  error: string | null;
  sortBy: 'newest' | 'oldest';
  filterType: 'all' | 'text' | 'image' | 'pdf' | 'audio';
}

const initialState: HistoryState = {
  questions: [],
  solutions: {},
  isLoading: false,
  error: null,
  sortBy: 'newest',
  filterType: 'all',
};

export const fetchHistory = createAsyncThunk<Question[]>(
  'history/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { history: HistoryState };
      const { sortBy, filterType } = state.history;
      
      let url = '/questions';
      const params: any = {};
      
      if (sortBy) {
        params.sort = sortBy;
      }
      
      if (filterType !== 'all') {
        params.type = filterType;
      }
      
      const response = await api.get(url, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const fetchSolution = createAsyncThunk<Solution, string>(
  'history/fetchSolution',
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/questions/${questionId}/solution`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch solution');
    }
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setSortBy: (state, action: PayloadAction<'newest' | 'oldest'>) => {
      state.sortBy = action.payload;
    },
    setFilterType: (state, action: PayloadAction<'all' | 'text' | 'image' | 'pdf' | 'audio'>) => {
      state.filterType = action.payload;
    },
    clearHistory: (state) => {
      state.questions = [];
      state.solutions = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch History
      .addCase(fetchHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Solution
      .addCase(fetchSolution.fulfilled, (state, action) => {
        state.solutions[action.payload.questionId] = action.payload;
      })
      
      // Add question to history when submitted
      .addCase('question/submit/fulfilled', (state, action) => {
        const { question } = action.payload;
        const exists = state.questions.some(q => q.id === question.id);
        
        if (!exists) {
          if (state.sortBy === 'newest') {
            state.questions = [question, ...state.questions];
          } else {
            state.questions = [...state.questions, question];
          }
        }
      });
  },
});

export const { setSortBy, setFilterType, clearHistory } = historySlice.actions;
export default historySlice.reducer;