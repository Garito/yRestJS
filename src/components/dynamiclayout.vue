<template>
  <div>
    <div :id="name + '_tmpl'"><slot></slot></div>
    <div :id="name + '_data'"><slot name="content"></slot></div>
  </div>
</template>

<script>
export default {
  name: 'DynamicLayout',
  props: { name: String },
  methods: {
    getFeatures (tmpl, ctx, indexer) {
      let container = document.createElement('div')
      container.innerHTML = tmpl
      let features = {}
      container.querySelectorAll('[id]').forEach(n => {
        let query = n.getAttribute('query')
        if (query) {
          let parts = query.split('||')
          for (let part of parts) {
            let indexed = indexer(part, { data: ctx }).value
            if (indexed) {
              features[n.id] = indexed
              break
            }
          }
        }
      })
      return features
    },
    spread () {
      let tmpl = document.getElementById(this.name + '_tmpl')
      let data = document.getElementById(this.name + '_data')
      if (tmpl && data) {
        for (var el of tmpl.querySelectorAll('[id]')) {
          let orig = data.querySelector('#' + el.id)
          let dest = tmpl.querySelector('#' + el.id)
          if (orig && dest) {
            if (orig.classList.contains('no-wrapper')) {
              orig.childNodes.forEach(c => { dest.parentNode.appendChild(c) })
            } else {
              dest.parentNode.replaceChild(orig, dest)
            }
          }
        }
      }
    }
  },
  async mounted () {
    await this.$nextTick()
    this.spread()
  },
  async updated () {
    await this.$nextTick()
    this.spread()
  }
}
</script>
