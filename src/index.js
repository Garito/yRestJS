import OAForm from './components/OAForm'
import OAField from './components/OAField'
import OAInput from './components/OAInput'
import OATextarea from './components/OATextarea'
import OADate from './components/OADate'
import OACheckbox from './components/OACheckbox'
import OASelect from './components/OASelect'

import { focus, can } from './directives'

import { BeforeEachGard, loadComponents } from './router'

import storeData from './store'

function spreadForm (form, containers, exceptions = null, callbacks = null) {
  for (var child of form.$children) {
    let name = child.$options.propsData.name.split('_').pop()
    if (callbacks) {
      for (var [cbName, callback] of Object.entries(callbacks)) {
        child.$on(cbName, (data) => callback(name, data))
      }
    }

    if (exceptions && exceptions[name] && containers[exceptions[name]]) {
      containers[exceptions[name]].appendChild(child.$el)
    } else if (containers[name]) {
      let container = Array.isArray(containers[name]) ? containers[name][0] : containers[name]
      container.appendChild(child.$el)
    }
  }
}

export {
  spreadForm,
  OAForm,
  OAField,
  OAInput,
  OATextarea,
  OADate,
  OACheckbox,
  OASelect,
  focus,
  can,
  BeforeEachGard,
  loadComponents,
  storeData
}
