<template>
    <div class="template-manage">
        <div class="temp-title">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-cascades"></i> HOST配置</el-breadcrumb-item>
            </el-breadcrumb>
            <el-button align="center"
                       size="small"
                       type="primary"
                       icon="el-icon-circle-plus-outline"
                       @click="addRecord">新增项目HOST
            </el-button>
        </div>
        <div class="container">
            <el-table class="table" border
                      :data="showData"
                      style="width: 100%">
                <el-table-column label="项目名称" prop="project" width="200" sortable>
                    <template slot-scope="scope">
                        <div v-if="scope.row.editFlag && !scope.row.project">
                            <el-select v-model="scope.row.project" placeholder="选择项目">
                                <el-option
                                    v-for="item in projects"
                                    :key="item[0]"
                                    :label="item[1]"
                                    :value="item[1]">
                                </el-option>
                            </el-select>
                        </div>
                        <div v-else>
                            <span>{{scope.row.project}}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="项目版本" width="150">
                    <template slot-scope="scope">
                        <div v-if="!scope.row.editFlag">
                            <span>{{ scope.row.version }}</span>
                        </div>
                        <div v-else>
                            <el-select v-model="scope.row.version" placeholder="选择版本">
                                <el-option
                                    v-for="item in versions[scope.row.project]"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="域名" prop="domain">
                    <template slot-scope="scope">
                        <div v-if="!scope.row.editFlag">
                            <span>{{ scope.row.domain }}</span>
                        </div>
                        <div v-else>
                            <el-input v-model="scope.row.domain" placeholder="请输入域名"></el-input>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="IP" width="150">
                    <template slot-scope="scope">
                        <div v-if="!scope.row.editFlag">
                            <span>{{ scope.row.ip }}</span>
                        </div>
                        <div v-else>
                            <el-input v-model="scope.row.ip" placeholder="请输入ip地址"></el-input>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="150">
                    <template slot-scope="scope">
                        <div>
                            <el-button
                                type="text"
                                v-if="!scope.row.editFlag"
                                icon="el-icon-edit"
                                @click="handleEdit(scope.$index, scope.row)">编辑
                            </el-button>
                            <el-button
                                type="text"
                                v-if="scope.row.editFlag"
                                icon="el-icon-success"
                                @click="handleSave(scope.$index, scope.row)">保存
                            </el-button>
                            <el-button type="text" icon="el-icon-delete" class="red"
                                v-if="!scope.row.editFlag"
                                @click="handleDelete(scope.$index, scope.row)">删除
                            </el-button>
                            <el-button type="text"  v-if="scope.row.editFlag" icon="el-icon-warning" @click="handleCancel(scope.$index, scope.row)">取消
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <!--<div class="pagination">-->
                <!--<el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalRow">-->
                <!--</el-pagination>-->
            <!--</div>-->
        </div>
    </div>
</template>

<script>
    import {getProjectHostByUid, saveProjectHost, deleteProjectHost} from '../../scripts/api'

    export default {
        data () {
            return {
                uid: localStorage.getItem('uid'),
                showData: [],
                tableData: [],
                versions:[],
                projects: [
                    {
                        projectId: '',
                        project: ''
                    }
                ],
                cur_page: 1,
                totalRow: 100
            }
        },
        created () {
            this.getProjectHostList();
            // this.tableData = JSON.parse(localStorage.getItem('tableData'));
        },
        computed: {
        },
        methods: {
            // 表格显示数据
            getShowData() {
                this.showData = [];
                this.tableData.forEach((item)=>{
                    if (item.id) {
                        this.showData.push(item);
                    }
                });
            },
            // 获取列表数据
            getProjectHostList() {
                this.tableData = [];
                let params = {uid: this.uid};
                getProjectHostByUid(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.tableData = response.data;
                        if (this.tableData.length == 0) {
                            this.$message.info("用户暂无项目")
                        }
                        this.getShowData();
                        this.setProjects();
                        console.log('tableData',this.tableData)
                        console.log('showData',this.showData)
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                // this.getProjectList();
            },
            // 选择下拉选项
            setRowData(index,row) {
                this.$set(this.showData[index], 'editFlag', true);
            },
            // 编辑
            handleEdit (index, row) {
                this.$set(this.showData[index], 'editFlag', true);
                this.setVersions(this.showData[index].project, row);
            },
            // 保存
            handleSave ($index, row) {
                let record = this.showData[$index];
                this.$set(record, 'editFlag', false);
                // localStorage.setItem('tableData', JSON.stringify(this.showData))
                let params = {uid: this.uid, id: record.id, ip: record.ip, projectId: record.projectId, version: record.version, domain: record.domain};
                saveProjectHost(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.$message.success(record.project + '保存成功');
                        this.getProjectHostList();
                    } else {
                        this.$message.error(msg.trim());
                    }
                }).catch(error => {
                    this.$message.error(error);
                });
            },
            // 取消
            handleCancel ($index, row) {
                this.$set(this.showData[$index], 'editFlag', false)
            },
            // 新增一条模板数据
            addRecord () {
                this.showData = this.showData || []
                this.showData.push({
                    id:'',
                    projectId: '',
                    project:'',
                    version:'',
                    domain: '',
                    ip: '',
                    editFlag: true
                })
            },
            // 删除
            handleDelete (index, row) {
                this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    console.log(this.showData[index]);
                    if (this.showData[index].id) {
                        // deleteProjectHost
                        console.log(this.showData[index]);
                        console.log(row);
                    }
                    this.showData.splice(index, 1);

                    // localStorage.setItem('tableData', JSON.stringify(this.showData))
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                }).catch((err) => {
                    this.$message({
                        type: 'error',
                        message: err
                    })
                })
            },

            setVersions(project, row) {
                this.versions[project] = [];
                for (let i = 0; i < this.tableData.length; i++) {
                    if ( project === this.tableData[i].project) {
                        let select_version = {
                            label: this.tableData[i].version,
                            value: this.tableData[i].version
                        }
                        this.versions[project].push(select_version);
                    }
                }
            },
            setProjects() {
                let mapObj = new Map();
                for (let i = 0; i < this.tableData.length; i++) {
                    let record = this.tableData[i];
                    mapObj.set(record.projectId, record.project);
                }
                this.projects = [...mapObj];

            }
        }
    }
</script>

<style scoped>
    .template-manage {
        width: 100%;
        font-size: 14px;
    }
    .temp-title {
            display: flex;
            justify-content: space-between;
            height: 30px;
            margin-top: 20px;
    }
    .temp-title td{
        height: 45px;
    }



    .table {
        width: 100%;
        font-size: 14px;
    }
</style>
