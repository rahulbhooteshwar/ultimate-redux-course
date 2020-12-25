import { createSlice } from '@reduxjs/toolkit'
import { createSelector } from 'reselect'
import { apiCallBegan } from './api'

const slice = createSlice({
  name: 'bugs',
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
  },
  reducers: {
    bugsRequested: (bugs, _action) => {
      bugs.loading = true
    },
    bugsReceived: (bugs, action) => {
      bugs.list = action.payload
      bugs.loading = false
      bugs.lastFetch = Date.now()
    },
    bugsRequestFailed: (bugs, _action) => {
      bugs.loading = false
    },
    bugAssignedToUser: (bugs, action) => {
      const { id: bugId, userId } = action.payload
      const index = bugs.list.findIndex((bug) => bug.id === bugId)
      bugs.list[index].userId = userId
    },
    bugAdded: (bugs, action) => {
      bugs.list.push(action.payload)
    },
    bugResolved: (bugs, action) => {
      const index = bugs.list.findIndex((bug) => bug.id === action.payload.id)
      bugs.list[index].resolved = true
    },
    bugRemoved: (bugs, action) => {
      const index = bugs.list.findIndex((bug) => bug.id === action.payload.id)
      bugs.list.splice(index, 1)
    },
  },
})

const {
  bugsReceived,
  bugAssignedToUser,
  bugAdded,
  bugResolved,
  bugRemoved,
  bugsRequested,
  bugsRequestFailed,
} = slice.actions
export default slice.reducer

// Action Creators
const url = '/bugs'

export const loadBugs = () => (dispatch, _getState) => {
  // const { lastFetch } = getState().entities.bugs;

  // const diffInMinutes = moment().diff(moment(lastFetch), 'minutes');
  // if (diffInMinutes < 10) return;
  dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart: bugsRequested.type,
      onSuccess: bugsReceived.type,
      onError: bugsRequestFailed.type,
    })
  )
}

export const addBug = (bug) =>
  apiCallBegan({
    url,
    method: 'post',
    data: bug,
    onSuccess: bugAdded.type,
  })
export const removeBug = (id) => apiCallBegan({
    url: `${url}/${id}`,
    method: 'delete',
    onSuccess: bugRemoved.type,
  })

export const resolveBug = (id) =>
  apiCallBegan({
    url: `${url}/${id}`,
    method: 'patch',
    data: { resolved: true },
    onSuccess: bugResolved.type,
  })

export const assignBugToUser = (bugId, userId) =>
  apiCallBegan({
    url: `${url}/${bugId}`,
    method: 'patch',
    data: { userId },
    onSuccess: bugAssignedToUser.type,
  })

// Selector
export const getUnresolvedBugs = createSelector(
  (state) => state.entities.bugs.list,
  (list) => list.filter((bug) => !bug.resolved)
)

export const getBugsbyUser = (userId) =>
  createSelector(
    (state) => state.entities.bugs.list,
    (bugs) => bugs.filter((bug) => bug.userId === userId)
  )
