export const parseTimestamp = (timestamp: string) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const date = new Date(timestamp);

  const year = date.getFullYear();

  // Get month name
  const month = date.toLocaleString("default", { month: "long" });

  const day = date.getDate();
  const dayIndex = date.getDay()

  let hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert 24 → 12 hour
  hours = hours % 12;
  if (hours === 0) hours = 12;

  const time = `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;

  return {
    year,
    month,
    day,
    time,
    weekDayIndex:dayIndex,
    weekDay:dayNames[dayIndex],
    timeInMilliseconds: date.getTime()
  };
};
