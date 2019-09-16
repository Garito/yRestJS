function storeData (rootModel, modules, apiUrl) {
  return {
    state: { openApi: null, users: null, permissions: null, roles: null, token: null, actor: null, context: null, errors: {} },
    getters: {
      url: state => obj => { return obj.path === '' ? '/' : obj.path === '/' ? '/' + obj.slug : obj.path + '/' + obj.slug },
      path: (state, getters) => obj => getters.url(obj).substr(1),
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
              var url = (state.context && state.context.object) ? getters.url(state.context.object) : ''
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
      setContext: (state, context) => { state.context = context },
      setErrors: (state, errors) => { state.errors = errors },
      setError: (state, payload) => { state.errors = { ...state.errors, ...payload } }
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
            if (param.$ref) {
              param = context.state.openApi.components.parameters[param.$ref.split('/').pop()]
            }
            if (param.in === 'path') {
              var [search, replaceWith] = Object.keys(payload).indexOf(param.name) > -1
                ? ['{' + param.name + '}', payload[param.name]]
                : ['/{' + param.name + '}', '']
              if (Object.keys(payload).indexOf(param.name) > -1) {
                search = '{' + param.name + '}'
                replaceWith = payload[param.name]
              } else {
                search = '/{' + param.name + '}'
                replaceWith = ''
              }
              url = url.replace(search, replaceWith)
            }
          }
          let options = { url: url, method: method.toUpperCase() }
          if (payload.form) {
            options.data = payload.form
          }
          let result = await context.dispatch('fetch', options)
          let rjson = await result.json()
          if (rjson.ok || rjson.access_token) {
            context.commit('setErrors', {})
            return rjson
          } else {
            if ([400, 409].indexOf(rjson.code) > -1) {
              var message = JSON.parse(rjson.message.replace(/'/g, '"'))
            } else {
              message = rjson.message
            }
            if (method === 'post') {
              let data = {}
              data[url.split('/').pop()] = message
              context.commit('setError', data)
            } else if (method === 'put' && url === '/auth') {
              context.commit('setError', { login: message })
            } else {
              context.commit('setErrors', message)
            }
          }
        }
      },
      async add (context, payload) {
        let children = payload.children
        delete payload.children
        if (context.state.context.object.path) {
          payload[context.state.context.object.type + '_Path'] = context.getters.path(context.state.context.object)
        }
        let result = await context.dispatch('api', payload)
        if (result) {
          let stateContext = context.state.context
          stateContext.object[children].push(result.result.slug)
          if (Object.keys(stateContext).indexOf(children) > -1) {
            stateContext[children].push(result.result)
          } else {
            context.state[children].push(result.result)
          }
          context.commit('setContext', stateContext)

          return result
        }
      },
      async loadGlobalContext (context, endpoint = '/get_global_context') {
        let globalContext = await context.dispatch('api', { name: rootModel + endpoint })
        if (globalContext) {
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
      }
    },
    modules: modules
  }
}

export default storeData
