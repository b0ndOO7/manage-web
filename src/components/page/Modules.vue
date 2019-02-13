<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-cascades"></i> 项目:{{projectid}}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

    </div>
</template>

<script>
    import bus from '../common/bus';
    export default {
        name: 'dashboard',
        data() {
            return {
                uid: localStorage.getItem('uid'),
                name: localStorage.getItem('username'),
                projectid: this.$route.params.pid,

            }
        },
        components: {

        },
        computed: {
        },
        created(){
           // this.projectid = this.$route.params.pid;
        },
        activated(){

        },
        deactivated(){
            window.removeEventListener('resize', this.renderChart);
            bus.$off('collapse', this.handleBus);
        },
        methods: {



        }
    }

</script>


<style scoped>
    .user-info-cont div:first-child {
        font-size: 30px;
        color: #222;
    }
</style>
