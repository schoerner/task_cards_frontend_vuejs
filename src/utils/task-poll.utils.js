export function pad2(value) {
  return String(value).padStart(2, '0');
}

export function toMinutes(time) {
  if (!time || typeof time !== 'string') {
    return 0;
  }

  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function fromMinutes(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${pad2(hours)}:${pad2(minutes)}`;
}

export function formatWeekday(dateString) {
  const [year, month, day] = String(dateString).split('-').map(Number);
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(new Date(year, month - 1, day));
}

export function formatDateShort(dateString) {
  const [year, month, day] = String(dateString).split('-').map(Number);
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(new Date(year, month - 1, day));
}

export function addDays(dateString, amount) {
  const [year, month, day] = String(dateString).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function getDateRange(startDate, endDate) {
  if (!startDate || !endDate || startDate > endDate) {
    return [];
  }

  const result = [];
  let current = startDate;
  while (current <= endDate) {
    result.push(current);
    current = addDays(current, 1);
  }
  return result;
}

export function toLocalSlotKeyFromOffsetDateTime(offsetDateTimeString) {
  if (!offsetDateTimeString) {
    return null;
  }

  const date = new Date(offsetDateTimeString);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function toOffsetDateTimeString(localDateTimeString) {
  if (!localDateTimeString) {
    return null;
  }

  const date = new Date(`${localDateTimeString}:00`);
  return formatDateAsOffsetDateTime(date);
}

export function addMinutesToOffsetDateTime(offsetDateTimeString, minutesToAdd) {
  const date = new Date(offsetDateTimeString);
  date.setMinutes(date.getMinutes() + Number(minutesToAdd || 0));
  return formatDateAsOffsetDateTime(date);
}

export function formatDateAsOffsetDateTime(date) {
  const timezoneOffsetMinutes = -date.getTimezoneOffset();
  const sign = timezoneOffsetMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(timezoneOffsetMinutes);
  const offsetHours = pad2(Math.floor(absoluteMinutes / 60));
  const offsetMinutes = pad2(absoluteMinutes % 60);

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}${sign}${offsetHours}:${offsetMinutes}`;
}

export function normalizeHeatmapSlot(slot, slotMinutes) {
  if (!slot?.slotStartAt) {
    return slot;
  }

  const start = new Date(slot.slotStartAt);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + Number(slotMinutes || 0));

  const date = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;
  const time = `${pad2(start.getHours())}:${pad2(start.getMinutes())}`;
  const endTime = `${pad2(end.getHours())}:${pad2(end.getMinutes())}`;

  return {
    ...slot,
    date,
    time,
    endTime,
    key: `${date}T${time}`
  };
}

export function normalizeHeatmapSlots(slots, slotMinutes) {
  return (slots || []).map((slot) => normalizeHeatmapSlot(slot, slotMinutes));
}
