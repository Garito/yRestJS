<script>
import Vue from 'vue'

export default {
  name: 'Layout',
  props: { tmpl: String, ctx: Object },
  render (cE) {
    let el = Vue.compile(this.tmpl)
    let opts = {
      data: this.ctx,
      methods: {
        url: this.$store.getters.url
      },
      render: el.render,
      staticRenderFns: el.staticRenderFns,
      router: this.$router
    }
    if (this._i18n) {
      opts.i18n = this._i18n
    }

    el = new Vue(opts)
    el.$scopedSlots = this.$scopedSlots
    for (let [name, callback] of Object.entries(this.$listeners)) {
      el._events[name] = [callback]
    }

    el.$mount()

    return el._vnode
  }
}
</script>