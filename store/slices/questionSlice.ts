import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { assemblyAiApi } from '../../utils/api';
import { Question, Solution, QuestionSubmitRequest, TranscriptionResponse } from '../../types/question';
import * as FileSystem from 'expo-file-system';

interface QuestionState {
  currentQuestion: Question | null;
  currentSolution: Solution | null;
  isSubmitting: boolean;
  isProcessing: boolean;
  uploadProgress: number;
  error: string | null;
}

const initialState: QuestionState = {
  currentQuestion: null,
  currentSolution: null,
  isSubmitting: false,
  isProcessing: false,
  uploadProgress: 0,
  error: null,
};

// Function to handle file upload
const uploadFile = async (file: any, type: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.url;
};

// Transcribe audio using AssemblyAI
export const transcribeAudio = createAsyncThunk<TranscriptionResponse, string>(
  'question/transcribeAudio',
  async (audioUrl, { rejectWithValue }) => {
    try {
      // Upload the audio file to AssemblyAI
      const uploadResponse = await assemblyAiApi.post('/upload', {
        audio_url: audioUrl,
      });
      
      // Start the transcription
      const transcriptResponse = await assemblyAiApi.post('/transcript', {
        audio_url: uploadResponse.data.upload_url,
      });
      
      const transcriptId = transcriptResponse.data.id;
      
      // Poll for the transcription result
      let result;
      let status = 'processing';
      
      while (status === 'processing' || status === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollResponse = await assemblyAiApi.get(`/transcript/${transcriptId}`);
        status = pollResponse.data.status;
        
        if (status === 'completed') {
          result = pollResponse.data;
          break;
        } else if (status === 'error') {
          throw new Error(pollResponse.data.error);
        }
      }
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Transcription failed');
    }
  }
);

// Submit a question
export const submitQuestion = createAsyncThunk<{ question: Question, solution: Solution }, QuestionSubmitRequest>(
  'question/submit',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      let fileUrl;
      
      // If there's a file, upload it first
      if (data.file) {
        fileUrl = await uploadFile(data.file, data.type);
      }
      
      // If it's an audio question, transcribe it
      if (data.type === 'audio' && fileUrl) {
        const transcription = await dispatch(transcribeAudio(fileUrl)).unwrap();
        data.prompt = transcription.text;
      }
      
      // Submit the question
      const response = await api.post('/questions', {
        ...data,
        sourceUrl: fileUrl,
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit question');
    }
  }
);

// Get a question by ID
export const getQuestionById = createAsyncThunk<{ question: Question, solution: Solution }, string>(
  'question/getById',
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/questions/${questionId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch question');
    }
  }
);

const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
      state.currentSolution = null;
      state.error = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Question
      .addCase(submitQuestion.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitQuestion.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentQuestion = action.payload.question;
        state.currentSolution = action.payload.solution;
        state.uploadProgress = 0;
      })
      .addCase(submitQuestion.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
        state.uploadProgress = 0;
      })
      
      // Transcribe Audio
      .addCase(transcribeAudio.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(transcribeAudio.fulfilled, (state) => {
        state.isProcessing = false;
      })
      .addCase(transcribeAudio.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })
      
      // Get Question By ID
      .addCase(getQuestionById.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(getQuestionById.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentQuestion = action.payload.question;
        state.currentSolution = action.payload.solution;
      })
      .addCase(getQuestionById.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentQuestion, setUploadProgress, clearError } = questionSlice.actions;
export default questionSlice.reducer;