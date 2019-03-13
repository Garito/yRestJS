function storeData (rootModel, modules, apiUrl) {
  return {
    state: { openApi: null, users: null, permissions: null, roles: null, token: null, actor: null, context: null },
    getters: {
      operation: state => operationId => {
        if (state.openApi) {
          for (var [name, path] of Object.entries(state.openApi.paths)) {
            for (var [verb, operation] of Object.entries(path)) {
              if (['get', 'put', 'post', 'delete'].indexOf(verb) > -1) {
                if (operation.operationId === operationId) {
                  return [name].concat([verb, operation])
                }
              }
            }
          }
        }
        return null
      },
      schema: (state, getters) => operationId => {
        let operation = getters.operation(operationId)
        if (operation) {
          let parts = Object.values(operation[2].requestBody.content)[0].schema['$ref'].split('/')
          let schema = state.openApi.components.schemas[parts[parts.length - 1]]
          return schema
        }
        return null
      },
      permissionsByContext: (state) => (permissions = null) => {
        if (!permissions) {
          permissions = state.permissions
        }
        let result = {}
        if (permissions) {
          for (var permission of Object.values(permissions)) {
            let model = permission.context.toLowerCase()
            if (!(model in result)) { result[model] = {} }
            result[model][permission.name] = permission
          }
        }
        return result
      },
      can: (state, getters) => (permission, route = null) => {
        let [context, name] = permission.split('/')
        let contextLower = context.toLowerCase()
        let permissions = getters.permissionsByContext()
        if (permissions[contextLower]) {
          let perm = permissions[contextLower][name] || null
          if (perm) {
            if (perm.roles.length === 0) {
              return true
            } else {
              if (state.context && state.context.object) {
                if (state.context.object.path === '') {
                  var url = '/'
                } else if (state.context.object.path === '/') {
                  url = '/' + state.context.object.slug
                } else {
                  url = state.context.object.path + '/' + state.context.object.slug
                }
              } else {
                url = ''
              }
              for (var per of perm.roles) {
                if (state.actor && (state.actor.roles.indexOf(per) > -1 || (url && state.actor.roles.indexOf(per + '@' + url) > -1))) {
                  return true
                } else {
                  let getter = 'User/is_' + per
                  if (Object.keys(getters).indexOf(getter) > -1 && getters[getter](route)) {
                    return true
                  }
                }
              }
            }
          } else {
            return true
          }
        }
        return false
      }
    },
    mutations: {
      setOpenApi: (state, openApi) => { state.openApi = openApi },
      setUsers: (state, users) => { state.users = users },
      setPermissions: (state, permissions) => { state.permissions = permissions },
      setRoles: (state, roles) => { state.roles = roles },
      setToken: (state, token) => { state.token = token },
      setActor: (state, actor) => { state.actor = actor },
      setContext: (state, context) => { state.context = context }
    },
    actions: {
      async fetch (context, payload) {
        if (payload.data) {
          var options = {
            method: payload.method || 'POST',
            headers: new Headers({
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(payload.data)
          }
          if (context.state.token) {
            options.headers.append('Authorization', 'Bearer ' + context.state.token)
          }
        } else if (context.state.token) {
          options = {
            headers: new Headers({
              'Authorization': 'Bearer ' + context.state.token
            })
          }
          if (payload.method) {
            options['method'] = payload.method
          }
        } else {
          options = {}
          if (payload.method) {
            options['method'] = payload.method
          }
        }
        try {
          let result = await fetch(apiUrl + payload.url, options)
          return result
        } catch (err) {
          return err
        }
      },
      async getOpenApi (context) {
        let result = await context.dispatch('fetch', { url: '/openapi' })
        if (result.ok) {
          let rjson = await result.json()
          context.commit('setOpenApi', rjson)
        } else {
          return result
        }
      },
      async api (context, payload) {
        let operation = context.getters.operation(payload.name)
        if (operation) {
          let url = operation[0]
          let method = operation[1]
          for (var param of (context.state.openApi.paths[url].parameters || [])) {
            if (param.in === 'path') {
              url = url.replace('{' + param.name + '}', payload[param.name])
            }
          }
          let options = { url: url, method: method.toUpperCase() }
          if (payload.form) {
            options.data = payload.form
          }
          let result = await context.dispatch('fetch', options)
          let rjson = await result.json()
          return rjson
        }
      },
      async loadGlobalContext (context, endpoint = '/get_global_context') {
        let globalContext = await context.dispatch('api', { name: rootModel + endpoint })
        if (globalContext.ok) {
          for (var [name, value] of Object.entries(globalContext.result)) {
            context.commit('set' + name[0].toUpperCase() + name.slice(1), value)
          }
        }
      },
      async loadContext (context, url) {
        let result = await context.dispatch('fetch', { url: url })
        let rjson = await result.json()
        if (rjson.ok) {
          context.commit('setContext', rjson.result)
          return rjson.result
        } else {
          throw rjson
        }
      },
      reset (context) {
        context.commit('setToken', null)
        context.commit('setActor', null)
        context.commit('setContext', null)
      }
    },
    modules: modules
  }
}

export default storeData
