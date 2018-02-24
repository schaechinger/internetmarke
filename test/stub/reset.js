module.exports = (stubObj) => {
  Object.keys(stubObj).forEach(prop => {
    const val = stubObj[prop];
    if ('function' === typeof val && val.resetHistory) {
      val.resetHistory();
    }
  });
};
