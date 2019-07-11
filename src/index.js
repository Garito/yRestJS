import { focus, can } from './directives'
import { BeforeEachGard, loadComponents } from './router'
import storeData from './store'

const OAForm = () => import('./components/OAForm')
const OAField = () => import('./components/OAField')
const OAInput = () => import('./components/OAInput')
const OATextarea = () => import('./components/OATextarea')
const OACheckbox = () => import('./components/OACheckbox')
const OASelect = () => import('./components/OASelect')
const OAObjectList = () => import('./components/OAObjectList')

function spreadForm (form, exceptions = null, callbacks = null) {
  if(form.$children.length) {
    let fName = form.$options.propsData.name + '_'
    for (var child of form.$children) {
      if (child.$options.propsData.name) {
        let name = fName + child.$options.propsData.name.split('_').pop()
        if (callbacks) {
          for (var [cbName, callback] of Object.entries(callbacks)) {
            child.$on(cbName, (data) => callback(name, data))
          }
        }

        if (!exceptions || !exceptions[name]) {
          let containers = document.getElementsByClassName(name)
          if (containers.length) {
            containers[0].appendChild(child.$el)
          }
        }
      }
    }
    return true
  } else {
    return false
  }
}

export {
  OAForm,
  OAField,
  OAInput,
  OATextarea,
  OACheckbox,
  OASelect,
  OAObjectList,
  spreadForm,
  focus,
  can,
  BeforeEachGard,
  loadComponents,
  storeData
}
