<template>
  <div class="field" :class="fieldClasses">
    <label class="label" :class="labelClasses" :for="name">
      {{ $t(schema['x-yrest-sr_only'] || schema['x-yrest-label'] || name ) || schema['x-yrest-sr_only'] || schema['x-yrest-label'] || name }}
    </label>
    <div class="control" :class="controlClasses">
      <Multiselect :value="value" :options="options" :label="withLabel ? 'label' : null" :track-by="withLabel ? 'choice' : null"
        :multiple="multiple" @input="value => $emit('input', value)">

      </Multiselect>
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
const Multiselect = () => import('vue-multiselect')

export default {
  name: 'OASelect',
  components: { Multiselect },
  props: {
    name: { type: String, required: true },
    schema: { type: Object, default: () => ({}) },
    value: { type: [String, Array], default: '' },
    required: { type: Boolean, default: false },
    errors: { type: Array, default: null },
    focus: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false }
  },
  computed: {
    multiple () { return this.schema.enum !== undefined },
    withLabel () { return typeof this.options[0] === "object" && this.options[0] !== null },
    options () {
      let options = this.schema.oneOf || this.schema.enum
      if (Array.isArray(options[0])) {
        let result = []
        for (var [choice, label] of options) {
          result.push({ choice: choice, label: label })
        }
        return result
      } else {
        return options
      }
    },
    fieldClasses () { return this.schema['x-yrest-extra_field_classes'] },
    labelClasses () {
      let result = []
      if (this.schema['x-yrest-sr_only']) {
        result.push('sr-only')
      }
      if (this.schema['x-yrest-size']) {
        result.push(this.schema['x-yrest-size'])
      }
      if (this.schema['x-yrest-extra_label_classes']) {
        let classes = this.schema['x-yrest-extra_label_classes']
        if (typeof classes === 'string') {
          classes = classes.split()
        }
        result = result.concat(classes)
      }
      return result
    },
    controlClasses () {
      let result = []
      if (this.schema['x-yrest-extra_control_classes']) {
        let classes = this.schema['x-yrest-extra_control_classes']
        if (typeof classes === 'string') {
          classes = classes.split()
        }
        result = result.concat(classes)
      }
      return result
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
