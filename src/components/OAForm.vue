<template>
  <form @submit.prevent="submit">
    <div class="notification is-danger" v-if="errors">
      <p>{{ $t('App.forms.errors') || 'Please correct this errors:' }}</p>
      <p v-if="typeof errors === 'string'">{{ errors }}</p>
      <p v-else-if="errors.message">{{ errors.message }}</p>
    </div>
    <template v-if="schema">
      <slot name="formTop"></slot>

      <template v-for="[fieldName, field] in Object.entries(fields)">   
        <slot :name="'before_' + fieldName"></slot>
        
        <slot :name="fieldName" :form="form" :schema="schema">
          <OAField :name="fName(name, fieldName)" :schema="field" v-model="form[fieldName]" :key="fName(name, fieldName)"
            :errors="errors ? errors[fieldName] : null" :focus="shouldFocus(fieldName)" :readonly="readonly"
            :required="schema.required.indexOf(fieldName) > -1" @change="(value) => change(fieldName, value)">
          </OAField>
        </slot>

        <slot :name="'after_' + fieldName"></slot>
      </template>

      <slot name="formBottom"></slot>

      <div class="control columns" slot="controls" v-if="!readonly && controls">
        <div class="column">
          <button class="button is-primary is-fullwidth" type="submit" slot="submitBtn">{{ action }}</button>
        </div>
        <slot name="additionalControls"></slot>
      </div>
    </template>
    <template v-else>{{ $t('App.loading') || 'Loading...' }}</template>
  </form>
</template>

<script>
const OAField = () => import('./OAField')

export default {
  name: 'OAForm',
  components: { OAField },
  props: {
    name: { type: String, required: true },
    schema: { type: Object, required: true },
    value: { type: Object, default: () => ({}) },
    action: { type: String, default: '' },
    errors: { type: [String, Array, Object] },
    controls: { type: Boolean, default: true },
    readonly: { type: Boolean, default: false }
  },
  data: () => ({ form: {}, focused: false }),
  computed: {
    fields () {
      let visibleFields = {}
      if (this.schema) {
        let properties = this.schema.properties
        let fields = this.schema['x-yrest-form'] || Object.keys(properties)
        for (var el of fields) {
          visibleFields[el] = properties[el]
          let value = this.value[el]
          if (!value) {
            if (properties[el].type === 'boolean') {
              value = false
            } else if (properties[el].type === 'integer') {
              value = 0
            } else if (properties[el].type === 'number') {
              value = 0.0
            } else if (properties[el].type === 'array') {
              value = []
            } else if (properties[el].type === 'object') {
              value = {}
            } else {
              value = ''
            }
          }
          this.$set(this.form, el, value)
        }
      }
      return visibleFields
    },
    required () { return this.schema.required || [] }
  },
  methods: {
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
    submit () {
      this.focused = false
      let form = {}
      for (var [key, value] of Object.entries(this.form)) {
        if ((!Array.isArray(value) && value) || value.length) {
          form[key] = value
        }
      }
      this.$emit('submit', { name: this.name, form: form })
    }
  },
  watch: {
    form: {
      handler: function () {
        this.input()
      },
      deep: true
    }
  }
}
</script>
