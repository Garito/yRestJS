<template>
  <div class="form-editor">
    <div class="columns">
      <div class="column">
        <Content class="is-equal-height" :value="schema" :selected="field" @selected="selectField" @updated="updateContent" />
      </div>
      <div class="column" :class="{ 'is-selected': field }">
        <Fields class="is-equal-height" v-show="!field" ref="fields" />
        <Props class="is-equal-height" :name="selectedFieldName" :field="selectedFieldSchema" :required="selectedFieldRequired" v-if="field" @change="editProp" @delete="deleteField" @close="field = null" />
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <OAForm name="Metadata" :schema="formMetadata" :value="metadata" :action="actionText" @submit="({ form }) => $emit('submit', { ...form, schema: schema })" v-show="fields.length">
          <div class="column" slot="additionalControls">
            <button class="button is-fullwidth" type="button" @click="$emit('cancel')">Cancel</button>
          </div>
        </OAForm>
        <button class="button is-fullwidth" type="button" @click="$emit('cancel')" v-show="!fields.length">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { spreadForm } from 'yrestjs/src'

const Content = () => import('./content')
const Props = () => import('./props')
const Fields = () => import('./fields')

export default {
  name: 'FormEditor',
  components: { Content, Props, Fields },
  props: { form: Object, formMetadata: { type: Object, required: true }, actionText: { type: String, default: 'Add form' } },
  data: () => ({ field: null, schema: null, metadata: null, spreaded: false }),
  computed: {
    fields () { return this.schema['x-yrest-form'] || Object.keys(this.schema.properties) },
    selectedFieldName () {
      if (this.field) {
        let parts = this.field.split('.')
        return parts.length > 1 ? parts[1] : parts[0]
      } else {
        return null
      }
    },
    selectedFieldSchema () {
      if (this.field) {
        let parts = this.field.split('.')
        if (parts.length > 1) {
          return this.schema.properties[parts[0]].items.properties[parts[1]]
        } else {
          return this.schema.properties[this.field]
        }
      } else {
        return null
      }
    },
    selectedFieldRequired () {
      if (this.field) {
        let parts = this.field.split('.')
        if (parts.length > 1) {
          return this.schema.properties[parts[0]].items.required.indexOf(parts[1]) > -1
        } else {
          return this.schema.required.indexOf(this.field) > -1
        }
      } else {
        return null
      }
    }
  },
  methods: {
    selectField (field) {
      if (this.field === null) { this.field = field }
    },
    editProp (data) {
      let [name, value] = Object.entries(data)[0]
      if (this.field.indexOf('.') > -1) {
        let [field, subfield] = this.field.split('.')
        this.editSubFieldProp(field, subfield, name, value)
      } else {
        if (name === 'name') {
          let reqIdx = this.schema.required.indexOf(this.field)
          if (reqIdx > -1) {
            this.$set(this.schema.required, reqIdx, value)
          }
          if (this.schema['x-yrest-form']) {
            let formIdx = this.schema['x-yrest-form'].indexOf(this.field)
            this.$set(this.schema['x-yrest-form'], formIdx, value)
          }
          this.$set(this.schema.properties, value, this.schema.properties[this.field])
          this.$delete(this.schema.properties, this.field)
          this.field = value
        } else if (name === 'required') {
          let idx = this.schema.required.indexOf(this.field)
          if (value) {
            if (idx < 0) { this.schema.required.push(this.field) }
          } else {
            if (idx > -1) { this.schema.required.splice(idx, 1) }
          }
        } else {
          this.$set(this.schema.properties[this.field], name, value)
        }
      }
    },
    editSubFieldProp (field, subfield, prop, value) {
      if (prop === 'name') {
        let reqIdx = this.schema.properties[field].items.required.indexOf(subfield)
        if (reqIdx > -1) {
          this.$set(this.schema.properties[field].items.required, reqIdx, value)
        }
        if (this.schema.properties[field].items['x-yrest-form']) {
          let formIdx = this.schema.properties[field].items['x-yrest-form'].indexOf(subfield)
          this.$set(this.schema.properties[field].items['x-yrest-form'], formIdx, value)
        }
        this.$set(this.schema.properties[field].items.properties, value, this.schema.properties[field].items.properties[subfield])
        this.$delete(this.schema.properties[field].items.properties, subfield)
        this.field = field + '.' + value
      } else if (prop === 'required') {
        let idx = this.schema.properties[field].items.required.indexOf(subfield)
        if (value) {
          if (idx < 0) { this.schema.properties[field].items.required.push(subfield) }
        } else {
          if (idx > -1) { this.schema.properties[field].items.required.splice(idx, 1) }
        }
      } else {
        this.$set(this.schema.properties[field].items.properties[subfield], prop, value)
      }
    },
    updateContent (action) {
      if (Object.keys(action).indexOf('field') > -1) {
        this.updateFieldContent(action.field, action.action)
      } else {
        for (var [name, data] of Object.entries(action)) {
          if (name === 'added') {
            let fieldName = data.element + new Date().getTime()
            let fields = this.schema['x-yrest-form'] || Object.keys(this.schema.properties)
            this.$set(this.schema.properties, fieldName, Object.assign({}, this.$refs.fields.schema.properties[data.element]))
            fields.splice(data.newIndex, 0, fieldName)
            this.$set(this.schema, 'x-yrest-form', fields)
          } else {
            // if (!this.schema['x-yrest-form']) {
            //   this.schema['x-yrest-form'] = Object.keys(this.schema.properties)
            // }
            this.schema['x-yrest-form'].splice(data.newIndex, 0, this.schema['x-yrest-form'].splice(data.oldIndex, 1)[0])
          }
        }
      }
    },
    updateFieldContent (field, action) {
      for (var [name, data] of Object.entries(action)) {
        if (name === 'added') {
          let fieldName = data.element + new Date().getTime()
          let fields = this.schema.properties[field].items['x-yrest-form'] || Object.keys(this.schema.properties[field].items.properties)
          this.$set(this.schema.properties[field].items.properties, fieldName, Object.assign({}, this.$refs.fields.schema.properties[data.element]))
          fields.splice(data.newIndex, 0, fieldName)
          this.$set(this.schema.properties[field].items, 'x-yrest-form', fields)
        } else {
          // if (!this.schema.properties[field].items['x-yrest-form']) {
          //   this.schema.properties[field].items['x-yrest-form'] = Object.keys(this.schema.properties[field].items.properties)
          // }
          this.schema.properties[field].items['x-yrest-form'].splice(data.newIndex, 0, this.schema.properties[field].items['x-yrest-form'].splice(data.oldIndex, 1)[0])
        }
      }
    },
    deleteField () {
      let field = this.field
      this.field = null
      if (field.indexOf('.') > -1) {
        let [mainField, subField] = field.split('.')
        this.deleteSubField(mainField, subField)
      } else {
        let reqIdx = this.schema.required.indexOf(field)
        if (reqIdx > -1) {
          this.schema.required.splice(reqIdx, 1)
        }
        if (this.schema['x-yrest-form']) {
          this.schema['x-yrest-form'].splice(this.schema['x-yrest-form'].indexOf(field), 1)
        }
        this.$delete(this.schema.properties, field)
      }
    },
    deleteSubField (field, subfield) {
      let reqIdx = this.schema.properties[field].items.required.indexOf(subfield)
      if (reqIdx > -1) {
        this.schema.properties[field].items.required.splice(reqIdx, 1)
      }
      if (this.schema.properties[field].items['x-yrest-form']) {
        let idx = this.schema.properties[field].items['x-yrest-form'].indexOf(subfield)
        this.schema.properties[field].items['x-yrest-form'].splice(idx, 1)
      }
      this.$delete(this.schema.properties[field].items.properties, subfield)
    }
  },
  async updated () {
    if (!this.spreaded && this.$refs && this.$refs.fields && this.$refs.fields.$refs && this.$refs.fields.$refs.form) {
      await this.$nextTick()
      this.spreaded = spreadForm(this.$refs.fields.$refs.form)
    }
  },
  created () {
    if (this.form) {
      this.schema = this.form.schema
      this.metadata = Object.assign({}, this.form)
      delete this.metadata.schema
    } else {
      this.schema = {
        'type': 'object',
        'properties': {},
        'required': []
      }
      this.metadata = {}
    }
  }
}
</script>
