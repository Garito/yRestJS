<template>
  <form @submit.prevent="submit">
    <div class="notification is-danger" v-if="errors">
      <p>{{ $t('App.forms.errors') || 'Please correct this errors:' }}</p>
      <ul>
        <li v-for="(error, index) in (errors._messages || [])" :key="'error' + index">{{ error }}</li>
      </ul>
    </div>
    <template v-if="schema">
      <!-- Use this slot to add content before the form's fields -->
      <slot name="formTop"></slot>

      <template v-for="(field, index) in Object.entries(fields)">
        <!-- Use this slot to add content before the field -->
        <slot :name="'before_' + field[0]"></slot>
        <!-- Use this slot to override the field completely -->
        <slot :name="field[0]" :form="form" :schema="schema">
          <OAField :name="fName(name, field[0])" :schema="field[1]" v-model="form[field[0]]" :key="fName(name, field[0])"
            :errors="((errors || {})[field[0]]) ? errors[field[0]] : null" :focus="index === 0" :readonly="readonly"
            @change="(value) => change(name, value)">
          </OAField>
        </slot>
        <!-- Use this slot to add content after the field -->
        <slot :name="'after_' + field[0]"></slot>
      </template>

      <!-- Use this slot to add content between the form's fields and the controls -->
      <slot name="formBottom"></slot>

      <!-- Use this slot to override the controls completely -->
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
import OAField from './OAField'

export default {
  name: 'OAForm',
  components: { OAField },
  props: {
    /**
     * Name defines the name of the form (and prefixes the name of the fields to avoid collisions)
     */
    name: { type: String, required: true },
    /**
     * Schema is used to define the form (compatible with OpenApi with annotations x-yrest)
     */
    schema: { type: Object, required: true },
    /**
     * Value is the object with the values for edition
     * @default empty object
     */
    value: { type: Object, default: () => ({}) },
    /**
     * Action is the text of the submit button
     * @default empty string
     */
    action: { type: String, default: '' },
    /**
     * Errors is an object that contains errors for specifics fiels (that will show on them)
     * and the keys not corresponding with any field will be represented in a notification
     */
    errors: Object,
    controls: { type: Boolean, default: true },
    readonly: { type: Boolean, default: false }
  },
  data: () => ({
    /**
     * Form will be auto populated with values for every field (the computed property fields takes care of it)
     */
    form: {}
  }),
  computed: {
    /**
     * Fiels returns an object with every renderable field's schema
     * If x-yrest-form is defined will restrict the list of the fields to those declared there instead of all fields
     * At the same time, it populates this.form with the fields values in the property value or initialized depending
     * of the type
     */
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
    /**
     * required returns the list on required fields or an empty array
     */
    required () {
      return this.schema.required || []
    }
  },
  methods: {
    /**
     * This method is used to build the name of the field as a convination of the name of the form and the name of the field
     *
     * This allows to protect the names from other forms with same field name
     * @param {string} action the name of the form
     * @param {string} name the name of the field
     * @returns {string} a normalized name with both values convined
     * Community/auth will be converted to Community_auth
     */
    fName (action, name) {
      return action.replace('/', '_') + '_' + name
    },
    /**
     * This method will inform the parent at every change in any field
     */
    input () {
      /**
       * Sends the whole form on every change (provides real time modifications)
       */
      this.$emit('input', this.form)
    },
    change (name, value) {
      this.$emit('change', { name: name, value: value })
    },
    /**
     * This method will inform the parent that the form has been submit by the user
     */
    submit () {
      /**
       * Sends the name and the content of the form as a submit event
       */
      this.$emit('submit', { name: this.name, form: this.form })
    }
  },
  watch: {
    form: {
      handler: function () { this.input() },
      deep: true
    }
  }
}
</script>
