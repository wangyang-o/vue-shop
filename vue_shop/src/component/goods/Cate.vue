<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card shadow="hover" class="mt">
            <el-row type="flex" justify="start" :gutter="20">
                <el-col>
                    <el-button type="danger" icon="el-icon-plus" circle @click="showAddDialog()"></el-button>
                </el-col>
            </el-row>
            <!-- 表格-->
            <zk-table class="mt" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false"
                show-index border>
                <template slot="isOk" slot-scope="scope">
                    <i class="el-icon-success fsize" v-if="scope.row.cat_deleted"></i>
                    <i class="el-icon-error fsize" v-else></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag type="danger" v-if="scope.row.cat_level==0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level==1">二级</el-tag>
                    <el-tag type="info" v-else>三级</el-tag>

                </template>
                <template slot="opt" slot-scope="item">
                    <el-tooltip content="编辑" placement="top" :enterable="false">
                        <el-button @click="showEditDialog(item.row.cat_id)" size="small" icon="el-icon-edit"
                            type="primary" circle></el-button>
                    </el-tooltip>
                    <el-button size="small" @click="removeById(item.row.cat_id)" type="danger" icon="el-icon-delete"
                        circle>
                    </el-button>
                </template>
            </zk-table>
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
                layout="sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog @close="addDialogClear()" title="添加分类" :visible.sync="addDialogVisible" width="30%" center>
            <el-form :model="addForm" :rules="FormRules" ref="addFormRef" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父类名称：">

                    <el-cascader v-model="selectedKeys" :options="parentCateList" @change="parentChange"
                        :props="caseProps" class="cascader" clearable ></el-cascader>


                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="summitAddCate()">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑对话框 -->
        <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="30%" center>
            <el-form :model="editForm" :rules="FormRules" ref="editFormRef" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="summitEditCate()">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除弹窗 -->

    </div>
</template>
<script>
    export default {
        data() {
            return {
                cateList: [],
                addForm: {
                    cat_name: '',
                    cat_pid: 0,
                    cat_level: 0,

                },
                editForm: {},
                addDialogVisible: false,
                editDialogVisible: false,

                queryInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5,

                },
                // 总数据条数
                total: 0,
                FormRules: {
                    cat_name: [
                        { required: true, message: '请输入分类名称', trigger: 'blur' },
                        { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
                    ],
                },
                parentCateList: [],
                caseProps: {
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children',
                },
                selectedKeys: [],

                // 
                columns: [
                    {
                        label: '分类名称',
                        prop: 'cat_name'
                    },
                    {
                        label: '是否有效',
                        type: 'template',
                        template: 'isOk',
                    },
                    {
                        label: '排序',
                        type: 'template',
                        template: 'order',
                    },
                    {
                        label: '操作',
                        type: 'template',
                        template: 'opt',
                    },

                ],

            }
        },
        created() {
            this.getCateList();
        },
        methods: {
            addDialogClear() {
                this.$refs.addFormRef.resetFields();
                this.selectedKeys = [];
                this.addForm.cat_level = 0;
                this.addForm.cat_pid = 0;
            },
            summitAddCate() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return;
                    console.log(this.addForm);
                    const { data } = await this.$http.post('categories/', this.addForm);
                    if (data.meta.status !== 201) {
                        return this.$message.error(data.meta.msg);
                    } else {
                        this.$notify({
                            title: '成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                        this.getCateList();
                        this.addDialogVisible = false;
                    }
                });
            },
            // 获取列表
            async getCateList() {
                const { data } = await this.$http.get('categories', { params: this.queryInfo });
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.cateList = data.data.result;
                    this.total = data.data.total;
                }
            },
            async showEditDialog(id) {
                const { data } = await this.$http.get(`roles/${id}`);
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.editForm = data.data;
                    this.editDialogVisible = true;
                }
            },
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize;
                this.getCateList();
            },
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage;
                this.getCateList();

            },
            showAddDialog() {
                this.getParentCateList();
                this.addDialogVisible = true;
            },
            async getParentCateList() {
                const { data } = await this.$http.get('categories', { params: { type: 2 } });
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.parentCateList = data.data;
                }
            },
            parentChange() {
                console.log(this.selectedKeys);
                let len = this.selectedKeys.length;
                if (len > 0) {
                    // 父级分类的id
                    this.addForm.cat_pid = this.selectedKeys[len - 1];
                    // 分类等级
                    this.addForm.cat_level = len;
                } else {
                    // 父级分类的id
                    this.addForm.cat_pid = 0;
                    // 分类等级
                    this.addForm.cat_level = 0;
                }

            },
            // 编辑功能
            async showEditDialog(id) {
                console.log(id);
                const { data } = await this.$http.get(`categories/${id}`);
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.editForm = data.data;
                    this.editDialogVisible = true;
                }
            },
            summitEditCate() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) {
                        return;
                    } else {
                        const { cat_id, cat_name } = this.editForm;
                        console.log('cat_id :>> ', cat_id);
                        console.log('cat_name :>> ', cat_name);
                        const { data } = await this.$http.put(`categories/${cat_id}`, { cat_name })
                        if (data.meta.status !== 200) {
                            return this.$message.error(data.meta.msg);
                        }
                        this.editDialogVisible = false;
                        this.getCateList();
                        this.$notify({
                            title: '成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                    }
                })
            },
            async removeById(id) {
                const result = await this.$confirm('此操作将永久删除分类,是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch((e) => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
                if (result == 'confirm') {
                    const { data } = await this.$http.delete(`categories/${id}`);
                    if (data.meta.status !== 200) {
                        return this.$message.error(data.meta.msg);
                    } else {
                        this.$notify({
                            title: '成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                        this.getCateList();
                    }
                }
            },
        },

    }
</script>
<style scoped>
    .mt {
        margin-top: 10px;
    }

    .fsize {
        font-size: 20px;
    }

    .el-icon-success {
        color: greenyellow;
    }

    .cascader {
        width: 100%;
    }
</style>