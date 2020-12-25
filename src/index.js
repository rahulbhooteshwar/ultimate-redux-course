import { addBug } from "./store/bugs"
import configureStore from "./store/configureStore"

const store = configureStore()

store.dispatch(addBug({ description: 'a' }))
