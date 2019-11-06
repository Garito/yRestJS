import Vue from 'vue'

function BeforeEachGard (rootModel, views, components, store) {
  return async (to, from, next) => {
    let setupMode = false
    if (!store.state.openApi) {
      let result = await store.dispatch('getOpenApi')
      if (result && !result.ok && result.status === 404) {
        setupMode = true
      }
    }

    if (setupMode) {
      to.params.component = rootModel + '_setup'
      next()
    } else {
      if (!store.state.permissions) { await store.dispatch('loadGlobalContext') }

      let viewsNames = Object.keys(views)
      let parts = to.path.split('/')
      let view = parts.pop() || 'index'
      let viewIndex = viewsNames.indexOf(view)
      let url = viewIndex > -1 ? parts.join('/') : to.path
      let component = viewIndex > -1 ? views[view] : null
      if (component) {
        if (component.length === 1) {
          if (store.getters.can(component[0] + '/' + view, to)) {
            to.params.component = component[0] + '_' + view
            try {
              await store.dispatch('loadContext', url)
            } catch (err) {
              console.log(err)
            }
            next()
          } else {
            next({ path: '/login', query: { next: to.path } })
          }
        } else {
          try {
            let context = await store.dispatch('loadContext', url)
            if (store.getters.can(component[0] + '/' + view, to)) {
              to.params.component = context.object.type + '_' + view
              next()
            } else {
              next({ path: '/login', query: { next: to.path } })
            }
          } catch (er) {
            if (er.code === 401) {
              next({ path: '/login', query: { next: to.path } })
            } else {
              to.params.commponent = rootModel + '_error'
              next()
            }
          }
        }
      } else {
        to.params.component = rootModel + '_not_found'
        next()
      }
    }
  }
}

function loadComponents (models) {
  let views = {}
  let components = {}
  models.keys().forEach(filename => {
    let [model, component] = filename.substr(2, filename.length - 6).split('/')
    if (Object.keys(views).indexOf(component) === -1) { views[component] = [] }
    views[component].push(model)
    let actual = models(filename).default
    components[model + '_' + component] = actual
    Vue.component(model + '_' + component, actual)
  })
  return { views, components }
}

export { BeforeEachGard, loadComponents }
