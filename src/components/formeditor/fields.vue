<template>
  <div class="form-editor-fields">
    <div class="tabs is-centered">
      <ul>
        <li v-for="group in Object.keys(groups)" :key="'fields_tab_' + group" :class="{ 'is-active': tab === group }">
          <a @click="tab = group">{{ group }}</a>
        </li>
      </ul>
    </div>
    <div v-for="group in Object.keys(groups)" :key="'group_' + group" v-show="tab === group">
      <draggable :value="groups[group]" :group="{ name: 'fields', pull: 'clone', put: false }" :sortable="false">
        <div v-for="field in groups[group]" :key="'field_' + field" class="columns">
          <div class="column" :class="formName + '_' + field"></div>
        </div>
      </draggable>
    </div>
    <OAForm :name="formName" :schema="schema" :controls="false" :readonly="true" ref="form">
      <!-- <template slot="address" slot-scope="{ form }">
        <AddressEditor name="address" v-model="form.address" heigth="200px" />
      </template>
      <template slot="zone" slot-scope="{ form }">
        <ZoneEditor name="zone" v-model="form.zone" heigth="200px" />
      </template> -->
    </OAForm>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
// const AddressEditor = () => import('@/components/Address/editor')
// const ZoneEditor = () => import('@/components/Zone/editor')

export default {
  name: 'FormEditorFields',
  // components: { draggable, AddressEditor, ZoneEditor },
  components: { draggable },
  data: () => ({
    formName: 'fields_list',
    groups: {
      Basic: [ 'text', 'textarea', 'integer', 'date', 'boolean' ],
      More: [ 'email', 'phone', 'datetime', 'url', 'uuid', 'number' ],
      'Master/Detail': [ 'masterdetail' ]
      // Geo: [ 'address', 'zone' ]
    },
    schema: {
      properties: {
        text: { type: 'string', 'x-yrest-label': 'Text' },
        textarea: { type: 'string', 'x-yrest-label': 'Long text', 'x-yrest-input_type': 'textarea' },
        email: { type: 'string', 'x-yrest-label': 'Email', 'format': 'email' },
        phone: { type: 'string', 'x-yrest-label': 'Phone number', 'x-yrest-input_type': 'tel' },
        datetime: { type: 'string', 'x-yrest-label': 'Date & time', 'format': 'date-time' },
        date: { type: 'string', 'x-yrest-label': 'Date', 'format': 'date' },
        url: { type: 'string', 'x-yrest-label': 'Url', 'format': 'url' },
        uuid: { type: 'string', 'x-yrest-label': 'Uuid', 'format': 'uuid' },
        integer: { type: 'number', 'x-yrest-label': 'Integer' },
        number: { type: 'number', 'x-yrest-label': 'Number' },
        boolean: { type: 'boolean', 'x-yrest-label': 'Yes/no' },
        masterdetail: { type: 'array', items: { type: 'object', properties: {}, required: [] }, 'x-yrest-label': 'Master/detail' }
        // address: { type: 'object', 'x-yrest-input_type': 'geo' },
        // zone: { type: 'object', 'x-yrest-input_type': 'geo' }
      },
      required: [],
      type: 'object'
    },
    tab: null
  }),
  created () { this.tab = Object.keys(this.groups)[0] }
}
</script>
