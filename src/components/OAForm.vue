<template>
  <form :name="name" @submit.prevent="submit">
    <div class="notification is-danger" v-if="errors" ref="errors">
      <p>{{ $t('App.forms.errors') || 'Please correct this errors:' }}</p>
      <p v-if="typeof errors === 'string'">{{ errors }}</p>
      <p v-else-if="errors.message">{{ errors.message }}</p>
    </div>
    <slot name="layout"></slot>
    <template v-if="schema">
      <slot name="formTop"></slot>

      <template v-for="[fieldName, field] in Object.entries(fields)">
        <slot :name="'before_' + fieldName"></slot>

        <slot :name="fieldName" :form="form" :schema="schema">
          <OAField :name="fName(name, fieldName)" :schema="field" v-model="form[fieldName]" :key="fName(name, fieldName)" :errors="errors && errors[fieldName] ? errors[fieldName] : null" :focus="shouldFocus(fieldName)" :readonly="readonly" :required="schema.required.indexOf(fieldName) > -1" @change="value => change(fieldName, value)">
          </OAField>
        </slot>

        <slot :name="'after_' + fieldName"></slot>
      </template>

      <slot name="formBottom"></slot>

      <FormControls name="controls" :action="action" :loading="loading" v-if="!readonly && controls" @ok="submit">
        <slot name="additionalControls"></slot>
      </FormControls>
    </template>
    <template v-else>{{ $t('App.loading') || 'Loading...' }}</template>
  </form>
</template>

<script>
import { spreadForm } from '..'
const OAField = () => import('./OAField')
const FormControls = () => import('./FormControls')

export default {
  name: 'OAForm',
  components: { OAField, FormControls },
  props: {
    name: { type: String, required: true },
    schema: { type: Object, required: true },
    value: { type: Object, default: () => ({}) },
    action: { type: String, default: '' },
    errors: { type: [String, Array, Object] },
    controls: { type: Boolean, default: true },
    readonly: { type: Boolean, default: false },
    spread: { type: Boolean, default: true },
    loading: { type: Boolean, default: false }
  },
  data: () => ({ form: {}, focused: false, spreaded: false }),
  computed: {
    fields () { return this.resetFields() },
    required () { return this.schema.required || [] }
  },
  methods: {
    resetFields () {
      let visibleFields = {}
      if (this.schema) {
        let properties = this.schema.properties
        let fields = this.schema['x-yrest-form'] || Object.keys(properties)
        for (var el of fields) {
          visibleFields[el] = properties[el]
          let value = this.value[el]
          if (!value) {
            if (properties[el].type === 'boolean') { value = false }
            else if (properties[el].type === 'number') { value = (properties[el].format === 'double') ? 0.0 : 0 }
            else if (properties[el].type === 'array') { value = [] }
            else if (properties[el].type === 'object') { value = {} }
            else { value = '' }
          }
          this.$set(this.form, el, value)
        }
      }
      return visibleFields
    },
    fName (action, name) { return action.replace('/', '_') + '_' + name },
    shouldFocus (field) {
      // this fails because of the parentesis expression (focused is true when the form is submited but raises and error)
      if (!this.readonly && !this.focused && (this.errors === null || typeof this.errors !== 'object' || Object.keys(this.errors).indexOf(field) > -1)) {
        this.focused = true
        return true
      }
    },
    input () { this.$emit('input', this.form) },
    change (name, value) { this.$emit('change', { name: name, value: value }) },
    filterValues (values = null, schema = null, clean = true) {
      if (values === null) { values = this.form }
      if (schema === null) { schema = this.schema }
      let actual = {}
      for (var [key, value] of Object.entries(values)) {
        if ((!Array.isArray(value) && value) || value.length) {
          if (clean && schema.properties && Object.keys(schema.properties).indexOf(key) > -1 && typeof schema.properties[key] === 'object' && schema.properties[key] !== null) {
            let keys = Object.keys(schema.properties[key])
            if (schema.properties[key].type === 'string' && keys.indexOf('oneOf') > -1 && value.choice) {
              value = value.choice
            } else if (schema.properties[key].type === 'array' && keys.indexOf('items') > -1 && schema.properties[key].items.type === 'object') {
              let newDetails = []
              for (var detail of value) {
                newDetails.push(this.filterValues(detail, schema.properties[key].items))
              }
              value = newDetails
            }
          }
          actual[key] = value
        }
      }
      return actual
    },
    submit () {
      this.focused = false
      this.$emit('submit', { name: this.name, form: this.filterValues(null, null, this.$parent.$options._componentTag !== 'OAObjectList') })
    }
  },
  async updated () {
    if (this.spread && !this.spreaded) {
      await this.$nextTick()
      this.spreaded = spreadForm(this)
    }
  },
  watch: {
    form: { handler: function () { this.input() }, deep: true }
  }
}
</script>
