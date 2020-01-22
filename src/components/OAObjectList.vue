<template>
  <div :id="name" class="field" :class="fieldClasses">
    <label class="label" :class="labelClasses" :for="name">{{ $t(schema['x-yrest-label'] || name ) }}</label>
    <div class="control" :class="controlClasses">
      <table class="table is-marginless is-fullwidth">
        <col v-for="field in fieldNames" :key="'col_' + field" :style="colSizes[field] ? 'width: ' + colSizes[field] + ';' : null">
        <!-- <tr>
          <th v-for="field in fieldNames" :key="'th_' + field">
            {{ $t(schema.items.properties[field]['x-yrest-label'] || field) }}
          </th>
          <th v-if="!readonly"></th>
        </tr> -->
        <tr v-for="(item, index) in value" :key="item._id">
          <td v-for="field in fieldNames" :key="field + '_' + index">
            <template v-if="isObject(value[index][field])">{{ value[index][field].label }}</template>
            <template v-else>{{ value[index][field] }}</template>
          </td>
          <td v-if="!readonly">
            <a class="icon is-pulled-right" @click="del(index)">
              <font-awesome-icon :icon="[ 'far', 'trash-alt' ]"></font-awesome-icon>
            </a>
          </td>
        </tr>
        <tr v-if="!readonly">
          <td v-for="field in fieldNames" :key="'new_' + field" :class="name + '_' + field"></td>
          <td :class="name + '_controls'"><label class="label" v-html="'&nbsp;'"></label></td>
        </tr>
      </table>
      <OAForm :name="name" :schema="schema.items" :action="$t('Add')" @submit="({ form }) => $emit('input', value.concat([ form ]))" ref="newItem" v-if="!readonly" />
    </div>
    <div :class="hintClasses" v-if="schema['x-yrest-hint']">{{ $t(schema['x-yrest-hint']) }}</div>
    <div class="help errors is-danger" v-if="errors">
      <ul>
        <li v-for="(error, index) in errors" :key="'Error_' + index">{{ error }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OAObjectList',
  props: {
    name: { type: String, required: true },
    schema: { type: Object, default: () => ({}) },
    value: { type: [String, Array, Object], default: () => ([]) },
    required: { type: Boolean, default: false },
    errors: { type: Array, default: null },
    focus: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false }
  },
  computed: {
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
      if (this.schema['x-yrest-extra_control_classes']) {
        let classes = this.schema['x-yrest-extra_control_classes']
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
    fieldNames () { return this.schema.items['x-yrest-form'] || Object.keys(this.schema.items.properties) },
    colSizes () {
      let sizes = {}
      for (var [name, properties] of Object.entries(this.schema.items.properties)) {
        sizes[name] = properties['x-yrest-col_size'] || ''
      }
      return sizes
    }
  },
  methods: {
    isObject (obj) { return obj instanceof Object },
    del (index) {
      let value = this.value
      value.splice(index, 1)
      this.$emit('input', value)
    }
  },
  watch: {
    value (newValue) {
      if (!this.readonly) {
        this.$refs.newItem.resetFields()
      }
    }
  }
}
</script>
