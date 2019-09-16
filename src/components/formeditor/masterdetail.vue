<template>
  <div class="field">
    <label class="label" :class="{ 'is-sr-only': schema['x-yrest-sr_only'] }">{{ schema['x-yrest-label'] || name }}</label>
    <div class="control">
      <table class="table">
        <col v-for="field in fields" :key="'col_' + field" :style="colSizes[field] ? 'width: ' + colSizes[field] + ';' : null">
        <tr v-if="fields.length">
          <th v-for="field in fields" :key="'th_' + field"></th>
        </tr>
        <draggable tag="tr" :value="fields" group="fields" @change="action => $emit('updated', { field: name, action: action })">
          <td v-for="field in fields" :key="'td_' + field" @click.stop="$emit('selected', name + '.' + field)">
            <OAField :name="field" :schema="schema.items.properties[field]" value="" :readonly="true" />
          </td>
          <td v-if="!fields.length">No fields yet</td>
        </draggable>
      </table>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import OAField from '../OAField'

export default {
  name: 'FormEditorMasterDetail',
  components: { draggable, OAField },
  props: { name: String, schema: Object },
  computed: {
    fields () { return this.schema.items['x-yrest-form'] || Object.keys(this.schema.items.properties) },
    colSizes () {
      let sizes = {}
      for (var [name, properties] of Object.entries(this.schema.items.properties)) {
        sizes[name] = properties['x-yrest-col_size'] || ''
      }
      return sizes
    }
  }
}
</script>
