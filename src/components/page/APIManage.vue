<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-cascades"></i> 接口管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-row :gutter="5">
            <el-col :span="4" >
                <div class="container">
                    <el-card shadow="hover" :body-style="{padding: '0px'}" >
                        <div slot="header" class="clearfix">
                            <span align="center">项目列表|模块(todo)</span>
                        </div>
                        <el-tree v-loading="tree_loading" ref="project_tree"
                                 :data="projects"
                                 node-key="id"
                                 :highlight-current="true"
                                 accordion
                                 @node-click="handleCheckChange">
                        </el-tree>
                </el-card>
                </div>
            </el-col>
            <el-col :span="20" >
                <div class="container">
                    <div class="handle-box">
                        <el-button type="primary" icon="delete" class="handle-del" @click="delMore">批量删除</el-button>
                        <el-input v-model="search_word" placeholder="筛选接口关键字" class="handle-input" clearable></el-input>
                        <el-button type="primary" icon="search" @click="search">搜索</el-button>
                        <el-button type="primary" @click="addRecord">添加接口</el-button>
                    </div>

                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <el-table :data="tableData" v-loading="table_loading" stripe highlight-current-row class="table" ref="multipleTable" @selection-change="handleSelectionChange">
                            <el-table-column type="selection" width="55" align="center"></el-table-column>
                            <el-table-column prop="apiname" label="接口名称" width="200">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.editFlag">
                                        <span>{{ scope.row.api_name }}</span>
                                    </div>
                                    <div v-else>
                                        <el-input v-model="scope.row.api_name" placeholder="输入接口名称"></el-input>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="method_type" label="请求方法" width="110">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.editFlag">
                                        <span>{{ scope.row.method_type }}</span>
                                    </div>
                                    <div v-else>
                                        <el-select v-model="scope.row.method_type"
                                                   clearable
                                                   placeholder="选择请求类型">
                                            <el-option v-for="item in methodtypes" :key="item.value" :value="item.value" :label="item.label"></el-option>
                                        </el-select>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="domain" label="域名(选择todo)"  width="250">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.editFlag">
                                        <span>{{ scope.row.domain }}</span>
                                    </div>
                                    <div v-else>
                                        <el-input v-model="scope.row.domain" placeholder="选择或输入域名"></el-input>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="uri" label="接口地址">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.editFlag">
                                        <span>{{ scope.row.uri }}</span>
                                    </div>
                                    <div v-else>
                                        <el-input v-model="scope.row.uri" placeholder="输入接口地址"></el-input>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="status" label="禁用/启用" align="center" width="80">
                                <template slot-scope="scope">
                                    <el-switch @change="changeStatus(scope.row)"
                                            v-model="scope.row.status"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949">
                                    </el-switch>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="180" align="center">
                                <template slot-scope="scope">
                                    <el-button type="text" icon="el-icon-info" @click="handleInfo(scope.$index, scope.row)">详情</el-button>
                                    <el-button type="text" v-if="!scope.row.editFlag" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                                    <el-button type="text" v-if="!scope.row.editFlag" icon="el-icon-delete" class="red" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                                    <el-button type="text" v-if="scope.row.editFlag" icon="el-icon-success" @click="handleSave(scope.$index, scope.row)">保存</el-button>
                                    <el-button type="text" v-if="scope.row.editFlag" icon="el-icon-warning" @click="handleCancel(scope.$index, scope.row)">取消</el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div class="pagination">
                            <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalRow">
                            </el-pagination>
                        </div>
                    </el-card>
                </div>
            </el-col>
        </el-row>

        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 批量删除提示框 -->
        <el-dialog title="提示" :visible.sync="delMoreVisible" width="320px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定批量删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delMoreVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteMore">确 定</el-button>
            </span>
        </el-dialog>


        <!-- 测试用例调式、模板界面 -->
        <el-dialog title="接口调试" :visible.sync="debugVisible" :close-on-click-modal="false" center>
            <el-form ref="form" class="form" :model="ruleForm">
                <el-row :gutter="5">
                    <el-card shadow="always">
                        <div slot="header">
                            <span style="font-weight:bold">{{ruleForm.apiname}}</span>
                            <el-button style="float: right; padding: 8px 0" type="primary" @click="saveApiInfo">保存请求模板</el-button>
                        </div>
                        <el-form-item>
                            <el-col :span="3">
                                <el-select v-model="ruleForm.methodtype">
                                    <el-option v-for="item in methodtypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-col>
                            <el-col :span="3">
                                <el-select v-model="ruleForm.protocol_type">
                                    <el-option v-for="item in protocol_types" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item>
                                    <el-input v-model="ruleForm.apiurl"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6" align="center">
                                <el-button type="primary" round @click="debugApi">调试</el-button>
                            </el-col>
                        </el-form-item>
                    </el-card>
                </el-row>
                <el-row :gutter="1">
                    <el-col :span="12">
                        <el-card shadow="always">
                            <div slot="header" class="clearfix">
                                <span>请求数据</span>
                            </div>
                            <el-collapse v-model="activeName">
                                <el-collapse-item title="请求头" name="header">
                                    <div>
                                        <el-row :gutter="5">
                                            <el-col align="center" :span="8">
                                                Header
                                            </el-col>
                                            <el-col align="center" :span="10">
                                                值
                                            </el-col>
                                            <el-col align="center" :span="2">
                                                可变
                                            </el-col>
                                        </el-row>
                                    </div>
                                    <div v-for="(item,index) in ruleForm.headers" :key="index">
                                        <el-form-item>
                                            <el-row :gutter="5">
                                                <el-col :span="8">
                                                    <el-input v-model="item.request_key" placeholder="请求头key"></el-input>
                                                </el-col>
                                                <el-col :span="10">
                                                    <el-input v-model="item.request_value" placeholder="请求头value"></el-input>
                                                </el-col>
                                                <el-col align="center" :span="2">
                                                    <el-checkbox v-model="item.iscorrelation"></el-checkbox>
                                                </el-col>
                                                <el-col :span="4">
                                                    <el-button type="text" icon="el-icon-delete" class="red" @click="deleteHeader(index)">删除</el-button>
                                                </el-col>
                                            </el-row>
                                        </el-form-item>
                                    </div>
                                    <el-button type="text" align="center" @click="addHeader">添加请求头</el-button>
                                </el-collapse-item>
                                <el-collapse-item title="请求body" name="body">
                                    <el-radio-group v-model="ruleForm.bodytype">
                                        <el-radio label="form" border size="mini">form格式</el-radio>
                                        <el-radio label="json" border size="mini" :disabled="isgetmethod">json格式</el-radio>
                                    </el-radio-group>
                                    <div v-if="ruleForm.bodytype == 'form'">
                                        <div>
                                            <el-row :gutter="5">
                                                <el-col align="center" :span="8">
                                                    参数名
                                                </el-col>
                                                <el-col align="center" :span="10">
                                                    参数值
                                                </el-col>
                                                <el-col align="center" :span="3">
                                                    关联项
                                                </el-col>
                                            </el-row>
                                        </div>
                                        <div v-for="(item,index) in ruleForm.form" :key="index">
                                            <el-form-item>
                                                <el-row :gutter="5">
                                                    <el-col :span="8">
                                                        <el-input v-model="item.request_key" placeholder="参数名"></el-input>
                                                    </el-col>
                                                    <el-col :span="10">
                                                        <el-input v-model="item.request_value" placeholder="参数值"></el-input>
                                                    </el-col>
                                                    <el-col align="center" :span="2">
                                                        <el-checkbox v-model="item.iscorrelation"></el-checkbox>
                                                    </el-col>
                                                    <el-col :span="4">
                                                        <el-button type="text" icon="el-icon-delete" class="red" @click="deleteParam(index)">删除</el-button>
                                                    </el-col>
                                                </el-row>
                                            </el-form-item>
                                        </div>
                                        <el-button type="text" align="center" @click="addParam">添加参数</el-button>
                                    </div>
                                    <div v-if="ruleForm.bodytype == 'json'">
                                        <br/>
                                        <el-input type="textarea" :rows="6" v-model="ruleForm.jsonstr" placeholder="请输入请求json数据"></el-input>
                                    </div>
                                </el-collapse-item>
                            </el-collapse>
                        </el-card>
                    </el-col>
                    <el-col :span="12">
                        <el-card shadow="always" :span="12">
                            <div slot="header" class="clearfix">
                                <span>响应结果</span>
                            </div>
                            <span>响应状态：{{ruleForm.resp_status}}</span>
                            <br>
                            <el-input type="textarea" rows="6" v-model="ruleForm.respone" placeholder="响应数据" readonly></el-input>
                        </el-card>
                    </el-col>
                </el-row>
                <!--<el-form-item>-->
                    <!--<el-button type="primary" @click="submitForm('ruleForm')">调试</el-button>-->
                    <!--<el-button @click="debugVisible = false">重置</el-button>-->
                <!--</el-form-item>-->
            </el-form>
        </el-dialog>

    </div>
</template>

<script>
    import {getUserApiList, getAllUserProjectList, getProjectVersions, saveTestApi, deleteTestApi, changeTestApiStatus, getUserProjectAndModule,
        getTestApiInfo, saveTestApiInfo, debugTestApi} from '../../scripts/api'

    export default {
        data() {
            return {
                uid: localStorage.getItem('uid'),
                tmpData: [],
                tableData: [],
                totalRow: 1,
                projects: [],
                props: {
                    label: 'label',
                    value: 'id',
                    children: 'children'
                },
                select_projects: [],
                select_module: [],
                select_data: '',
                select_versions: [],
                cur_page: 1,
                page_size: 10,
                multipleSelection: [],
                select_cate: '',
                search_word: '',
                del_list: [],
                // is_search: false,
                delMoreVisible: false,
                delVisible: false,
                debugVisible: false,
                ruleForm: {
                    uid: localStorage.getItem('uid'),
                    apiid:'',
                    apiname:'',
                    project_id:'',
                    protocol_type:'',
                    methodtype: '',
                    apiurl:'',
                    resp_status: '',
                    respone: '',
                    headers: [{
                        request_key: '',
                        request_value: '',
                        iscorrelation: ''
                    }],
                    bodytype:'',
                    form: [{
                        request_key:'',
                        request_value:'',
                        iscorrelation:''
                    }],
                    jsonstr:''
                },
                idx: -1,
                table_loading: false,
                tree_loading: true,

                methodtypes: [{value: 'GET', label: 'GET'},{value: 'POST', label: 'POST'},{value: 'PUT', label: 'PUT'},{value: 'DELETE', label: 'DELETE'}],
                protocol_types: [{value: 'HTTP', label: 'HTTP'},{value: 'HTTPS', label: 'HTTPS'}],
                activeName: ['header', 'body']
            }
        },
        created() {
            // this.getApiList();
            this.getProjectAndModule();
        },
        computed: {
            isgetmethod() {
                if (this.ruleForm.methodtype == 'GET') {
                    this.ruleForm.bodytype = 'form';
                    return true;
                }else {
                    return false;
                }
            },
            tree_project() {
            }
        },
        methods: {
            handleCheckChange(data) {
                this.search_word = '';
                // console.log(this.search_word)
                this.select_data = data;
                this.select_module = [];
                this.select_module.push(data.id);
                this.getApiList();
            },
            getProjectAndModule() {
                let params = {  uid: localStorage.getItem('uid') };
                getUserProjectAndModule(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.projects = response.data;
                        this.tree_loading = false;
                    } else {
                        this.$message.error(msg.trim());
                    }
                    // console.log('projects', this.projects)
                }).catch(error => {
                    this.$message.error(error);
                });
            },

            getProjects() {
                let params = {  uid: localStorage.getItem('uid') };
                getAllUserProjectList(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.projects = response.data.projects;
                        this.tree_loading = false;
                        // 项目下拉框数据、及接口状态处理
                        this.projects.forEach((item)=>{
                            this.select_projects.push({id: item.id, project: item.project, label: item.project, children: ''});
                        });
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            getApiList() {
                this.tableData = [];
                let params = {
                    uid: localStorage.getItem('uid'),
                    keyword: this.search_word,
                    page_size: this.page_size,
                    cur_page: this.cur_page,
                    seach_module: this.select_module
                };
                getUserApiList(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.tableData = response.data.apis;
                        this.totalRow = response.data.totalRow;
                        this.table_loading = false;
                        if (this.tableData.length == 0) {
                            this.$message.info("用户暂无接口，请添加")
                        };
                        this.tableData.forEach((item)=>{
                            item.status = item.status==0 ? true:false;
                        });
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            // 获取项目版本号
            getCurrentProjectVersions(index, row) {
                this.select_versions = [];
                this.select_projects.forEach((item)=>{
                    if (item.project == this.tableData[index].project){
                        this.tableData[index].project_id = item.id;
                    }
                })
                let params = { uid: this.uid, projectId: this.tableData[index].project_id };
                getProjectVersions(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        let versions = response.data;
                        if (versions.length == 0) {
                            this.$message.info("用户暂无版本，若需要请返回项目管理页面添加该项目版本")
                        } else {
                            versions.forEach((item)=>{
                                this.select_versions.push({version: item.version, id: item.id})
                            })
                        }
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            checkVersions(index, row) {
                if (this.select_versions.length == 0) {
                    this.getCurrentProjectVersions(index, row);
                }
            },
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getApiList();
            },

            search() {
                // this.is_search = true;
                if (!this.select_module.length) {
                    this.$message.warning("请选择项目、模块");
                    return;
                }
                this.getApiList();
            },
            formatter(row, column) {
                return row.address;
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            handleEdit(index, row) {
                this.$set(this.tableData[index], 'editFlag', true);
            },
            handleSave(index, row) {
                let record = this.tableData[index];
                let selected = this.select_data;
                let params = { uid: this.uid,
                    id: record.id,
                    projectId: selected.projectid,
                    moduleId: selected.module ? selected.id:'',
                    apiName: record.api_name,
                    apiProtoType: record.protocol_type,
                    apiMethodType: record.method_type,
                    domain: record.domain,
                    uri: record.uri
                };
                saveTestApi(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success("保存成功");
                        this.getApiList();
                        this.$set(this.tableData[index], 'editFlag', false);
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
            handleDelete(index, row) {
                this.idx = index;
                this.delVisible = true;
            },
            //scope.row.editFlag=false
            handleCancel(index, row) {
                let record = this.tableData[index];
                if (record.id) {
                    this.tableData[index].editFlag=false;
                } else {
                    this.tableData.splice(index,1);
                }
            },
            // 确定删除
            deleteRow(){
                let params = { uid: this.uid, apiIds: [this.tableData[this.idx].id]};
                deleteTestApi(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success("删除成功");
                        this.getApiList();
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
                this.delVisible = false;
            },
            delMore() {
                this.delMoreVisible = true;
            },
            deleteMore() {
                const length = this.multipleSelection.length;
                let ids = [];
                let apis = [];
                this.del_list = this.del_list.concat(this.multipleSelection);
                for (let i = 0; i < length; i++) {
                    ids.push(this.multipleSelection[i].id);
                    apis.push(this.multipleSelection[i].apiname);
                }
                let params = { uid: this.uid, apiIds: ids };
                deleteTestApi(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success("删除成功,删除了\"" + apis + "\"!!!");
                        this.multipleSelection = [];
                        this.delMoreVisible = false;
                        this.getApiList();
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            changeStatus(row) {
                if (!row.id) {
                    this.$message.warning("新增接口请先保存！！！");
                    return;
                }
                let params = { uid: this.uid, apiId: row.id.toString(), status: row.status };
                changeTestApiStatus(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success("更新成功!!!");
                        // this.getApiList();
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            addRecord () {
                this.tableData = this.tableData || []
                this.tableData.push({
                    id:'',
                    project_id: '',
                    project:'',
                    module_id:'',
                    module:'',
                    apiname: '',
                    protocol_type: '',
                    method_type: '',
                    domain: '',
                    uri: '',
                    status: true,
                    editFlag: true
                })
            },
            setProjectId(index) {
                let project = this.tableData[index].project;
                this.select_projects.forEach((item)=>{
                    if (project == item.project) {
                        this.tableData[index].project_id = item.id;
                    }
                })
            },
            handleChange() {
            },

            handleInfo(index,row) {
                let params = { uid: this.uid, apiId: row.id };
                getTestApiInfo(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.ruleForm.apiid = response.data.id;
                        this.ruleForm.project_id = response.data.project_id;
                        this.ruleForm.apiname = response.data.api_name;
                        this.ruleForm.apiurl = response.data.domain + response.data.uri;
                        this.ruleForm.methodtype = response.data.method_type;
                        this.ruleForm.protocol_type = response.data.protocol_type;
                        if (response.data.headers.length==0) {
                            this.ruleForm.headers[0].iscorrelation = 0;
                            this.ruleForm.headers[0].request_key = '';
                            this.ruleForm.headers[0].request_value = '';
                        } else {
                            this.ruleForm.headers = response.data.headers;
                        }
                        if (response.data.form.length==0) {
                            this.ruleForm.form[0].iscorrelation = 0;
                            this.ruleForm.form[0].request_key = '';
                            this.ruleForm.form[0].request_value = '';
                        }else {
                            this.ruleForm.form = response.data.form;
                        }
                        this.ruleForm.respone = '';
                        this.ruleForm.resp_status = '',
                        this.ruleForm.bodytype = response.data.bodytype ? response.data.bodytype:'form';
                        this.ruleForm.jsonstr = response.data.jsonstr;
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
                this.debugVisible = true;
            },

            saveApiInfo() {
                saveTestApiInfo(this.ruleForm).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success("api参数保存成功");
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },

            deleteHeader(index) {
                this.ruleForm.headers.splice(index,1);
                if (this.ruleForm.headers.length == 0) {
                    this.ruleForm.headers.push({iscorrelation:'', request_key:'', request_value:''})
                }
            },
            addHeader() {
                this.ruleForm.headers.push({iscorrelation:'', request_key:'', request_value:''})
            },
            addParam() {
                this.ruleForm.form.push({request_key:'', request_value:'', iscorrelation:''});
            },
            deleteParam(index){
                this.ruleForm.form.splice(index,1);
                if (this.ruleForm.form == 0) {
                    this.ruleForm.form.push({request_key:'', request_value:'', iscorrelation:''});
                }
            },

            debugApi(){
                debugTestApi(this.ruleForm).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    console.log(response.data)
                    if (code == 200) {
                        this.ruleForm.respone = response.data.respStr;
                        this.ruleForm.resp_status = response.data.statusCode;
                        this.$message.success("接口请求成功，请检查响应结果");
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            selectBodyTypeRadio(value) {
            }
        }
    }

</script>

<style>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
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
    .red{
        color: #ff0000;
    }

    .cell-edit-input {
        width: 100px;
    }

    .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
        background-color: #4288ff;
    }

    .form .half-left {
        width:50%; padding-left:1rem; padding-right:1rem; padding-top:1rem;
    }
    .form .quarter {
        width:25%; padding-left:1rem; padding-right:1rem; padding-top:1rem;
    }
    .form .fifth {
        width:20%; padding-left:1rem; padding-right:1rem; padding-top:1rem;
    }
    .form .eighth {
        width:12.5%; padding-left:1rem; padding-right:1rem; padding-top:1rem;
    }
    .form .half-right {
        width:50%; padding-left:1rem; padding-right:1rem; padding-top:1rem;
    }
</style>
