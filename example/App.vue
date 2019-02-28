<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <component-fixture>

      <YRest />

      <Editor slot="control" slot-scope="scope" v-bind="scope"/>

    </component-fixture>
  </div>
</template>

<script>
import { ComponentFixture, Editor } from 'component-fixture'
import "component-fixture/dist/ComponentFixture.css";
import YRest from '@/components/YRest.vue'

export default {
  name: 'app',
  components: {
    ComponentFixture,
    Editor,
    YRest
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
