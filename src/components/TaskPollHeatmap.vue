<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h5 class="card-title mb-1">Heatmap-Vorschau</h5>
          <div class="small text-muted">Mit Demo-Daten für 5 Teilnehmende und deinen eigenen Eingaben.</div>
        </div>

        <div class="d-flex flex-wrap gap-3 small heatmap-legend">
          <div><span class="legend-box heat-good"></span> sehr gut</div>
          <div><span class="legend-box heat-medium"></span> brauchbar</div>
          <div><span class="legend-box heat-low"></span> eher ungünstig</div>
          <div><span class="legend-box heat-bad"></span> schlecht</div>
        </div>
      </div>

      <div class="heatmap-scroll border rounded bg-white">
        <div class="heatmap-inner" :style="gridTemplateStyle">
          <div class="heatmap-corner sticky-corner"></div>

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
                class="heat-cell"
                :class="[
                  heatClass(lookup(day, time)),
                  {
                    'is-full-hour': isFullHour(time),
                    'is-selectable': selectable,
                    'is-selected': isSelectedSlot(lookup(day, time))
                  }
                ]"
                :title="tooltipText(lookup(day, time))"
                @click="handleSlotClick(lookup(day, time))"
            >
              <span class="heat-cell-count">{{ lookup(day, time)?.score ?? 0 }}</span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDateShort, formatWeekday, fromMinutes, toMinutes } from '@/utils/task-poll.utils.js';

export default {
  name: 'TaskPollHeatmap',
  props: {
    poll: {
      type: Object,
      required: true
    },
    heatmap: {
      type: Array,
      default: () => []
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selectedSlotStartAt: {
      type: String,
      default: null
    }
  },
  emits: ['select-slot'],
  computed: {
    days() {
      return [...(this.poll.includedDates || [])];
    },
    times() {
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
    },
    heatmapByKey() {
      return new Map((this.heatmap || []).map((entry) => [entry.key, entry]));
    },
    maxScore() {
      return Math.max(...(this.heatmap || []).map((entry) => entry.score), 1);
    }
  },
  methods: {
    toMinutes,
    fromMinutes,
    formatWeekday,
    formatDateShort,
    isFullHour(time) {
      return time.endsWith(':00');
    },
    lookup(day, time) {
      return this.heatmapByKey.get(`${day}T${time}`) || null;
    },
    heatClass(slot) {
      if (!slot) return 'heat-bad';
      const ratio = slot.score / this.maxScore;
      if (ratio >= 0.75) return 'heat-good';
      if (ratio >= 0.5) return 'heat-medium';
      if (ratio >= 0.25) return 'heat-low';
      return 'heat-bad';
    },
    tooltipText(slot) {
      if (!slot) return 'Keine Daten';
      const lines = [
        `${this.formatWeekday(slot.date)} ${this.formatDateShort(slot.date)} ${slot.time}–${slot.endTime}`,
        `Sicher: ${slot.availableNames.join(', ') || 'niemand'}`,
        `Bedingt: ${slot.ifNeededNames.join(', ') || 'niemand'}`,
        `Nicht: ${slot.unavailableNames.join(', ') || 'niemand'}`
      ];
      return lines.join('\n');
    },
    isSelectedSlot(slot) {
      return !!slot && !!this.selectedSlotStartAt && slot.slotStartAt === this.selectedSlotStartAt;
    },
    handleSlotClick(slot) {
      if (!this.selectable || !slot) {
        return;
      }
      this.$emit('select-slot', slot);
    }
  }
};
</script>

<style scoped>
.heatmap-scroll {
  overflow: auto;
  max-width: 100%;
}

.heatmap-inner {
  display: grid;
  width: max-content;
  min-width: 100%;
}

.heatmap-corner,
.day-header,
.time-label,
.heat-cell {
  min-height: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 0;
  border-top: 0;
  width: 100%;
  padding: 0;
}

.heat-cell.is-selectable {
  cursor: pointer;
}

.heat-cell.is-selected {
  outline: 3px solid #0d6efd;
  outline-offset: -3px;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.75);
}

.heat-cell.is-selectable:hover {
  filter: brightness(0.95);
}

.heat-cell.is-selectable:focus-visible {
  outline: 3px solid #0d6efd;
  outline-offset: -3px;
}

.heatmap-corner,
.day-header {
  background: #f8f9fa;
}

.heatmap-corner {
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

.heat-cell {
  min-height: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heat-cell.is-full-hour {
  border-top: 1px solid #adb5bd;
}

.heat-cell-count {
  font-size: 0.72rem;
  font-weight: 700;
}

.heat-good {
  background: #198754;
  color: #fff;
}

.heat-medium {
  background: #ffc107;
  color: #212529;
}

.heat-low {
  background: #f8d7da;
  color: #842029;
}

.heat-bad {
  background: #dc3545;
  color: #fff;
}

.legend-box {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  margin-right: 0.35rem;
  vertical-align: text-bottom;
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
