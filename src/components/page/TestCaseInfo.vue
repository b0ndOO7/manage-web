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
                <el-col :span="16">{{caseName}}--测试步骤：</el-col>
                <el-col :span="8">接口：</el-col>
            </el-row>
            <el-row>
                <el-col :span="16">
                    <el-row>
                        <el-table :data="stepTable" border class="table" highlight-current-row>
                            <el-table-column prop="index" label="序号" width="80" align="center" />
                            <el-table-column prop="api_name" label="接口名称" width="180"/>
                            <el-table-column prop="method_type" label="请求方法" width="90" align="center"/>
                            <el-table-column prop="url" label="接口地址"/>
                            <el-table-column label="操作" width="250">
                                <template slot-scope="scope">
                                    <el-button type="text" icon="el-icon-edit" @click="handleData(scope.$index, scope.row)">测试数据</el-button>
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
                        <br>
                        <div align="center">
                            <el-button @click="getCaseStep">获取步骤</el-button>
                            <el-button @click="modifyStep">修改步骤</el-button>
                            <el-button type="primary" @click="saveTestStep">保存步骤</el-button>
                        </div>
                        <div v-if="!isSave" style="color:red" align="center">请保存测试步骤</div>
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
            <el-dialog title="测试步骤" :visible.sync="visibleAddStep" :close-on-click-modal="false" style="width: 1180px;" >
                <div>
                    <el-row>
                        <el-col>
                            <el-transfer v-model="selectApis" :props="propsApi" :data="allApis" filterable
                                         :titles="['选择接口', '已选接口']"
                                         :button-texts="['删除', '添加']"
                                         target-order="push">
                            </el-transfer>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col  align="center">
                            <br>
                            <el-button type="primary" @click="modifyTestStep">修改</el-button>
                            <el-button @click="visibleAddStep=false">取消</el-button>
                        </el-col>
                    </el-row>
                </div>
            </el-dialog>
        </div>
    </div>


</template>

<script>
    import { getCaseStepsByCaseId, getApiByProjectId, saveCaseStepsByCaseId, getCaseStepDataById } from '../../scripts/api'

    export default {
        data() {
            return {
                caseId: this.$route.query.caseId,
                caseName: this.$route.query.caseName,
                projectId: this.$route.query.projectId,
                projectName: this.$route.query.projectName,
                stepTable: [],
                stepData: [],
                isSave: true,


                visibleAddStep: false,
                allApis:[],
                selectApis: [],
                propsApi: {
                    key: 'id',
                    label: 'api_name'
                },

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
                        this.isSave = true;
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
                this.isSave = false;
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
                this.isSave = false;
            },
            handleDelete(index, row) {
                this.stepTable.splice(index, 1);
                for (let i=index, length=this.stepTable.length; i<length; i++) {
                    this.$set(this.stepTable[i], 'index', i+1);
                }
                this.isSave = false;
            },

            modifyStep() {
                this.selectApis = [];
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
            },

            modifyTestStep() {
                this.stepTable = [];
                let index = 0;
                this.selectApis.forEach(item => {
                    let api = this.allApis.find(em => {
                        return em.id === item;
                    });
                    index += 1;
                    let url = (api.protocol_type ? api.protocol_type.toLowerCase() : "http") + "://" + api.domain + api.uri;
                    this.stepTable.push({
                        relationId: '',
                        case_id: this.caseId,
                        api_id: item,
                        index: index,
                        module_id: api.module_id,
                        api_name: api.api_name,
                        method_type: api.method_type,
                        url: url,
                        status: "0"
                    });
                });
                this.visibleAddStep = false;
                this.isSave = false;
                // console.log(this.stepTable)
            },
            //保存测试步骤
            saveTestStep() {
                let params = { caseId: this.caseId,testCaseSteps: this.stepTable };
                saveCaseStepsByCaseId(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success(this.caseName + ', 测试步骤保存成功!');
                        this.isSave = true;
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },

            // 测试数据
            handleData(index, row) {
                console.log(row);
                if (!this.isSave) {
                    this.$message.error('请先保存测试步骤！！！')
                }
                let params = { caseId: row.case_id, apiId: row.api_id, relationId: row.relationId };
                getCaseStepDataById(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.isSave = true;
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
