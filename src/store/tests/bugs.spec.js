/* eslint-disable max-lines-per-function */
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { addBug, assignBugToUser, getBugsbyUser, getUnresolvedBugs, loadBugs, removeBug, resolveBug } from "../bugs"
import configureStore from "../configureStore"

describe('bugsSlice', () => {
  let store
  let fakeAxios
  let initialList = [
    {id: 100, description: 'init1'},
    {id: 101, description: 'init2'}
  ]
  beforeEach(async () => {
    store = configureStore()
    fakeAxios = new MockAdapter(axios)
    // initialize with few bugs in store
    fakeAxios.onGet('/bugs').reply(200, initialList)
    await loadBugs()(store.dispatch, store.getState())
  })
  const bugSlice = ()=> store.getState().entities.bugs
  it('should add bug to store when saved to server', async () => {
    // arrange
    const bug = { description: 'a' }
    const savedBug = {...bug, id: 1}
    fakeAxios.onPost('/bugs').reply(200, savedBug)

    //act
    await store.dispatch(addBug(bug))

    //assert
    expect(bugSlice().list).toContainEqual(savedBug)
  })
  it('should not add bug to store when not saved to server', async () => {
    // arrange
    const bug = { description: 'a' }
    fakeAxios.onPost('/bugs').reply(500)

    //act
    await store.dispatch(addBug(bug))

    //assert
    expect(bugSlice().list).toHaveLength(initialList.length)
  })
  it('should remove bug from store when removed from server', async () => {
    // arrange
    const toBeRemovedId = initialList[0].id
    fakeAxios.onDelete(`/bugs/${toBeRemovedId}`).reply(200, { id: toBeRemovedId })
    //act
    await store.dispatch(removeBug(toBeRemovedId))
    //assert
    expect(bugSlice().list[0].id).not.toEqual(toBeRemovedId)
  })
  it('should resolve a bug in store when resolved on server', async () => {
    // arrange
    const toBeResolvedId = initialList[0].id
    fakeAxios.onPatch(`/bugs/${toBeResolvedId}`).reply(200, { id: toBeResolvedId, resolved: true })
    //act
    await store.dispatch(resolveBug(toBeResolvedId))
    //assert
    expect(bugSlice().list[0].resolved).toBeTruthy()
  })
  it('should stop loader when bug loading fails', async () => {
    // arrange
    fakeAxios.onGet('/bugs').reply(500)
    //act
    await loadBugs()(store.dispatch, store.getState())
    //assert
    setTimeout(() => {
      expect(bugSlice().loading).toBeFalsy()
    })
  })
  it('should return unresolved bugs', () => {
    //act
    const unresolved = getUnresolvedBugs(store.getState())
    //assert
    expect(unresolved.length).toBe(initialList.filter((bug) => !bug.resolved).length)
  })
  it('should assign bug to user', async () => {
    const assignee = 200
    const toBeAssigned = initialList[0].id
    fakeAxios.onPatch(`/bugs/${toBeAssigned}`).reply(200, { id: toBeAssigned, userId: assignee })

    await store.dispatch(assignBugToUser(toBeAssigned, assignee))
    const userBugs = getBugsbyUser(assignee)(store.getState())
    expect(userBugs).toHaveLength(1)
  })

})