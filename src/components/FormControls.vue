<template>
  <div class="columns" :class="name">
    <div class="column">
      <button class="button is-primary is-fullwidth" :class="{ 'is-loading': loading }" type="button" @click="$emit('ok')">{{ action }}</button>
    </div>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'FormControls',
    props: { name: String, action: String, loading: { type: Boolean, default: false } }
  }
</script>
