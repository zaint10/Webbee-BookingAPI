"use strict";

var getThirdDayFromNow = function getThirdDayFromNow() {
  var today = new Date();
  var thirdDayFromNow = new Date(today);
  thirdDayFromNow.setDate(thirdDayFromNow.getDate() + 2);
  return thirdDayFromNow;
};

var toLocalTimeString = function toLocalTimeString(date) {
  var localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[1].substring(0, 8);
};

module.exports = {
  getThirdDayFromNow: getThirdDayFromNow,
  toLocalTimeString: toLocalTimeString
};