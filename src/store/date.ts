type DateType = string | number;

export const getDate = () => {
  const date = new Date();
  const year = date.getFullYear().toString();

  let month: DateType = date.getMonth() + 1;
  month = month < 10 ? '0' + month.toString() : month.toString();

  let day: DateType = date.getDate();
  day = day < 10 ? '0' + day.toString() : day.toString();

  let hour: DateType = date.getHours();
  hour = hour < 10 ? '0' + hour.toString() : hour.toString();

  let minites: DateType = date.getMinutes();
  minites = minites < 10 ? '0' + minites.toString() : minites.toString();

  let seconds: DateType = date.getSeconds();
  seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

  return year + month + day + hour + minites + seconds;
};

export const getExpireTime = () => {
  const nowTime = new Date();
  const expireTime = new Date();

  expireTime.setMinutes(nowTime.getMinutes() + 60);

  return expireTime;
};
