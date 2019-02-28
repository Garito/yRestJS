export let focus = {
  inserted: function (el, options) {
    if (options.value === undefined || options.value) {
      el.focus()
    }
  }
}

export let can = {
  inserted: function (el, binding, vnode) {
    if (binding.value) {
      if (Array.isArray(binding.value)) {
        var can = false
        for (var permission of binding.value) {
          if (vnode.context.$store.getters.can(permission)) {
            can = true
            break
          }
        }
      } else {
        can = vnode.context.$store.getters.can(binding.value)
      }
      if (!can) {
        el.parentNode.removeChild(el)
      }
    } else {
      console.error('Permission not specified @ ' + vnode.context.$options._componentTag)
    }
  }
}
