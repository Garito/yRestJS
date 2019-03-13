<template>
  <div class="field">
    <div class="field" v-if="!readonly && editing">
      <OAInput :name="name" :schema="schema" :value="value" :errors="errors" :focus="true"
        @input="$emit('input', $event)" @change="$emit('change', value)">
        <font-awesome-icon class="has-text-grey-light" :icon="['far', 'calendar-alt']" slot="leftIcon"></font-awesome-icon>
      </OAInput>
    </div>
    <template v-else>
      <div class="media" @click="editing = true">
        <div class="media-left">
          <span class="image"><font-awesome-icon :icon="[ 'far', 'calendar-alt']"></font-awesome-icon></span>
        </div>
        <div class="media-content">
          <div :class="{ 'is-size-7': value }">{{ schema['x-yrest-label'] || schema['x-yrest-sr_only'] }}</div>
          <div :class="{ outOfDayClass: outOfDay }" v-if="value">{{ formattedDate }}</div>
        </div>
      </div>
      <div :class="hintClasses" v-if="schema['x-yrest-hint']">{{ $t(schema['x-yrest-hint']) || schema['x-yrest-hint'] }}</div>
      <div class="help errors is-danger" v-if="errors">
        <ul>
          <li v-for="(error, index) in errors" :key="'Error_' + index">{{ error }}</li>
        </ul>
      </div>
    </template>
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
    readonly: { type: Boolean, default: false },
    outOfDayClass: { type: String, default: '' }
  },
  data: () => ({ editing: false }),
  computed: {
    value2Date () { return new Date(this.value) },
    formattedDate () { return this.value2Date.toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    outOfDay () { return new Date() > this.value2Date },
    hintClasses () {
      let result = ['help']
      if (this.schema['x-yrest-extra_hint_classes']) {
        let classes = this.schema['x-yrest-extra_hint_classes']
        if (typeof classes === 'string') {
          classes = classes.split()
        }
        result = result.concat(classes)
      }
      return result
    }
  },
  watch: {
    value (newVal) {
      this.editing = false
    }
  }
}
</script>
