<template>
    <div class="table">
        <el-row :gutter="5">
            <el-col :span="4" >
                <div>
                    <el-card shadow="hover" :body-style="{padding: '0px'}" >
                        <div slot="header">
                            <el-select v-model="select_project" filterable placeholder="请选择项目" @change="getModule">
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
                        <el-button type="primary" icon="search" @click="search">搜索</el-button>

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
        <el-dialog title="测试用例" :visible.sync="caseDialogVisible" style="width: 70%; left: 10%">
            <el-form ref="form" :model="caseForm" label-width="90px">
                <el-form-item label="用例名称:">
                    <el-input v-model="caseForm.case_name"></el-input>
                </el-form-item>
                <el-form-item label="所属模块:">
                    <el-select v-model="caseForm.module_id" placeholder="请选择">
                        <el-option v-for="item in modules" :key="item.id" :label="item.module" :value="item.id">
                        </el-option>
                    </el-select>
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
    </div>
</template>

<script>
    import { getAllUserProjectList, getTestCaseByPid, getModuleByPid,saveCaseByModuleId } from '../../scripts/api'
    export default {
        name: 'basetable',
        data() {
            return {
                project_options: [],
                modules:[],
                tableData: [],
                select_project:'',
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
                    case_name:'',
                    module_id:'',
                    case_desc:''
                },
                delVisible: false,

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
            getModule() {
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
                    this.select_module = '';
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

            addTestCase() {

            },

            search() {
                this.is_search = true;
                this.getTableData();
            },

            testSteps(index, row) {
                console.log(row);
            },
            handleEdit(index, row) {
                console.log(this.caseForm);
                this.caseForm.case_name = row.case_name;
                this.caseForm.case_desc = row.case_desc;
                this.caseForm.module_id = this.select_module;
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
                console.log(this.caseForm);
                this.caseDialogVisible = false;
                saveCaseByModuleId(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success('保存成功')
                    } else {
                        this.$message.error(msg.trim());
                    }
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
