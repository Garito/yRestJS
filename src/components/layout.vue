<script>
import Vue from 'vue'

export default {
  name: 'Layout',
  props: { tmpl: String, ctx: Object },
  render (cE) {
    let el = Vue.compile(this.tmpl)
    el = new Vue({
      data: this.ctx,
      methods: {
        url: this.$store.getters.url
      },
      render: el.render,
      staticRenderFns: el.staticRenderFns,
      router: this.$router
    }).$mount()

    return el._vnode
  }
}
</script>