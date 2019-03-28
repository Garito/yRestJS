<script>
import Multiselect from 'vue-multiselect'
import OAInput from './OAInput'
import OATextarea from './OATextarea'
import OADate from './OADate'
import OACheckbox from './OACheckbox'
import OASelect from './OASelect'

export default {
  name: 'OAField',
  components: { OAInput, OATextarea, OADate, OACheckbox, OASelect },
  props: { name: String, schema: Object, value: [ String, Number, Date, Boolean, Array ], focus: Boolean, readonly: Boolean, errors: Object },
  render (createElement) {
    var self = this
    var opts = {
      props: self.$props,
      on: {
        input (value) {
          self.$emit('input', value)
        },
        change (value) {
          self.$emit('change', value)
        }
      }
    }

    switch (self.schema.type) {
      case 'string':
        if (self.schema['x-yrest-input_type'] === 'textarea') {
          return createElement('OATextarea', opts)
        } else if (self.schema['x-yrest-input_type'] === 'email' || self.schema.format === 'email') {
          let icon = createElement('font-awesome-icon', { props: { icon: [ 'far', 'envelope' ] }, slot: 'leftIcon' })

          return createElement('OAInput', opts, [ icon ])
        } else if (self.schema['x-yrest-input_type'] === 'password') {
          let inputOpts = Object.assign({}, opts)
          inputOpts.scopedSlots = {
            rightControl: props => {
              let btnOpts = {
                class: 'button has-text-grey-light' + (self.errors ? ' is-danger' : ''),
                domProps: { type: 'button' },
                on: { click: () => { props.data.toggled = !props.data.toggled } }
              }

              let btnIcon = createElement('font-awesome-icon', { props: { icon: [ 'far', props.data.toggled ? 'eye-slash' : 'eye' ] } })

              return createElement('button', btnOpts, [ btnIcon ])
            }
          }

          let icon = createElement('font-awesome-icon', { props: { icon: 'lock' }, slot: 'leftIcon' })

          return createElement('OAInput', inputOpts, [ icon ])
        } else if (['date-time', 'date'].indexOf(this.schema.format) > -1) {
          return createElement('OADate', opts)
        } else {
          return createElement('OAInput', opts)
        }
      case 'number':
        return createElement('OAInput', opts)
      case 'boolean':
        return createElement('OACheckbox', opts)
      case 'array':
        if (self.schema.enum) {
          return createElement('OASelect', opts)
        } else {
          return createElement('OAInput', opts)
        }
      default:
        return createElement('OAInput', opts)
    }
  }
}
</script>
