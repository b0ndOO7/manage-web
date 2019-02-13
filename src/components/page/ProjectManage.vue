<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-cascades"></i> 我的项目</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="delete" class="handle-del" @click="delAll">删除项目</el-button>
                项目名称:
                <el-input v-model="search_word" placeholder="输入要查询的项目关键词" class="handle-input"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
                <el-button type="primary" icon="add" class="handle-del" @click="addProject">新增项目</el-button>
                <el-button type="primary" icon="add" class="handle-del" @click="addVersion">新增版本</el-button>
            </div>
            <!--列表-->
            <el-table :data="data" border class="table" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="project" label="项目名称" sortable width="200">
                </el-table-column>
                <el-table-column prop="type" label="类型" width="80">
                </el-table-column>
                <el-table-column prop="version" label="项目版本" width="120" sortable>
                </el-table-column>
                <el-table-column prop="remark" label="项目描述">
                </el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑
                        </el-button>
                        <el-button type="text" icon="el-icon-delete" class="red"
                                   @click="handleDelete(scope.$index, scope.row)">删除版本
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next"
                               :total="totalRow">
                </el-pagination>
            </div>
            <div type="text">注： 新增项目后，要添加项目版本，否则列表中不显示项目</div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="修改项目" :visible.sync="editVisible" style="width: 70%; left: 10%">
            <el-form ref="form" :model="editForm" :rules="editProjectRules" label-width="90px">
                <el-form-item label="项目名称:" prop="pname">
                    <el-input v-model="editForm.pname" readonly></el-input>
                </el-form-item>
                <el-form-item label="类型:" prop='type'>
                    <el-select v-model="editForm.type" placeholder="请选择">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="版本号:" prop="version">
                    <el-input v-model="editForm.version"></el-input>
                </el-form-item>
                <el-form-item label="描述:">
                    <el-input type="textarea" :rows="6" v-model="editForm.remark"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">保 存</el-button>
            </span>
        </el-dialog>

        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="400px" center>
            <div class="del-dialog-cnt">确定要删除项目版本:{{delProject.project}}-{{delProject.version}}？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 新增项目弹出框 -->
        <el-dialog title="新增项目" :visible.sync="addVisible" :close-on-click-modal="false" style="width: 80%; left: 5%">
            <el-form :model="addProjectForm" label-width="90px" :rules="addProjectRules" ref="addProjectForm">
                <el-form-item label="项目名称:" label-width="90px" prop="pname">
                    <el-input v-model.trim="addProjectForm.pname" auto-complete="off"></el-input>
                </el-form-item>
                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="类型:" prop='type'>
                            <el-select v-model="addProjectForm.type" placeholder="请选择">
                                <el-option v-for="item in options" :key="item.value" :label="item.label"
                                           :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addProjectSubmit">添加</el-button>
            </div>
        </el-dialog>

        <!-- 新增版本弹出框 -->
        <el-dialog title="新增版本" :visible.sync="addVersionVisible" :close-on-click-modal="false" style="width: 80%; left: 5%">
            <el-form :model="addVersionForm" label-width="90px" :rules="addVersionRules" ref="addProjectForm">
                <el-form-item label="项目名称:" label-width="90px" prop="pname">
                    <!--<el-input v-model.trim="addVersionForm.pname" auto-complete="off"></el-input>-->
                    <el-select v-model="addVersionForm.projectid" placeholder="请选择">
                        <el-option v-for="item in projects" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="版本号:" prop='version'>
                    <el-input v-model.trim="addVersionForm.version" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="描述:" prop='remark'>
                    <el-input type="textarea" :rows="6" v-model="addVersionForm.remark"></el-input>
                    <!--<quill-editor ref="myTextEditor" v-model="addProjectForm.desc" :options="editorOption"></quill-editor>-->
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addVersionVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addVersionSubmit">添加</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    // import AreaEditor from './AreaEditor'
    import {getUserProjectList, getAllUserProjectList, addProject, addVersion, editProject, deleteVersion, deleteAll} from '../../scripts/api'
    import {quillEditor} from 'vue-quill-editor';

    export default {
        components: {
            quillEditor
        },
        data() {
            return {
                tableData: [],
                cur_page: 1,
                multipleSelection: [],
                search_word: '',
                del_list: [],
                page_size: 10,
                totalRow: 1,
                idx: -1,
                // 编辑项目相关
                editVisible: false,
                editForm: {
                    id: '',
                    pname: '',
                    type: '',
                    version: '',
                    versionId: '',
                    remark: ''
                },
                editProjectRules: {
                    pname: [
                        {required: true, message: '请输入项目名称', trigger: 'blur'},
                        {min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur'}
                    ],
                    type: [
                        {required: true, message: '请选择类型', trigger: 'blur'}
                    ]
                },
                addVersionRules: {
                    version: [
                        {required: true, message: '请输入版本号', trigger: 'blur'},
                        {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
                    ],
                    remark: [
                        {max: 1024, message: '不能超过1024个字符', trigger: 'blur'}
                    ]
                },
                // 删除项目相关
                delVisible: false,
                delProject: {},

                // 新增项目相关
                addVisible: false,
                addProjectRules: {
                    pname: [
                        {required: true, message: '请输入名称', trigger: 'blur'},
                        {min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur'}
                    ],
                    type: [
                        {required: true, message: '请选择类型', trigger: 'blur'}
                    ]
                },
                addProjectForm: {
                    id: '',
                    pname: '',
                    type: ''
                },

                //新增版本相关
                addVersionVisible: false,
                projects: [],
                addVersionForm: {
                    projectid: '',
                    pname: '',
                    type: '',
                    version: '',
                    remark: ''
                },


                options: [{label: "web", value: "web"}, {label: "app", value: "app"}]
            }
        },
        created() {
            this.getProjectList();
        },
        computed: {
            data() {
                return this.tableData
            }
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getProjectList();
            },
            // 项目列表
            getProjectList() {
                this.tableData = [];
                let params = {
                    uid: localStorage.getItem('uid'),
                    keyword: this.search_word,
                    page_size: this.page_size,
                    cur_page: this.cur_page
                };
                getUserProjectList(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.tableData = response.data.projects;
                        this.totalRow = response.data.totalrow;
                        if (this.tableData.length == 0) {
                            this.$message.info("用户暂无项目")
                        }
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },

            search() {
                this.cur_page = 1;
                this.getProjectList();
            },
            handleEdit(index, row) {
                this.idx = index;
                const item = this.tableData[index];
                this.editForm = {
                    id: item.id,
                    pname: item.project,
                    type: item.type,
                    version: item.version,
                    versionId: item.versionId,
                    remark: item.remark
                }
                this.editVisible = true;
            },
            handleDelete(index, row) {
                this.idx = index;
                this.delVisible = true;
                this.delProject = row;
            },
            delAll() {
                const length = this.multipleSelection.length;
                let str = '';
                this.del_list = this.del_list.concat(this.multipleSelection);
                for (let i = 0; i < length; i++) {
                    str += this.multipleSelection[i].project + ' ';
                }
                let params = this.multipleSelection;
                deleteAll(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success('删除成功!删除了：' + str);
                        this.multipleSelection = [];
                        this.cur_page = 1;
                        // setTimeout("this.getProjectList()",2000);
                        this.getProjectList()
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 保存编辑
            saveEdit() {
                let params = {
                    uid: localStorage.getItem('uid'),
                    id: this.editForm.id,
                    type: this.editForm.type,
                    version: this.editForm.version,
                    versionId: this.editForm.versionId,
                    project: this.editForm.pname,
                    remark: this.editForm.remark
                };
                editProject(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.editVisible = false;
                        this.$message.success(`项目: ${this.editForm.pname} 修改成功！！`);
                        this.getProjectList();
                        this.editForm = {};
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            // 确定删除
            deleteRow() {
                let params = this.delProject;
                deleteVersion(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success('删除成功');
                        this.delProject = {};
                        this.cur_page = 1;
                        this.getProjectList();
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
                this.delVisible = false;
            },
            // 新增项目
            addProject() {
                this.addVisible = true;
            },
            addProjectSubmit() {
                let params = {
                    uid: localStorage.getItem('uid'),
                    type: this.addProjectForm.type,
                    version: this.addProjectForm.version,
                    project: this.addProjectForm.pname,
                    remark: this.addProjectForm.remark
                };
                addProject(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.addVisible = false;
                        this.getProjectList();
                        this.addProjectForm = {};
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },

            //新增版本
            addVersion() {
                this.projects = [];
                let params = { uid: localStorage.getItem('uid') };
                getAllUserProjectList(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        let all = response.data.projects;
                        if (all.length == 0) {
                            this.$message.info("获取项目失败")
                        }
                        all.forEach((item)=>{
                            this.projects.push({ value: item.id, label: item.project});
                        });
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
                this.addVersionVisible = true;
            },
            addVersionSubmit(){
                let params = { uid: localStorage.getItem('uid'), id: this.addVersionForm.projectid, version: this.addVersionForm.version.trim(), remark: this.addVersionForm.remark.trim() };
                addVersion(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.addVersionVisible = false;
                        this.getProjectList();
                        this.addProjectForm = {};
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },










            querySearch(queryString, cb) {
                let projects = [];
                for (let i = 0; i < this.tableData.length; i++) {
                    if (this.tableData[i].pname) {
                        projects.push(this.tableData[i].pname)
                    }
                }
                let tableData = this.tableData;
                let results = queryString ? projects.filter(this.createFilter(queryString)) : tableData;
                cb(results);
            },
            createFilter(queryString) {
                return (restaurant) => {
                    return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                };
            },
            handleSelect(item) {
                this.addProjectForm.pname = item;
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

    .del-dialog-cnt {
        font-size: 16px;
        text-align: center
    }

    .table {
        width: 100%;
        font-size: 14px;
    }
</style>
