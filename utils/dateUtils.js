const getThirdDayFromNow = () => {
  const today = new Date();
  const thirdDayFromNow = new Date(today);
  thirdDayFromNow.setDate(thirdDayFromNow.getDate() + 2);
  return thirdDayFromNow;
};

const toLocalTimeString = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[1].substring(0, 8);
};

const toUTCDateTimeString = (date, time) => {
  const dateTimeString = `${date}T${time}:00.000Z`;
  const utcDate = new Date(dateTimeString);

  return utcDate.toISOString();
};



module.exports = {
  getThirdDayFromNow,
  toLocalTimeString
};