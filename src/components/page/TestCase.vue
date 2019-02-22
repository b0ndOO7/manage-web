<template>
    <div class="table">
        <el-row :gutter="5">
            <el-col :span="4" >
                <div>
                    <el-card shadow="hover" :body-style="{padding: '0px'}" >
                        <div slot="header">
                            <el-select v-model="select_project" filterable placeholder="请选择项目" @change="getModule" size="medium">
                                <el-option
                                    v-for="item in project_options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
                        </div>
                        <el-tree :data="modules"
                                 node-key="id"
                                 :highlight-current="true"
                                 accordion
                                 @node-click="handleCheckChange">
                        </el-tree>
                        <div>
                            <br>
                        </div>
                    </el-card>
                </div>
            </el-col>

            <el-col :span="20" >
                <div class="container">
                    <div class="handle-box">
                        <el-button type="primary" @click="delMore">批量删除</el-button>
                        <el-input v-model="search_word" placeholder="筛选关键词" class="handle-input"></el-input>
                        <el-button type="primary" icon="search" @click="search">项目中搜索</el-button>

                        <el-button type="primary" icon="add" @click="addTestCase">新增用例</el-button>
                    </div>
                    <el-table :data="tableData" border class="table" ref="multipleTable" @selection-change="handleSelectionChange">
                        <el-table-column type="selection" width="55" align="center"></el-table-column>
                        <el-table-column prop="case_name" label="用例名称" width="200">
                        </el-table-column>
                        <el-table-column prop="case_desc" label="描述">
                        </el-table-column>

                        <el-table-column label="操作" align="center" width="300">
                            <template slot-scope="scope">
                                <el-button type="text" icon="el-icon-plus" @click="testSteps(scope.$index, scope.row)">测试步骤</el-button>
                                <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                                <el-button type="text" icon="el-icon-delete" class="red" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination">
                        <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="1000">
                        </el-pagination>
                    </div>
                </div>
            </el-col>
        </el-row>

        <!--用例编辑框-->
        <el-dialog title="测试用例" :visible.sync="caseDialogVisible" style="width: 60%; left: 10%" :close-on-click-modal="false" center>
            <el-form ref="form" :model="caseForm" label-width="90px">
                <el-form-item label="用例名称:">
                    <el-input v-model="caseForm.case_name"></el-input>
                </el-form-item>
                <el-form-item label="所属模块:">
                    <select-tree v-model="caseForm.module_id" :options="modules" :props="moduleProps" width="200" @select="selectTreeChange"/>
                </el-form-item>
                <el-form-item label="描述:">
                    <el-input type="textarea" :rows="6" v-model="caseForm.case_desc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="caseDialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">保 存</el-button>
            </span>
        </el-dialog>
        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>

        <!--测试步骤-->
        <el-dialog title="测试步骤" :visible.sync="testStepsVisible" style="width: 90%" :close-on-click-modal="false" center>
            <el-form ref="form" :model="stepForm">
                <el-row :gutter="5">
                    <el-card shadow="always">
                        <div slot="header">
                            <span style="font-weight:bold">{{stepForm.caseName}}</span>
                        </div>
                        <el-col>
                            <el-form-item>
                                <div>{{stepForm.caseDesc}}</div>
                            </el-form-item>
                        </el-col>
                    </el-card>
                </el-row>
                <el-row>
                    <el-table :data="stepForm.stepTable" border class="table" >
                        <el-table-column prop="index" label="序号" width="50"/>
                        <el-table-column prop="api_name" label="接口名称" width="150"/>
                    </el-table>

                </el-row>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
    import SelectTree from '../common/SelectTree'
    import { getAllUserProjectList, getTestCaseByPid, getModuleByPid, saveCaseByModuleId, getCaseStepsByCaseId } from '../../scripts/api'
    export default {
        name: 'TestCase',
        components: {SelectTree},
        data() {
            return {
                project_options: [],
                modules:[],
                tableData: [],
                select_project:'',
                select_projectName:'',
                select_module:'',
                search_word: '',
                cur_page: 1,
                page_size: 10,
                multipleSelection: [],
                select_cate: '',
                del_list: [],
                is_search: false,
                caseDialogVisible: false,
                caseForm: {
                    case_id: '',
                    case_name:'',
                    module_id:'',
                    case_desc:''
                },
                delVisible: false,
                // 数据默认字段
                moduleProps: {
                    parent: 'parentid',   // 父级唯一标识
                    value: 'id',          // 唯一标识
                    label: 'label',       // 标签显示
                    children: 'children', // 子级
                },
                //测试步骤相关
                testStepsVisible: false,
                stepForm: {
                    caseName: '',
                    caseDesc: '',
                    stepTable: '',
                    stepData: ''
                },

                idx: -1,
                pos: 0
            }
        },
        created() {
            this.getProjects();
        },
        mounted() {
        },
        computed: {
        },
        methods: {
            handleCurrentChange() {
                this.cur_page = val;
            },
            handleCheckChange(item) {
                this.select_module = item.id;
                this.getTableData();
            },
            getModule(selVal) {
                this.modules = [];
                let params = { id: this.select_project };
                getModuleByPid(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.modules = response.data;
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
                this.getTableData();
            },
            getTableData() {
                this.tableData = [];
                let params = { projectId: this.select_project, moduleId: this.select_module };
                getTestCaseByPid(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.tableData = response.data;
                        if (this.tableData.length <1)
                            this.$message.info('暂无测试用例')
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            getProjects() {
                let params = {
                    uid: localStorage.getItem('uid'),
                    keyword: this.search_word,
                    page_size: this.page_size,
                    cur_page: this.cur_page
                };
                getAllUserProjectList(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        response.data.projects.forEach(item=>{
                           this.project_options.push({value:item.id, label:item.project});
                        });
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },

            search() {
                this.is_search = true;
                this.select_module = '',
                    this.getTableData();
            },

            addTestCase() {
                this.caseForm.case_id = '';
                this.caseForm.case_name = '';
                this.caseForm.case_desc = '';
                this.caseForm.module_id = this.select_module;
                this.caseDialogVisible = true;
            },

            testSteps(index, row) {
                // console.log(this.project_options);
                // console.log(this.select_project);
                this.project_options.forEach(item=>{
                    if (item.value === this.select_project) {
                        this.select_projectName = item.label;
                    }
                });
                this.$router.push({
                    path: '/testcase/step',
                    query: {
                        projectId: this.select_project,
                        projectName: this.select_projectName,
                        caseId: row.id,
                        caseName: row.case_name
                    }
                });
                console.log('done')
                // this.stepForm.caseName = row.case_name;
                // this.stepForm.caseDesc = row.case_desc;
                // let params = { caseId: row.id, projectId: row.project_id, moduleId: row.module_id};
                // getCaseStepsByCaseId(params).then(response => {
                //     let code = response.code;
                //     let msg = response.msg;
                //     if (code == 200) {
                //         this.stepForm.stepTable = response.data;
                //     } else {
                //         this.$message.error(msg.trim());
                //     }
                //     this.testStepsVisible = true;
                // }).catch(error => {
                //     this.$message.error(error);
                // });
            },
            handleEdit(index, row) {
                this.caseForm.case_id = row.id;
                this.caseForm.case_name = row.case_name;
                this.caseForm.case_desc = row.case_desc;
                this.caseForm.module_id = row.module_id;
                this.caseDialogVisible = true;
            },
            handleDelete(index, row) {
                this.idx = index;
                this.delVisible = true;
            },
            delAll() {
                const length = this.multipleSelection.length;
                let str = '';
                this.del_list = this.del_list.concat(this.multipleSelection);
                for (let i = 0; i < length; i++) {
                    str += this.multipleSelection[i].name + ' ';
                }
                this.$message.error('删除了' + str);
                this.multipleSelection = [];
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 保存编辑
            saveEdit() {
                let params = { caseId: this.caseForm.case_id, caseName: this.caseForm.case_name, caseDesc:this.caseForm.case_desc, projectId: this.select_project, moduleId: this.caseForm.module_id};
                saveCaseByModuleId(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success('保存成功');
                        this.getTableData();
                    } else {
                        this.$message.error(msg.trim());
                    }
                    this.caseDialogVisible = false;
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            // 确定删除
            deleteRow(){
                this.tableData.splice(this.idx, 1);
                this.$message.success('删除成功');
                this.delVisible = false;
            },
            delMore() {
                // this.delMoreVisible = true;
            },
            selectTreeChange(item) {
                console.log('selectTreeChange')
                console.log(item)
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
