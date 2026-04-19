<template>
  <div class="availability-grid-wrapper">
    <div class="availability-header mb-3">
      <div class="fw-semibold">Eigene Verfügbarkeit</div>

      <div class="availability-header-content">
        <div class="mode-switcher-wrapper">
          <div class="mode-switcher btn-group" role="group" aria-label="Auswahlmodus">
            <button
                v-for="option in modeOptions"
                :key="option.value"
                type="button"
                class="btn"
                :class="selectedMode === option.value ? option.activeClass : 'btn-outline-secondary'"
                @click="$emit('update:selectedMode', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="availability-help small text-muted">
          Wähle links den Modus und klicke oder ziehe über die Zeitfelder.<br>
          Mit Strg/Cmd kannst du einzelne Felder gezielt umschalten.
        </div>
      </div>
    </div>

    <div class="grid-scroll border rounded bg-white">
      <div class="grid-inner" :style="gridTemplateStyle">
        <div class="grid-corner sticky-corner"></div>

        <div
          v-for="day in days"
          :key="`header-${day}`"
          class="day-header sticky-top-header"
        >
          <div class="day-name">{{ formatWeekday(day) }}</div>
          <div class="day-date">{{ formatDateShort(day) }}</div>
        </div>

        <template v-for="time in times" :key="`row-${time}`">
          <div class="time-label sticky-left" :class="{ 'is-full-hour': isFullHour(time) }">
            {{ time }}
          </div>

          <button
            v-for="day in days"
            :key="`${day}-${time}`"
            type="button"
            class="grid-cell"
            :class="[
              statusClass(statusFor(day, time)),
              { 'is-full-hour': isFullHour(time) }
            ]"
            @mousedown.prevent="beginPaint(day, time, $event)"
            @mouseenter="continuePaint(day, time)"
            @mouseup.prevent="stopPaint"
            @click.prevent="handleCellClick(day, time, $event)"
          >
            <span class="visually-hidden">{{ day }} {{ time }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import TaskPollFakeService from '@/services/task-poll.fake.service.js';
import { formatDateShort, formatWeekday, fromMinutes, toMinutes } from '@/utils/task-poll.utils.js';

export default {
  name: 'TaskPollAvailabilityGrid',
  props: {
    poll: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Object,
      required: true
    },
    selectedMode: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue', 'update:selectedMode'],
  data() {
    return {
      isPainting: false,
      lastPaintedKey: null,
      modeOptions: [
        { value: TaskPollFakeService.STATUS.AVAILABLE, label: 'Kann', activeClass: 'btn-success' },
        { value: TaskPollFakeService.STATUS.IF_NEEDED, label: 'Bedingt', activeClass: 'btn-warning' },
        { value: TaskPollFakeService.STATUS.UNAVAILABLE, label: 'Kann nicht', activeClass: 'btn-danger' }
      ]
    };
  },
  computed: {
    days() {
      return [...(this.poll.includedDates || [])];
    },
    times() {
      if (!this.poll?.dayStartTime || !this.poll?.dayEndTime || !this.poll?.slotMinutes) {
        return [];
      }

      const start = this.toMinutes(this.poll.dayStartTime);
      const end = this.toMinutes(this.poll.dayEndTime);
      const result = [];

      for (let current = start; current < end; current += this.poll.slotMinutes) {
        result.push(this.fromMinutes(current));
      }

      return result;
    },
    gridTemplateStyle() {
      return {
        gridTemplateColumns: `5.25rem repeat(${this.days.length}, minmax(4.8rem, 5.6rem))`
      };
    }
  },
  mounted() {
    window.addEventListener('mouseup', this.stopPaint);
  },
  beforeUnmount() {
    window.removeEventListener('mouseup', this.stopPaint);
  },
  methods: {
    toMinutes,
    fromMinutes,
    formatWeekday,
    formatDateShort,
    isFullHour(time) {
      return time.endsWith(':00');
    },
    slotKey(day, time) {
      return `${day}T${time}`;
    },
    statusFor(day, time) {
      return this.modelValue?.slots?.[this.slotKey(day, time)] || TaskPollFakeService.STATUS.UNAVAILABLE;
    },
    statusClass(status) {
      switch (status) {
        case TaskPollFakeService.STATUS.AVAILABLE:
          return 'status-available';
        case TaskPollFakeService.STATUS.IF_NEEDED:
          return 'status-if-needed';
        default:
          return 'status-unavailable';
      }
    },
    setSlot(day, time, nextStatus) {
      const next = JSON.parse(JSON.stringify(this.modelValue || { participantId: 'owner', slots: {} }));
      next.slots[this.slotKey(day, time)] = nextStatus;
      this.$emit('update:modelValue', next);
    },
    nextStatus(currentStatus) {
      if (currentStatus === TaskPollFakeService.STATUS.UNAVAILABLE) return TaskPollFakeService.STATUS.AVAILABLE;
      if (currentStatus === TaskPollFakeService.STATUS.AVAILABLE) return TaskPollFakeService.STATUS.IF_NEEDED;
      return TaskPollFakeService.STATUS.UNAVAILABLE;
    },
    beginPaint(day, time, event) {
      this.isPainting = true;
      this.lastPaintedKey = null;
      if (event.ctrlKey || event.metaKey) {
        const current = this.statusFor(day, time);
        this.setSlot(day, time, this.nextStatus(current));
      } else {
        this.paintSlot(day, time);
      }
    },
    continuePaint(day, time) {
      if (!this.isPainting) return;
      this.paintSlot(day, time);
    },
    stopPaint() {
      this.isPainting = false;
      this.lastPaintedKey = null;
    },
    handleCellClick(day, time, event) {
      if (event.ctrlKey || event.metaKey) {
        const current = this.statusFor(day, time);
        this.setSlot(day, time, this.nextStatus(current));
        return;
      }
      if (!this.isPainting) {
        this.paintSlot(day, time);
      }
    },
    paintSlot(day, time) {
      const key = this.slotKey(day, time);
      if (this.lastPaintedKey === key) return;
      this.lastPaintedKey = key;
      this.setSlot(day, time, this.selectedMode);
    }
  }
};
</script>

<style scoped>
.availability-header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.availability-header-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.mode-switcher-wrapper {
  margin-top: 0.2rem;
}

.mode-switcher .btn {
  min-width: 6.2rem;
  font-weight: 600;
  font-size: 0.92rem;
  padding: 0.35rem 0.7rem;
}

.availability-help {
  max-width: 40rem;
  line-height: 1.35;
  padding-top: 0.25rem;
}

.grid-scroll {
  overflow: auto;
  max-width: 100%;
  width: 100%;
}

.grid-inner {
  display: grid;
  width: max-content;
  min-width: 100%;
}

.grid-corner,
.day-header,
.time-label,
.grid-cell {
  border-right: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
}

.day-header:first-of-type,
.time-label,
.grid-cell {
  border-left: 1px solid #dee2e6;
}

.grid-corner,
.day-header {
  background: #f8f9fa;
}

.grid-corner {
  min-height: 3.3rem;
  border-bottom-width: 2px;
}

.day-header {
  min-height: 3.3rem;
  padding: 0.35rem 0.25rem;
  text-align: center;
  border-bottom-width: 2px;
}

.day-name {
  font-weight: 700;
  font-size: 0.85rem;
}

.day-date {
  font-size: 0.78rem;
  color: #6c757d;
}

.time-label {
  background: #fff;
  padding: 0.25rem 0.4rem;
  font-size: 0.75rem;
  color: #495057;
  min-height: 1.6rem;
  display: flex;
  align-items: center;
}

.time-label.is-full-hour {
  font-weight: 700;
  background: #f8f9fa;
  border-top: 1px solid #adb5bd;
}

.grid-cell {
  width: 100%;
  min-height: 1.6rem;
  padding: 0;
  border-left: 0;
  border-top: 0;
  background: #fff;
}

.grid-cell.is-full-hour {
  border-top: 1px solid #adb5bd;
}

.status-available {
  background: #198754;
  opacity: 0.8;
}

.status-if-needed {
  background: #ffc107;
  opacity: 0.8;
}

.status-unavailable {
  background: #f8d7da;
}

.sticky-corner,
.sticky-top-header {
  position: sticky;
  top: 0;
  z-index: 2;
}

.sticky-left {
  position: sticky;
  left: 0;
  z-index: 1;
}

.sticky-corner {
  left: 0;
  z-index: 3;
}
</style>
