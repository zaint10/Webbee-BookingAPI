const getThirdDayFromNow = () => {
  const today = new Date();
  const thirdDayFromNow = new Date(today);
  thirdDayFromNow.setDate(thirdDayFromNow.getDate() + 2);
  return thirdDayFromNow;
};

module.exports = {
  getThirdDayFromNow,
};
