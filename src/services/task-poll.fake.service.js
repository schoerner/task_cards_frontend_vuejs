const STATUS = {
  AVAILABLE: 'AVAILABLE',
  IF_NEEDED: 'IF_NEEDED',
  UNAVAILABLE: 'UNAVAILABLE'
};

const DEFAULT_INTERNAL_MEMBERS = [
  { id: 'int-1', type: 'internal', displayName: 'Gernot Schörner', email: 'g.schoerner@schule.example' },
  { id: 'int-2', type: 'internal', displayName: 'Max Mustermann', email: 'm.mustermann@schule.example' },
  { id: 'int-3', type: 'internal', displayName: 'Heike Musterfrau', email: 'heike.musterfrau@schule.example' },
  { id: 'int-4', type: 'internal', displayName: 'Jana Beispiel', email: 'jana.beispiel@schule.example' },
  { id: 'int-5', type: 'internal', displayName: 'Tim Demo', email: 'tim.demo@schule.example' }
];

const DEFAULT_EXTERNAL_PARTICIPANTS = [
  { id: 'ext-1', type: 'external', displayName: 'Anna', email: 'anna@example.org' },
  { id: 'ext-2', type: 'external', displayName: 'Ben', email: 'ben@example.org' },
  { id: 'ext-3', type: 'external', displayName: 'Chris', email: 'chris@example.org' },
  { id: 'ext-4', type: 'external', displayName: 'Dana', email: 'dana@example.org' }
];

function toIsoDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function combineDateTime(dateString, timeString) {
  return `${dateString}T${timeString}`;
}

function pad(num) {
  return String(num).padStart(2, '0');
}

function addMinutes(timeString, minutesToAdd) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const total = hours * 60 + minutes + minutesToAdd;
  const normalized = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
  return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
}

function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function getDateRange(startDate, endDate) {
  const result = [];
  let current = parseDate(startDate);
  const end = parseDate(endDate);

  while (current <= end) {
    result.push(toIsoDate(current));
    current = addDays(current, 1);
  }

  return result;
}

function createDefaultIncludedDates(startDate, endDate) {
  return getDateRange(startDate, endDate);
}

function getNextWeekRange() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = So, 1 = Mo, ...
  const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;

  const start = addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), daysUntilNextMonday);
  const end = addDays(start, 6);

  return {
    startDate: toIsoDate(start),
    endDate: toIsoDate(end)
  };
}

function createSlotsForPoll(poll) {
  const allDates = getDateRange(poll.startDate, poll.endDate);
  const included = new Set(poll.includedDates || []);
  const startMinutes = timeToMinutes(poll.dayStartTime);
  const endMinutes = timeToMinutes(poll.dayEndTime);
  const slotMinutes = poll.slotMinutes;

  const dates = allDates.filter((date) => included.has(date));
  const slots = [];

  for (const date of dates) {
    for (let current = startMinutes; current < endMinutes; current += slotMinutes) {
      const time = `${pad(Math.floor(current / 60))}:${pad(current % 60)}`;
      const slotKey = combineDateTime(date, time);
      slots.push({
        key: slotKey,
        date,
        time,
        endTime: addMinutes(time, slotMinutes)
      });
    }
  }

  return slots;
}

function createEmptyResponse(participantId) {
  return {
    participantId,
    slots: {}
  };
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function mulberry32(seed) {
  let t = seed;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randomStatus(random) {
  const value = random();
  if (value < 0.42) return STATUS.AVAILABLE;
  if (value < 0.68) return STATUS.IF_NEEDED;
  return STATUS.UNAVAILABLE;
}

function buildHeatmap(poll, ownerResponse, participantPreviewList = []) {
  const slots = createSlotsForPoll(poll);
  const participantMap = new Map(participantPreviewList.map((participant) => [participant.id, participant]));
  const allResponses = [
    ...participantPreviewList.map((participant) => participant.response || createEmptyResponse(participant.id)),
    ownerResponse || createEmptyResponse('owner')
  ];

  return slots.map((slot) => {
    const availableNames = [];
    const ifNeededNames = [];
    const unavailableNames = [];

    for (const response of allResponses) {
      const status = response?.slots?.[slot.key] || STATUS.UNAVAILABLE;
      const participant = participantMap.get(response.participantId);
      const name = participant?.displayName || (response.participantId === 'owner' ? 'Ich' : 'Unbekannt');

      if (status === STATUS.AVAILABLE) {
        availableNames.push(name);
      } else if (status === STATUS.IF_NEEDED) {
        ifNeededNames.push(name);
      } else {
        unavailableNames.push(name);
      }
    }

    const score = availableNames.length * 2 + ifNeededNames.length;
    return {
      ...slot,
      score,
      availableCount: availableNames.length,
      ifNeededCount: ifNeededNames.length,
      unavailableCount: unavailableNames.length,
      availableNames,
      ifNeededNames,
      unavailableNames
    };
  });
}

function normalizeExternalEntries(rawText) {
  const normalized = rawText
    .replace(/;\s*/g, '\n')
    .replace(/,\s*(?=[^,]*@)/g, '\n')
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const results = [];
  const emailRegex = /<?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>?/i;

  normalized.forEach((entry) => {
    const match = entry.match(emailRegex);
    if (!match) return;

    const email = match[1].toLowerCase();
    const namePart = entry.replace(match[0], '').replace(/[<>",]/g, '').trim();
    const displayName = namePart || '';

    results.push({ email, displayName });
  });

  return results;
}

class TaskPollFakeService {
  constructor() {
    const nextWeek = getNextWeekRange();

    this._poll = {
      id: 'poll-demo-1',
      taskId: 42,
      title: 'Terminfindung Projekt-Review',
      description: 'Bitte tragt hier eure **Verfügbarkeiten** für das nächste Review ein.\n\n- Grün = kann\n- Gelb = bedingt\n- Rot = kann nicht',
      startDate: nextWeek.startDate,
      endDate: nextWeek.endDate,
      dayStartTime: '08:00',
      dayEndTime: '18:00',
      slotMinutes: 30,
      includedDates: createDefaultIncludedDates(nextWeek.startDate, nextWeek.endDate)
    };

    this._ownerResponse = createEmptyResponse('owner');
    this._participants = this._buildDemoParticipants();
  }

  _buildDemoParticipants() {
    const demoParticipants = [
      DEFAULT_INTERNAL_MEMBERS[1],
      DEFAULT_INTERNAL_MEMBERS[2],
      DEFAULT_EXTERNAL_PARTICIPANTS[0],
      DEFAULT_EXTERNAL_PARTICIPANTS[1],
      DEFAULT_EXTERNAL_PARTICIPANTS[2]
    ].map((participant) => ({ ...participant }));

    const slots = createSlotsForPoll(this._poll);

    return demoParticipants.map((participant, index) => {
      const random = mulberry32((index + 1) * 12345);
      const response = createEmptyResponse(participant.id);
      slots.forEach((slot) => {
        response.slots[slot.key] = randomStatus(random);
      });
      return { ...participant, response };
    });
  }

  _regenerateParticipantResponses() {
    const slots = createSlotsForPoll(this._poll);

    this._participants = this._participants.map((participant, index) => {
      const random = mulberry32((index + 1) * 12345 + slots.length * 97);
      const response = createEmptyResponse(participant.id);

      slots.forEach((slot) => {
        response.slots[slot.key] = randomStatus(random);
      });

      return {
        ...participant,
        response
      };
    });
  }

  _normalizeOwnerResponseToCurrentSlots() {
    const slots = createSlotsForPoll(this._poll);
    const previousSlots = this._ownerResponse?.slots || {};
    const nextResponse = createEmptyResponse('owner');

    slots.forEach((slot) => {
      nextResponse.slots[slot.key] = previousSlots[slot.key] || STATUS.UNAVAILABLE;
    });

    this._ownerResponse = nextResponse;
  }

  getAvailableInternalMembers() {
    return clone(DEFAULT_INTERNAL_MEMBERS);
  }

  getPoll() {
    return clone(this._poll);
  }

  updatePoll(nextPoll) {
    const previousPoll = clone(this._poll);

    const allDates = getDateRange(nextPoll.startDate, nextPoll.endDate);
    const includedDates = Array.isArray(nextPoll.includedDates) && nextPoll.includedDates.length > 0
        ? nextPoll.includedDates.filter((date) => allDates.includes(date))
        : createDefaultIncludedDates(nextPoll.startDate, nextPoll.endDate);

    this._poll = {
      ...this._poll,
      ...clone(nextPoll),
      includedDates
    };

    const slotRelevantChange =
        previousPoll.startDate !== this._poll.startDate ||
        previousPoll.endDate !== this._poll.endDate ||
        previousPoll.dayStartTime !== this._poll.dayStartTime ||
        previousPoll.dayEndTime !== this._poll.dayEndTime ||
        previousPoll.slotMinutes !== this._poll.slotMinutes ||
        JSON.stringify(previousPoll.includedDates || []) !== JSON.stringify(this._poll.includedDates || []);

    if (slotRelevantChange) {
      this._regenerateParticipantResponses();
      this._normalizeOwnerResponseToCurrentSlots();
    }

    return this.getPoll();
  }

  getSlots() {
    return createSlotsForPoll(this._poll);
  }

  getOwnerResponse() {
    return clone(this._ownerResponse);
  }

  updateOwnerResponse(nextResponse) {
    this._ownerResponse = clone(nextResponse);
    return this.getOwnerResponse();
  }

  getParticipants() {
    return clone(this._participants);
  }

  replaceParticipants(nextParticipants) {
    const merged = nextParticipants.map((participant) => {
      const existing = this._participants.find((current) => current.id === participant.id);
      return {
        ...participant,
        response: existing?.response || createEmptyResponse(participant.id)
      };
    });

    this._participants = clone(merged);
    return this.getParticipants();
  }

  importExternalParticipants(rawText) {
    const parsed = normalizeExternalEntries(rawText);
    const existingEmails = new Set(this._participants.map((participant) => participant.email?.toLowerCase()).filter(Boolean));

    const created = [];
    parsed.forEach((entry) => {
      if (existingEmails.has(entry.email)) return;
      const id = `ext-${Math.random().toString(36).slice(2, 10)}`;
      created.push({
        id,
        type: 'external',
        displayName: entry.displayName || entry.email,
        email: entry.email
      });
      existingEmails.add(entry.email);
    });

    this.replaceParticipants([...this._participants, ...created]);
    return created;
  }

  addInternalParticipants(internalParticipants) {
    const existingIds = new Set(this._participants.map((participant) => participant.id));
    const additions = internalParticipants.filter((participant) => !existingIds.has(participant.id));
    this.replaceParticipants([...this._participants, ...additions]);
    return additions;
  }

  removeParticipant(participantId) {
    this.replaceParticipants(this._participants.filter((participant) => participant.id !== participantId));
  }

  getHeatmap() {
    return buildHeatmap(this._poll, this._ownerResponse, this._participants);
  }
}

const service = new TaskPollFakeService();
service.STATUS = STATUS;

export default service;
