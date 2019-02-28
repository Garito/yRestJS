<template>
  <div class="field">
    <div class="field" v-if="!readonly && editing">
      <OAInput :name="name" :schema="schema" :value="value" :errors="errors" :focus="true"
        @input="$emit('input', $event)" @change="$emit('change', value)">
        <font-awesome-icon class="has-text-grey-light" :icon="['far', 'calendar-alt']" slot="leftIcon"></font-awesome-icon>
      </OAInput>
    </div>
    <div class="media" @click="editing = true" v-else>
      <div class="media-left">
        <span class="image"><font-awesome-icon :icon="[ 'far', 'calendar-alt']"></font-awesome-icon></span>
      </div>
      <div class="media-content">
        <div :class="{ 'is-size-7': value }">{{ schema['x-yrest-label'] || schema['x-yrest-sr_only'] }}</div>
        <div :class="{ 'has-text-danger': outOfDay }" v-if="value">{{ formattedDate }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import OAInput from './OAInput'

export default {
  name: 'OADate',
  components: { OAInput },
  props: {
    name: { type: String, required: true },
    schema: { type: Object, default: () => ({}) },
    value: { type: [ String, Number, Date ], default: '' },
    required: { type: Boolean, default: false },
    errors: { type: Array, default: null },
    focus: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false }
  },
  data: () => ({ editing: false }),
  computed: {
    value2Date () { return new Date(this.value) },
    formattedDate () { return this.value2Date.toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    outOfDay () { return new Date() > this.value2Date }
  },
  watch: {
    value (newVal) {
      this.editing = false
    }
  }
}
</script>
