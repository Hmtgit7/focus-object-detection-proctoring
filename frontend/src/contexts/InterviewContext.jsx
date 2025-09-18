import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { interviewAPI, handleAPIError } from "../services/api";

// Interview state
const initialState = {
  interviews: [],
  currentInterview: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
  filters: {
    status: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "scheduledAt",
    sortOrder: "desc",
  },
};

// Action types
const INTERVIEW_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_INTERVIEWS: "SET_INTERVIEWS",
  SET_CURRENT_INTERVIEW: "SET_CURRENT_INTERVIEW",
  ADD_INTERVIEW: "ADD_INTERVIEW",
  UPDATE_INTERVIEW: "UPDATE_INTERVIEW",
  DELETE_INTERVIEW: "DELETE_INTERVIEW",
  SET_PAGINATION: "SET_PAGINATION",
  SET_FILTERS: "SET_FILTERS",
  RESET_STATE: "RESET_STATE",
};

// Reducer
const interviewReducer = (state, action) => {
  switch (action.type) {
    case INTERVIEW_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case INTERVIEW_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case INTERVIEW_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case INTERVIEW_ACTIONS.SET_INTERVIEWS:
      return {
        ...state,
        interviews: action.payload,
        loading: false,
        error: null,
      };

    case INTERVIEW_ACTIONS.SET_CURRENT_INTERVIEW:
      return { ...state, currentInterview: action.payload };

    case INTERVIEW_ACTIONS.ADD_INTERVIEW:
      return {
        ...state,
        interviews: [action.payload, ...state.interviews],
        loading: false,
        error: null,
      };

    case INTERVIEW_ACTIONS.UPDATE_INTERVIEW:
      return {
        ...state,
        interviews: state.interviews.map((interview) =>
          interview._id === action.payload._id ? action.payload : interview
        ),
        currentInterview:
          state.currentInterview?._id === action.payload._id
            ? action.payload
            : state.currentInterview,
        loading: false,
        error: null,
      };

    case INTERVIEW_ACTIONS.DELETE_INTERVIEW:
      return {
        ...state,
        interviews: state.interviews.filter(
          (interview) => interview._id !== action.payload
        ),
        currentInterview:
          state.currentInterview?._id === action.payload
            ? null
            : state.currentInterview,
        loading: false,
        error: null,
      };

    case INTERVIEW_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };

    case INTERVIEW_ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case INTERVIEW_ACTIONS.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Create context
const InterviewContext = createContext(null);

// Provider component
export const InterviewProvider = ({ children }) => {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  // Fetch interviews
  const fetchInterviews = useCallback(
    async (params = {}) => {
      dispatch({ type: INTERVIEW_ACTIONS.SET_LOADING, payload: true });

      try {
        const queryParams = {
          ...state.filters,
          page: state.pagination.page,
          limit: state.pagination.limit,
          ...params,
        };

        const response = await interviewAPI.getAll(queryParams);
        const { interviews, pagination } = response.data;

        dispatch({
          type: INTERVIEW_ACTIONS.SET_INTERVIEWS,
          payload: interviews,
        });
        dispatch({
          type: INTERVIEW_ACTIONS.SET_PAGINATION,
          payload: pagination,
        });
      } catch (error) {
        const errorData = handleAPIError(error);
        dispatch({
          type: INTERVIEW_ACTIONS.SET_ERROR,
          payload: errorData.message,
        });
      }
    },
    [state.filters, state.pagination.page, state.pagination.limit]
  );

  // Fetch single interview
  const fetchInterview = useCallback(async (interviewId) => {
    dispatch({ type: INTERVIEW_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await interviewAPI.getById(interviewId);
      dispatch({
        type: INTERVIEW_ACTIONS.SET_CURRENT_INTERVIEW,
        payload: response.data.interview,
      });
    } catch (error) {
      const errorData = handleAPIError(error);
      dispatch({
        type: INTERVIEW_ACTIONS.SET_ERROR,
        payload: errorData.message,
      });
    }
  }, []);

  // Create interview
  const createInterview = useCallback(async (interviewData) => {
    dispatch({ type: INTERVIEW_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await interviewAPI.create(interviewData);
      dispatch({
        type: INTERVIEW_ACTIONS.ADD_INTERVIEW,
        payload: response.data.interview,
      });
      return { success: true, interview: response.data.interview };
    } catch (error) {
      const errorData = handleAPIError(error);
      dispatch({
        type: INTERVIEW_ACTIONS.SET_ERROR,
        payload: errorData.message,
      });
      return { success: false, error: errorData.message };
    }
  }, []);

  // Update interview
  const updateInterview = useCallback(async (interviewId, updateData) => {
    dispatch({ type: INTERVIEW_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await interviewAPI.update(interviewId, updateData);
      dispatch({
        type: INTERVIEW_ACTIONS.UPDATE_INTERVIEW,
        payload: response.data.interview,
      });
      return { success: true, interview: response.data.interview };
    } catch (error) {
      const errorData = handleAPIError(error);
      dispatch({
        type: INTERVIEW_ACTIONS.SET_ERROR,
        payload: errorData.message,
      });
      return { success: false, error: errorData.message };
    }
  }, []);

  // Delete interview
  const deleteInterview = useCallback(async (interviewId) => {
    dispatch({ type: INTERVIEW_ACTIONS.SET_LOADING, payload: true });

    try {
      await interviewAPI.delete(interviewId);
      dispatch({
        type: INTERVIEW_ACTIONS.DELETE_INTERVIEW,
        payload: interviewId,
      });
      return { success: true };
    } catch (error) {
      const errorData = handleAPIError(error);
      dispatch({
        type: INTERVIEW_ACTIONS.SET_ERROR,
        payload: errorData.message,
      });
      return { success: false, error: errorData.message };
    }
  }, []);

  // Start interview
  const startInterview = useCallback(async (interviewId) => {
    dispatch({ type: INTERVIEW_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await interviewAPI.start(interviewId);
      dispatch({
        type: INTERVIEW_ACTIONS.UPDATE_INTERVIEW,
        payload: response.data.interview,
      });
      return { success: true, interview: response.data.interview };
    } catch (error) {
      const errorData = handleAPIError(error);
      dispatch({
        type: INTERVIEW_ACTIONS.SET_ERROR,
        payload: errorData.message,
      });
      return { success: false, error: errorData.message };
    }
  }, []);

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({ type: INTERVIEW_ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  // Set pagination
  const setPagination = useCallback((pagination) => {
    dispatch({ type: INTERVIEW_ACTIONS.SET_PAGINATION, payload: pagination });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: INTERVIEW_ACTIONS.CLEAR_ERROR });
  }, []);

  // Clear current interview
  const clearCurrentInterview = useCallback(() => {
    dispatch({ type: INTERVIEW_ACTIONS.SET_CURRENT_INTERVIEW, payload: null });
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    dispatch({ type: INTERVIEW_ACTIONS.RESET_STATE });
  }, []);

  const value = {
    ...state,
    fetchInterviews,
    fetchInterview,
    createInterview,
    updateInterview,
    deleteInterview,
    startInterview,
    setFilters,
    setPagination,
    clearError,
    clearCurrentInterview,
    resetState,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};

// Hook to use interview context
export const useInterview = () => {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  return context;
};

export default InterviewContext;
