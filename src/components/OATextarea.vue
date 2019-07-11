<template>
  <div class="field" :class="fieldClasses" :aria-label="schema['x-yrest-sr_only']">
    <label class="label" :class="labelClasses" :for="name">{{ label }}</label>
    <div class="control" :class="controlClasses">
      <textarea class="textarea" :class="textareaClasses" :id="name" :required="required" :value="value" :placeholder="placeholder" :rows="schema['x-yrest-rows']" :cols="schema['x-yrest-cols']" :maxlength="schema['x-yrest-maxlength']" :readonly="readonly" :minlength="schema['x-yrest-minlength']" @input="validate($event)" @change="$emit('change', value)" v-focus="focus">
      </textarea>
    </div>

    <div class="help" v-if="schema['x-yrest-hint']">{{ hint }}</div>
    <div class="help errors is-danger" v-if="errors">
      <ul>
        <li v-for="(err, index) in errors" :key="'Error_' + index">{{ error(err) }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OATextArea',
  props: {
    name: String,
    schema: { type: Object, default: () => ({}) },
    value: { type: String, default: '' },
    required: { type: Boolean, default: false },
    errors: { type: Array, default: null },
    focus: { type: Boolean, default: false },
    notranslation: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false }
  },
  computed: {
    label () {
      let text = this.schema['x-yrest-label'] || this.name
      return (this.notranslation || typeof this.$t === 'undefined') ? text : this.$t(text)
    },
    placeholder () {
      if (this.schema['x-yrest-placeholder']) {
        return (this.notranslation || typeof this.$t === 'undefined') ? this.schema['x-yrest-placeholder'] : this.$t(this.schema['x-yrest-placeholder'])
      } else { return null }
    },
    hint () {
      return (this.notranslation || typeof this.$t === 'undefined') ? this.schema['x-yrest-hint'] : this.$t(this.schema['x-yrest-hint'])
    },
    error (err) {
      return (this.notranslation || typeof this.$t === 'undefined') ? err : this.$t(err)
    },
    fieldClasses () { return this.schema['x-yrest-extra_field_classes'] },
    labelClasses () {
      let result = []
      if (this.schema['x-yrest-sr_only']) { result.push('sr-only') }
      if (this.schema['x-yrest-size']) { result.push(this.schema['x-yrest-size']) }
      if (this.schema['x-yrest-extra_label_classes']) {
        let classes = this.schema['x-yrest-extra_lable_classes']
        if (typeof classes === 'string') { classes = classes.split() }
        result = result.concat(classes)
      }
      return result
    },
    controlClasses () { return this.schema['x-yrest-extra_control_classes'] },
    textareaClasses () {
      let result = []
      if (this.errors) { result.push('is-danger') }
      if (this.schema['x-yrest-size']) { result.push(this.schema['x-yrest-size']) }
      if (this.schema['x-yrest-extra_textarea_classes']) {
        let classes = this.schema['x-yrest-extra_textarea_classes']
        if (typeof classes === 'string') { classes = classes.split() }
        result = result.concat(classes)
      }
      return result
    }
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
