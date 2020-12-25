const logger = (param) => (_store) => (next) => (action) => {
  console.log('Logging', param)
  // console.log('next', next);
  // console.log('action', action);
  return next(action)
}

export default logger
