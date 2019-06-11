import { focus, can } from './directives'
import { BeforeEachGard, loadComponents } from './router'
import storeData from './store'

const OAForm = () => import('./components/OAForm')
const OAField = () => import('./components/OAField')
const OAInput = () => import('./components/OAInput')
const OATextarea = () => import('./components/OATextarea')
const OACheckbox = () => import('./components/OACheckbox')
const OASelect = () => import('./components/OASelect')

function spreadForm (form, containers, exceptions = null, callbacks = null) {
  if (form.$children.length) {
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
    return true
  } else {
    return false
  }
}

export {
  spreadForm,
  OAForm,
  OAField,
  OAInput,
  OATextarea,
  OACheckbox,
  OASelect,
  focus,
  can,
  BeforeEachGard,
  loadComponents,
  storeData
}
