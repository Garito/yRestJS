<template>
  <div class="form-editor-content">
    <draggable :value="fields" group="fields" @change="action => $emit('updated', action)" class="is-equal-height" :class="{ 'drop-area': !fields.length }">
      <div v-for="field in fields" :key="formName + '_' + field" class="columns" :class="formName + '_' + field" @click="$emit('selected', field)">
        <div class="column" :class="{ 'is-selected': selected === field }">
          <FormEditorMasterDetail :name="field" :schema="value.properties[field]" v-if="isMasterDetail(field)" @selected="f => $emit('selected', f)" @updated="action => $emit('updated', action)" />
          <OAField :name="field" :schema="value.properties[field]" value="" :readonly="true" v-else />
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import OAField from '../OAField'
import FormEditorMasterDetail from './masterdetail'

export default {
  name: 'FormEditorContent',
  components: { draggable, OAField, FormEditorMasterDetail },
  props: { value: Object, selected: String },
  data: () => ({ formName: 'content' }),
  computed: {
    fields () {
      if (this.value) {
        if (this.value['x-yrest-form']) {
          return this.value['x-yrest-form']
        } else if (this.value.properties) {
          return Object.keys(this.value.properties)
        }
      }
      return []
    }
  },
  methods: {
    isMasterDetail (field) {
      return this.value.properties[field].type === 'array' && Object.keys(this.value.properties[field]).indexOf('items') > -1
    }
  }
}
</script>
