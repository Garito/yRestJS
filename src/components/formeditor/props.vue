<template>
  <div class="form-editor-props">
    <div class="columns">
      <div class="column">
        <div class="tabs is-centered">
          <ul>
            <li v-for="group in Object.keys(groups)" :key="'tab_' + group" :class="{ 'is-active': tab === group }">
              <a @click="tab = group">{{ group }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="column is-narrow">
        <a @click="$emit('close')">
          <font-awesome-icon :icon="[ 'far', 'times-circle' ]"></font-awesome-icon>
        </a>
      </div>
    </div>
    <div class="props">
      <div v-for="[name, group] in Object.entries(groups)" :key="'group_' + name" v-show="tab === name" :class="name + '_props'">
        <template v-for="prop in Object.values(group)">
          <div class="columns" :key="'container_' + prop" v-show="schema['x-yrest-form'].indexOf(prop) > -1">
            <div class="column"><div :class="formName + '_' + prop"></div></div>
          </div>
        </template>
      </div>
      <div class="columns">
        <div class="column">
          <button class="button is-fullwidth is-danger is-outlined" type="button" @click="$emit('delete')">
            Delete field
          </button>
        </div>
      </div>
    </div>
    <OAForm :name="formName" :schema="schema" :value="values" :controls="false" v-if="schema" @change="change" />
  </div>
</template>

<script>
export default {
  name: 'FormEditorProps',
  props: { name: String, field: Object, required: { type: Boolean, default: false } },
  data: () => ({ tab: 'Basic', formName: 'field_props' }),
  computed: {
    groups () {
      let fieldType = this.field['x-yrest-editor_type'] || this.field.type
      if (fieldType === 'boolean') {
        return {
          Basic: ['name', 'required', 'label', 'hint', 'size'],
          'Extra classes': ['fieldExtraClasses', 'labelExtraClasses', 'hintExtraClasses']
        }
      } else {
        return {
          Basic: ['name', 'required', 'label', 'srOnly', 'placeholder', 'hint'],
          Advanced: ['choices', 'size', 'rows', 'cols', 'maxLength', 'minLength', 'max', 'min', 'pattern'],
          'Extra classes': ['fieldExtraClasses', 'labelExtraClasses', 'controlExtraClasses', 'inputExtraClasses', 'textareaExtraClasses', 'hintExtraClasses']
        }
      }
    },
    schema () {
      let fieldType = this.field['x-yrest-editor_type'] || this.field['x-yrest-input_type'] || this.field.format || this.field.type
      let schema = {
        properties: {
          name: { type: 'string', 'x-yrest-label': 'Name' },
          required: { type: 'boolean', 'x-yrest-label': 'Required' },
          label: { type: 'string', 'x-yrest-label': 'Label' },
          srOnly: { type: 'boolean', 'x-yrest-label': 'Screen reader only' },
          placeholder: { type: 'string', 'x-yrest-label': 'Placeholder' },
          hint: { type: 'string', 'x-yrest-label': 'Hint' },
          choices: { type: 'string', 'x-yrest-label': 'Choices', 'x-yrest-input_type': 'textarea' },
          size: { type: 'string', 'x-yrest-label': 'Size' },
          maxLength: { type: 'number', 'x-yrest-label': 'Max length' },
          minLength: { type: 'number', 'x-yrest-label': 'Min length' },
          max: { type: 'number', 'x-yrest-label': 'Max value' },
          min: { type: 'number', 'x-yrest-label': 'Min value' },
          cols: { type: 'number', 'x-yrest-label': 'Columns' },
          rows: { type: 'number', 'x-yrest-label': 'Rows' },
          pattern: { type: 'string', 'x-yrest-label': 'Pattern' },
          labelExtraClasses: { type: 'string', 'x-yrest-label': 'Label\'s extra classes' },
          fieldExtraClasses: { type: 'string', 'x-yrest-label': 'Field\'s extra classes' },
          controlExtraClasses: { type: 'string', 'x-yrest-label': 'Control\'s extra classes' },
          inputExtraClasses: { type: 'string', 'x-yrest-label': 'Input\'s extra classes' },
          textareaExtraClasses: { type: 'string', 'x-yrest-label': 'Textarea\'s extra classes' },
          hintExtraClasses: { type: 'string', 'x-yrest-label': 'Hint\'s extra classes' }
        },
        required: ['name'],
        type: 'object'
      }

      if (fieldType === 'textarea') {
        schema['x-yrest-form'] = ['name', 'required', 'label', 'srOnly', 'placeholder', 'hint', 'size', 'maxLength', 'minLength', 'cols', 'rows', 'pattern', 'labelExtraClasses', 'fieldExtraClasses', 'controlExtraClasses', 'textareaExtraClasses', 'hintExtraClasses']
      } else if (fieldType === 'boolean') {
        schema['x-yrest-form'] = ['name', 'required', 'label', 'hint', 'size', 'fieldExtraClasses', 'labelExtraClasses', 'hintExtraClasses']
      } else if (['string', 'array'].indexOf(fieldType) > -1) {
        schema['x-yrest-form'] = ['name', 'required', 'label', 'srOnly', 'placeholder', 'hint', 'choices', 'size', 'maxLength', 'minLength', 'pattern', 'labelExtraClasses', 'fieldExtraClasses', 'controlExtraClasses', 'inputExtraClasses', 'hintExtraClasses']
      } else if (['integer', 'number'].indexOf(fieldType) > -1) {
        schema['x-yrest-form'] = ['name', 'required', 'label', 'srOnly', 'placeholder', 'hint', 'size', 'max', 'min', 'pattern', 'labelExtraClasses', 'fieldExtraClasses', 'controlExtraClasses', 'inputExtraClasses', 'hintExtraClasses']
      } else {
        schema['x-yrest-form'] = ['name', 'required', 'label', 'srOnly', 'placeholder', 'hint', 'size', 'maxLength', 'minLength', 'pattern', 'labelExtraClasses', 'fieldExtraClasses', 'controlExtraClasses', 'inputExtraClasses', 'hintExtraClasses']
      }

      return schema
    },
    values () {
      let props = {
        name: this.name,
        label: this.field['x-yrest-label'] || this.name,
        required: this.required,
        srOnly: this.field['x-yrest-sr_only'] || false,
        placeholder: this.field['x-yrest-placeholder'] || '',
        hint: this.field['x-yrest-hint'] || '',
        size: this.field['x-yrest-size'] || '',
        maxLength: this.field['x-yrest-maxlength'] || 0,
        minLength: this.field['x-yrest-minlength'] || 0,
        pattern: this.field['x-yrest-pattern'] || '',
        fieldExtraClasses: this.field['x-yrest-extra_field_classes'] || '',
        labelExtraClasses: this.field['x-yrest-extra_label_classes'] || '',
        controlExtraClasses: this.field['x-yrest-extra_control_classes'] || '',
        hintExtraClasses: this.field['x-yrest-extra_hint_classes'] || ''
      }

      if (this.field['x-yrest-editor_type'] === 'textarea') {
        props.textareaExtraClasses = this.field['x-yrest-extra_textarea_classes'] || ''
        props.rows = this.field['x-yrest-rows'] || 0
        props.cols = this.field['x-yrest-cols'] || 0
      } else {
        props.inputExtraClasses = this.field['x-yrest-extra_input_classes'] || ''
      }

      if (this.field.enum) { props.choices = Array.isArray(this.field.enum) ? this.field.enum.join('\n') : this.field.enum }
      if (this.field.oneOf) {
        props.choices = Array.isArray(this.field.oneOf) ? this.field.oneOf.join('\n') : this.field.oneOf
      }

      return props
    }
  },
  methods: {
    change ({ name, value }) {
      let correspondences = {
        name: 'name', label: 'x-yrest-label', required: 'required', srOnly: 'x-yrest-sr_only', placeholder: 'x-yrest-placeholder', hint: 'x-yrest-hint', size: 'x-yrest-size', maxLength: 'x-yrest-maxlength', minLength: 'x-yrest-minlength', pattern: 'x-yrest-pattern', fieldExtraClasses: 'x-yrest-extra_field_classes', labelExtraClasses: 'x-yrest-extra_label_classes', controlExtraClasses: 'x-yrest-extra_control_classes', hintExtraClasses: 'x-yrest-extra_hint_classes', inputExtraClasses: 'x-yrest-extra_input_classes', textareaExtraClasses: 'x-yrest-extra_textarea_classes', rows: 'x-yrest-rows', cols: 'x-yrest-cols'
      }
      if (correspondences[name]) {
        let data = {}
        data[correspondences[name]] = value
        this.$emit('change', data)
      } else if (name === 'choices') {
        if (this.field.type === 'array') {
          this.$emit('change', { enum: value.split('\n') })
        } else {
          this.$emit('change', { oneOf: value.split('\n') })
        }
      }
    }
  }
}
</script>

// <style lang="scss" scoped>
// @import '@/assets/styles/app.scss';

// .form-editor-props { background-color: darken($background, 10); }
// </style>
