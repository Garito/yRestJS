<template>
  <div :id="name" class="field" :class="fieldClasses">
    <label class="label" :class="labelClasses" :for="name" v-t="schema['x-yrest-label'] || name " />
    <div class="field" :class="{ 'has-addons': hasControls }">
      <div class="control" v-if="hasLeftControl">
        <slot name="leftControl" :data="$data"></slot>
      </div>

      <div class="control" :class="controlClasses">
        <input class="input" :class="inputClasses" :id="name" :value="value"
          :required="required" :type="type" :maxlength="schema['x-yrest-maxlength'] || null"
          :minlength="schema['x-yrest-minlength'] || null" :readonly="readonly"
          :placeholder="$t(schema['x-yrest-placeholder']) || schema['x-yrest-placeholder'] || null" v-focus="focus"
          @input="validate($event)" @change="$emit('change', value)" @keyup="$emit('keyup', $event)"
          @keydown="$emit('keydown', $event)" />

        <span class="icon is-small is-left" v-if="$slots.leftIcon"><slot name="leftIcon"></slot></span>
        <span class="icon is-small is-right" v-if="$slots.rightIcon"><slot name="rightIcon"></slot></span>
      </div>

      <div class="control" v-if="hasRightControl">
        <slot name="rightControl" :data="$data"></slot>
      </div>
    </div>

    <div :class="hintClasses" v-if="schema['x-yrest-hint']">{{ $t(schema['x-yrest-hint']) || schema['x-yrest-hint'] }}</div>
    <div class="help errors is-danger" v-if="errors">
      <ul>
        <li v-for="(error, index) in errors" :key="'Error_' + index">{{ error }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OAInput',
  props: {
    name: { type: String, required: true },
    schema: { type: Object, default: () => ({}) },
    value: { type: [ String, Number, Date, Object ], default: '' },
    required: { type: Boolean, default: false },
    errors: { type: Array, default: null },
    focus: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false }
  },
  data: () => ({ toggled: false }),
  computed: {
    type () {
      let result = this.schema['x-yrest-input_type'] || this.schema.format || this.schema.type || 'text'

      if (result === 'password' && this.toggled) {
        result = 'text'
      } else if (result === 'integer' || result === 'int' || result === 'double') {
        result = 'number'
      } else if (result === 'string') {
        result = 'text'
      } else if (result === 'date-time') {
        result = 'datetime-local'
      }

      return result
    },
    fieldClasses () { return this.schema['x-yrest-extra_field_classes'] },
    labelClasses () {
      let result = []
      if (this.schema['x-yrest-sr_only']) { result.push('is-sr-only') }
      if (this.schema['x-yrest-size']) { result.push(this.schema['x-yrest-size']) }
      if (this.schema['x-yrest-extra_label_classes']) {
        let classes = this.schema['x-yrest-extra_label_classes']
        if (typeof classes === 'string') { classes = classes.split() }
        result = result.concat(classes)
      }

      return result
    },
    controlClasses () {
      let result = []
      if (this.$slots.leftIcon) { result.push('has-icons-left') }
      if (this.$slots.rightIcon) { result.push('has-icons-right') }
      if (this.hasControls) { result.push('is-expanded') }
      if (this.schema['x-yrest-extra_control_classes']) {
        let classes = this.schema['x-yrest-extra_control_classes']
        if (typeof classes === 'string') { classes = classes.split() }
        result = result.concat(classes)
      }
      return result
    },
    inputClasses () {
      let result = []
      if (this.errors) { result.push('is-danger') }
      if (this.schema['x-yrest-size']) { result.push(this.schema['x-yrest-size']) }
      if (this.schema['x-yrest-extra_input_classes']) {
        let classes = this.schema['x-yrest-extra_input_classes']
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
    },
    hasLeftControl () { return this.$slots.leftControl || this.$scopedSlots.leftControl },
    hasRightControl () { return this.$slots.rightControl || this.$scopedSlots.rightControl },
    hasControls () { return this.hasLeftControl || this.hasRightControl }
  },
  methods: {
    validate (e) {
      if (this.schema['x-yrest-pattern'] && !new RegExp(this.schema['x-yrest-pattern']).test(e.target.value)) {
        e.target.value = e.target.value.substring(0, e.target.value.length - 1)
      }
      this.$emit('input', e.target.value)
    }
  }
}
</script>
