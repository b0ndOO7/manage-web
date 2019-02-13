<template>
    <div class="sidebar">
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" background-color="#324157"
                 text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router>
            <template v-for="item in items">
                <template v-if="item.children && item.children.length>0">
                    <el-submenu :index="item.path" :key="item.path">
                        <template slot="title">
                            <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.children">
                            <el-submenu v-if="subItem.children && subItem.children.length>0" :index="subItem.path" :key="subItem.path">
                                <template slot="title">{{ subItem.title }}</template>
                                <el-menu-item v-for="(threeItem,i) in subItem.children" :key="i" :index="threeItem.path">
                                    {{ threeItem.title }}
                                </el-menu-item>
                            </el-submenu>
                            <el-menu-item v-else :index="subItem.path" :key="subItem.path">
                                {{ subItem.title }}
                            </el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.path" :key="item.path">
                        <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import {getUserMenu} from '../../scripts/api'
    import TreeMenu from './TreeMenu.vue'

    export default {
        name: "Sidebar",
        components: {
            TreeMenu: TreeMenu
        },
        data() {
            return {
                collapse: false,
                uid: localStorage.getItem('uid'),
                items:[]
            }
        },
        computed:{
            onRoutes(){
                return this.$route.path.replace('/','');
            }
        },
        mounted() {
            this.getMenu();
        },
        methods: {
            getMenu() {
                let params = {uid: localStorage.getItem('uid')}
                if (!this.uid) {
                    this.$router.push('/login')
                }
                getUserMenu(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if ( code == 200 ) {
                        this.items = response.data;
                    } else {
                        this.$message.error(msg);
                    }
                }).catch(error => {
                    console.log('error......')
                })
            }
        },
        created(){
            // 通过 Event Bus 进行组件间通信，来折叠侧边栏
            bus.$on('collapse', msg => {
                this.collapse = msg;
            })
        }
    }
</script>

<style>
    .sidebar{
        display: block;
        position: absolute;
        left: 0;
        top: 70px;
        bottom:0;
        overflow-y: scroll;
    }
    .sidebar::-webkit-scrollbar{
        width: 0;
    }
    .sidebar-el-menu:not(.el-menu--collapse){
        width: 250px;
    }
    .sidebar > ul {
        height:100%;
    }
</style>
