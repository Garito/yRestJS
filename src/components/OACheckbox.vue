<template>
  <div class="field" :class="fieldClasses">
    <label :class="labelClasses">
      <slot name="widget" :checked="checked" :schema="schema"></slot>
      <input type="checkbox" v-model="checked" :required="required" @click="click" @change="$emit('input', checked)" v-show="!$scopedSlots.widget" />
      {{ $t(schema['x-yrest-label'] || name ) }}
    </label>
    <div :class="hintClasses" v-if="schema['x-yrest-hint']">{{ $t(schema['x-yrest-hint']) }}</div>
    <div class="help errors is-danger" v-if="errors">
      <ul>
        <li v-for="(error, index) in errors" :key="'Error_' + index">{{ error }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OACheckbox',
  props: {
    name: { type: String, required: true },
    schema: { type: Object, default: () => ({}) },
    value: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    errors: { type: Array, default: null },
    focus: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false }
  },
  data: () => ({ checked: false }),
  computed: {
    fieldClasses () { return this.schema['x-yrest-extra_field_classes'] },
    labelClasses () {
      let result = ['checkbox']
      if (this.readonly) { result.push('is-readonly') }
      if (this.schema['x-yrest-size']) { result.push(this.schema['x-yrest-size']) }
      if (this.schema['x-yrest-extra_label_classes']) {
        let classes = this.schema['x-yrest-extra_label_classes']
        if (typeof classes === 'string') { classes = classes.split() }
        result = result.concat(classes)
      }
      return result
    },
    hintClasses () {
      let result = ['help']
      if (this.schema['x-yrest-extra_hint_classes']) {
        let classes = this.schema['x-yrest-extra_hint_classes']
        if (typeof classes === 'string') { classes = classes.split() }
        result = result.concat(classes)
      }
      return result
    }
  },
  methods: {
    click (e) {
      if (this.readonly) { e.preventDefault() }
      else { this.$emit('change', e.target.checked) }
    }
  },
  created () { this.checked = this.value }
}
</script>

<style>
.checkbox.is-readonly {
  cursor: default;
}
</style>
