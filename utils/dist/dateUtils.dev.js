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

var toUTCDateTimeString = function toUTCDateTimeString(date, time) {
  var dateTimeString = "".concat(date, "T").concat(time, ":00.000Z");
  var utcDate = new Date(dateTimeString);
  return utcDate.toISOString();
};

module.exports = {
  getThirdDayFromNow: getThirdDayFromNow,
  toLocalTimeString: toLocalTimeString
};