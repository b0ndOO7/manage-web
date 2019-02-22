<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-cascades"></i> 测试用例:
                    <span style="font-weight:bold">{{projectName}}-{{caseName}}</span>
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>


        <div class="container">
            <el-row>
                <el-col :span="16">测试步骤：</el-col>
                <el-col :span="8">接口：</el-col>
            </el-row>
            <el-row>
                <el-col :span="16">
                    <el-row>
                        <el-table :data="stepTable" border class="table" >
                            <el-table-column prop="index" label="序号" width="50" align="center" />
                            <el-table-column prop="api_name" label="接口名称" width="120"/>
                            <el-table-column prop="method_type" label="请求方法" width="80" align="center"/>
                            <el-table-column prop="url" label="接口地址"/>
                            <el-table-column label="操作" width="250">
                                <template slot-scope="scope">
                                    <el-button type="text" icon="el-icon-plus" @click="handleAddStep(scope.$index, scope.row)">新增步骤</el-button>
                                    <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">数据</el-button>
                                    <el-button type="text" icon="el-icon-delete" class="red" @click="handleDelete(scope.$index, scope.row)"></el-button>
                                    <el-tooltip class="item" effect="light" content="向上移动" placement="bottom">
                                        <el-button type="text" icon="el-icon-arrow-up" class="blue" @click="handleUp(scope.$index, scope.row)"></el-button>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="light" content="向下移动" placement="top">
                                        <el-button type="text" icon="el-icon-arrow-down" class="blue" @click="handleDown(scope.$index, scope.row)"></el-button>
                                    </el-tooltip>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-row>
                    <el-row>
                        <div></div>
                        <el-button type="primary" @click="buttonAddStep">添加步骤</el-button>
                    </el-row>

                </el-col>
                <el-col :span="8">
                    <el-table :data="stepData" border class="table" >
                        <el-table-column prop="index" label="Key" width="50"/>
                        <el-table-column prop="api_name" label="value" width="150"/>
                    </el-table>
                </el-col>
            </el-row>

            <!--选择api-->
            <el-dialog title="测试步骤" :visible.sync="visibleAddStep" :close-on-click-modal="false" style="width: 1200px; left: 5%">
                <div>
                    <el-transfer v-model="selectApis" :props="propsApi" :data="allApis" filterable
                                 :titles="['选择接口', '已选接口']"
                                 :button-texts="['删除', '添加']"
                                 target-order="push">
                    </el-transfer>
                </div>
            </el-dialog>
        </div>
    </div>


</template>

<script>
    import { getCaseStepsByCaseId, getApiByProjectId } from '../../scripts/api'

    export default {
        data() {
            return {
                caseId: this.$route.query.caseId,
                caseName: this.$route.query.caseName,
                projectId: this.$route.query.projectId,
                projectName: this.$route.query.projectName,
                stepTable: [],
                stepData: [],

                visibleAddStep: false,
                allApis:[],
                selectApis: [],
                propsApi: {
                    key: 'id',
                    label: 'api_name'
                }
            }
        },
        beforeRouteUpdate(to, from, next){
            this.caseId = to.query.caseId;
            this.caseName = to.query.caseName;
            this.projectId = to.query.projectId;
            this.projectName = to.query.projectName;
            this.getCaseStep();
            next();
        },
        created() {
            this.getCaseStep();
        },
        mounted() {
        },
        computed: {
        },
        methods: {
            getCaseStep() {
                let params = { caseId: this.caseId };
                getCaseStepsByCaseId(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.stepTable = response.data;
                    } else {
                        this.$message.error(msg.trim());
                    }
                    // this.testStepsVisible = true;
                }).catch(error => {
                    this.$message.error(error);
                });
            },


            handleAddStep(index, row) {
                let record = { index: row.index+1, api_name: 'aaa', method_type:'get', url: 'www.baidu.com' };
                this.stepTable.splice(index+1, 0, record);
                for (let i=index+1, length=this.stepTable.length; i<length; i++) {
                    this.$set(this.stepTable[i], 'index', i+1);
                }
            },
            handleUp(index, row) {
                if (index > 0) {
                    let pre_row = this.stepTable[index-1];

                    pre_row.index = pre_row.index + 1;
                    row.index = row.index - 1;
                    this.stepTable.splice(index-1,1);
                    this.stepTable.splice(index, 0, pre_row)
                } else {
                    this.$message.warning('不能再向上移了');
                }
            },
            handleDown(index, row) {
                if (index < this.stepTable.length-1) {
                    let next_row = this.stepTable[index+1];
                    next_row.index = next_row.index - 1;
                    row.index = row.index + 1;
                    this.stepTable.splice(index+1,1);
                    this.stepTable.splice(index, 0, next_row);
                } else {
                    this.$message.warning('不能再向下移了');
                }
            },

            buttonAddStep() {
                this.stepTable.forEach(item=>{
                    this.selectApis.push(item.api_id);
                });

                let params = { id: this.projectId };
                getApiByProjectId(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.allApis = response.data;
                        this.visibleAddStep = true;
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            }

        }
    }

</script>


<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .table{
        width: 100%;
        font-size: 14px;
    }
</style>
