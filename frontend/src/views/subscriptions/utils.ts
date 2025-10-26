import dayjs from "@/lib/dayjs";

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const date = dayjs(dateStr);
  if (!date.isValid()) return "—";
  return date.format("MMM D, YYYY");
};

export const getNextPickupDate = (dayOfWeek: string) => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const targetDay = daysOfWeek.indexOf(dayOfWeek);
  if (targetDay === -1) return null;

  const today = dayjs();
  const todayDay = today.day();
  let daysUntilNext = targetDay - todayDay;

  if (daysUntilNext <= 0) {
    daysUntilNext += 7;
  }

  return today.add(daysUntilNext, "day");
};
