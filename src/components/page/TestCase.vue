<template>
    <div class="table">
        <div class="container">
            <div class="handle-box">
                <el-select v-model="select_project" filterable placeholder="请选择项目" @select="getTableData" @change="getTableData">
                    <el-option
                        v-for="item in project_options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-input v-model="search_word" placeholder="筛选关键词" class="handle-input"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
            </div>
            <el-table :data="tableData" :span-method="spanMethod" border class="table" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column prop="case_name" label="用例名称" width="150">
                </el-table-column>
                <el-table-column prop="index" label="执行顺序" width="80" align="center">
                </el-table-column>
                <el-table-column prop="api_name" label="接口名称" width="200">
                </el-table-column>
                <el-table-column prop="url" label="接口地址">
                </el-table-column>

                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-plus" @click="handleAdd(scope.$index, scope.row)">新增接口</el-button>
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">测试数据</el-button>
                        <el-button type="text" icon="el-icon-delete" class="red" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                        <el-tooltip class="item" effect="light" content="向上移动" placement="bottom">
                            <el-button type="text" icon="el-icon-arrow-up" class="blue" @click="handleUp(scope.$index, scope.row)"></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="light" content="向下移动" placement="top">
                            <el-button type="text" icon="el-icon-arrow-down" class="blue" @click="handleDown(scope.$index, scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="1000">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="50px">
                <el-form-item label="日期">
                    <el-date-picker type="date" placeholder="选择日期" v-model="form.date" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
                </el-form-item>
                <el-form-item label="姓名">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="form.address"></el-input>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
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
    import { getAllUserProjectList,getTestCaseByPid } from '../../scripts/api'
    export default {
        name: 'basetable',
        data() {
            return {
                project_options: [],
                spanArr:[],
                tableData: [
                    {id: '1', project:'fund', case_name: '查询用户信息', api_name:'login', testdata:'aaa=bbb', uri:'/a/login'},
                    {id: '2', project:'fund', case_name: '查询用户信息', api_name:'query', testdata:'aaa=bbb', uri:'/a/query'},
                    {id: '3', project:'fund', case_name: '查询用户信息', api_name:'logout', testdata:'aaa=bbb', uri:'/a/logout'},
                    {id: '4', project:'usercenter', case_name: '登录', api_name:'login', testdata:'aaa=bbb', uri:'/a/login'}
                ],
                select_project:'',
                search_word: '',
                cur_page: 1,
                page_size: 10,
                multipleSelection: [],
                select_cate: '',
                del_list: [],
                is_search: false,
                editVisible: false,
                delVisible: false,

                form: {
                    name: '',
                    date: '',
                    address: ''
                },
                idx: -1,
                pos: 0
            }
        },
        created() {
            this.getProjects();
        },
        mounted() {
            this.getSpanArr(this.tableData);
        },
        computed: {
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },

            getSpanArr(data) {
                this.spanArr = [];
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        this.spanArr.push(1);
                        this.pos = 0
                    } else {
                        // 判断当前元素与上一个元素是否相同
                        if (data[i].case_name === data[i-1].case_name) {
                            this.spanArr[this.pos] += 1;
                            this.spanArr.push(0);
                        } else {
                            this.spanArr.push(1);
                            this.pos = i;
                        }
                    }
                }
            },

            spanMethod({ row, column, rowIndex, columnIndex }) {
                if (columnIndex === 0) {
                    const _row = this.spanArr[rowIndex];
                    const _col = _row > 0 ? 1 : 0;
                    return {
                        rowspan: _row,
                        colspan: _col
                    }
                }
                // if (columnIndex == 1) {
                //     const _row = this.spanArr[rowIndex];
                //     const _col = _row > 0 ? 1 : 0;
                //     return {
                //         rowspan: _row,
                //         colspan: _col
                //     }
                // }

            },
            getTableData() {
                this.tableData = [];
                let params = {
                    id: this.select_project
                }
                getTestCaseByPid(params).then(response => {
                    let code = response.code;
                    let msg = response.msg;
                    if (code == 200) {
                        this.tableData = response.data;
                        this.getSpanArr(this.tableData);
                        if (this.tableData.length <1)
                            this.$message.info('该项目暂无测试用例')
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
            },
            formatter(row, column) {
                return row.address;
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            handleAdd(index, row) {
                console.log(this.tableData)
                this.tableData.splice(index, 0, row);
                for (let i=index+1, length=this.tableData.length; i<length; ++i) {
                    let tmp = this.tableData[i];
                    if (tmp.case_name == row.case_name && tmp.project_id == row.project_id) {
                        console.log(tmp)
                        this.tableData[i].index = row.index+(i-index);
                    }
                }
                this.getSpanArr(this.tableData);
            },
            handleEdit(index, row) {
                this.idx = index;
                const item = this.tableData[index];
                this.form = {
                    name: item.name,
                    date: item.date,
                    address: item.address
                }
                this.editVisible = true;
            },
            handleDelete(index, row) {
                this.idx = index;
                this.delVisible = true;
            },
            handleUp(index, row) {
                if (index > 0) {
                    let pre_row = this.tableData[index-1];
                    if (pre_row.case_name == row.case_name && pre_row.project_id == row.project_id){
                        pre_row.index = pre_row.index + 1;
                        row.index = row.index - 1;
                        this.tableData.splice(index-1,1);
                        this.tableData.splice(index, 0, pre_row)
                    } else {
                        this.$message.warning('不能再向上移了');
                    }
                } else {
                    this.$message.warning('不能再向上移了');
                }
            },
            handleDown(index, row) {
                if (index < this.tableData.length-1) {
                    let next_row = this.tableData[index+1];
                    if (next_row.case_name == row.case_name && next_row.project_id == row.project_id){
                        next_row.index = next_row.index - 1;
                        row.index = row.index + 1;
                        this.tableData.splice(index+1,1);
                        this.tableData.splice(index, 0, next_row);
                    } else {
                        this.$message.warning('不能再向下移了');
                    }
                } else {
                    this.$message.warning('不能再向下移了');
                }
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
                this.$set(this.tableData, this.idx, this.form);
                this.editVisible = false;
                this.$message.success(`修改第 ${this.idx+1} 行成功`);
            },
            // 确定删除
            deleteRow(){
                this.tableData.splice(this.idx, 1);
                this.$message.success('删除成功');
                this.delVisible = false;
            }
        }
    }

</script>

<style scoped>
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
</style>
