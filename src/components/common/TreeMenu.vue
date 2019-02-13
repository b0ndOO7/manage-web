<template>
  <div class="treeMenu">

    <label v-for="item in items">
      <el-menu-item v-if="item.childs==null&&item.state==='ENABLE'" :key="item.id" :data="item" :index="item.path" :route="item.path" :title="item.title">
        <i :class="item.icon"></i>
        <span slot="title">{{item.title}}</span>
      </el-menu-item>

      <el-submenu v-else :index="item.path">
        <template slot="title">
          <i :class="item.icon"></i>
          <span> {{item.title}}</span>
        </template>
        <TreeMenu :items="item.childs"></TreeMenu>
      </el-submenu>
    </label>

  </div>
</template>

<script>
  export default {
    name: 'TreeMenu',
    props: {
      items: {
        type: Array,
        required: true
      }
    },
    data() {
      return {}
    },
    methods: {}
  }
</script>

<style scoped>

</style>
