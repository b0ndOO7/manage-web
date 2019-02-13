<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item v-on:click="showCards"><i class="el-icon-lx-calendar"></i> 项目card</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="projects" v-show="showProjectsCard">
            <el-row :gutter="50">
                <el-col v-for="item,index in projects" :key="index" :span="6" :gutter="50">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-1" v-on:click="showProjectModules(item.id)">
                            <i class="el-icon-star-off grid-con-icon"></i>
                            <div class="grid-cont-right">
                                <div class="grid-num link">{{item.project}}</div>
                                <!--<router-link class="grid-num link"-->
                                             <!--:to="{name:'module',params :{pid:item.id, title: item.project}}">-->
                                    <!--{{item.project}}-->
                                <!--</router-link>-->
                                <div class="cursor:pointer">协议类型:{{item.type}}</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <tree-table v-show="showTreeTable" :columns="columns" :tree-structure="true" :data-source="dataSource"></tree-table>
    </div>
</template>

<script>
    import {getAllUserProjectList} from '../../scripts/api'
    import bus from '../common/bus';
    import TreeTable from './TreeTable'

    export default {
        data() {
            return {
                showProjectsCard: true,
                showTreeTable: false,
                uid: localStorage.getItem('uid'),
                name: localStorage.getItem('username'),
                projects: [],

                columns: [
                    {
                        text: '模块',
                        dataIndex: 'module'
                    },
                    // {
                    //     text: '年龄',
                    //     dataIndex: 'age'
                    // },
                    {
                        text: '备注',
                        dataIndex: 'remark'
                    }
                ],
                dataSource: [
                    {
                        id: 1,
                        parentId: 0,
                        module: '首页',
                        remark: '男',
                        children: [
                            {
                                id: 2,
                                parentId: 1,
                                module: '图表',
                                remark: '男'
                            }
                        ]
                    },
                    {
                        id: 3,
                        parentId: 0,
                        module: '系统管理',
                        remark: '女',
                        children: [
                            {
                                id: 4,
                                parentId: 3,
                                module: '模块管理',
                                remark: '男'
                            },
                            {
                                id: 5,
                                parentId: 3,
                                module: '测试5',
                                remark: '男'
                            },
                            {
                                id: 6,
                                parentId: 3,
                                module: '部门管理',
                                remark: '女',
                                children: [
                                    {
                                        id: 7,
                                        parentId: 6,
                                        module: '销售部门',
                                        remark: '男'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 18,
                        parentId: 0,
                        module: '测试8',
                        remark: '男'
                    }
                ]
            }
        },
        components: {
            TreeTable
        },
        computed: {},
        created() {
            this.getProjectList();
        },
        deactivated() {
            bus.$off('collapse', this.handleBus);
        },
        methods: {
            // 项目列表
            getProjectList() {
                let params = {uid: localStorage.getItem('uid')};
                getAllUserProjectList(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.projects = response.data.projects;
                        if (this.projects.length == 0) {
                            this.$message.info("用户暂无项目")
                        }
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },

            showCards() {
                this.showProjectsCard = this.showProjectsCard ? false : true;
            },
            showProjectModules(id) {
                this.showProjectsCard = false;
                this.showTreeTable = true;
                console.log(id);
            }

        }
    }

</script>


<style scoped>
    .grid-content {
        display: flex;
        align-items: center;
        height: 100px;
        cursor: pointer;
    }

    .grid-cont-right {
        flex: 1;
        text-align: center;
        font-size: 14px;
        color: #999;
    }

    .grid-num {
        font-size: 30px;
        font-weight: bold;
        cursor: pointer;
    }

    .grid-con-icon {
        font-size: 50px;
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 100px;
        color: #fff;
    }

    .grid-con-1 .grid-con-icon {
        background: rgb(45, 140, 240);
    }

    .grid-con-1 .grid-num {
        color: rgb(45, 140, 240);
    }

    .grid-con-2 .grid-con-icon {
        background: rgb(100, 213, 114);
    }

    .grid-con-2 .grid-num {
        color: rgb(45, 140, 240);
    }

    .grid-con-3 .grid-con-icon {
        background: rgb(242, 94, 67);
    }

    .grid-con-3 .grid-num {
        color: rgb(242, 94, 67);
    }

    .user-info-cont div:first-child {
        font-size: 30px;
        color: #222;
    }

    .user-info-list span {
        margin-left: 70px;
    }

</style>
