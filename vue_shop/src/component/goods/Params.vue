<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card shadow="hover" class="mt">
            <el-row>
                <el-col :span="9">
                    <span>选择商品分类：</span>
                    <el-cascader v-model="selectedValue" :options="cateList" :props="cateProps" @change="handleChange">
                    </el-cascader>
                </el-col>
                <el-col :span="10">
                    <el-alert title="警告：只允许为三级分类设置相关参数！" type="warning" show-icon></el-alert>
                </el-col>
            </el-row>
            <!-- 参数分类 -->
            <el-tabs v-model="activeName" @tab-click="handleClick" tab-position="left" style="margin-top: 20px;">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="small" round icon="el-icon-edit" @click="paramsDialogVisible=true"
                        :disabled="isBtnDisabled">添加参数
                    </el-button>
                    <!-- 动态参数列表 -->
                    <el-table :data="manyData" border stripe class="mt">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                                    @close="handleClose(index,scope.row)">
                                    {{item}}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>

                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="item">
                                <el-tooltip content="编辑" placement="top" :enterable="false">
                                    <el-button @click="showEditDialog(item.row.attr_id)" size="small"
                                        icon="el-icon-edit" type="primary" circle></el-button>
                                </el-tooltip>
                                <el-button size="small" @click="removeParamsById(item.row.attr_id)" type="danger"
                                    icon="el-icon-delete" circle>
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="small" round icon="el-icon-edit" @click="paramsDialogVisible=true"
                        :disabled="isBtnDisabled">添加参数
                    </el-button>
                    <!-- 静态属性列表 -->
                    <el-table :data="onlyData" border stripe class="mt">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                                    @close="handleClose(index,scope.row)">
                                    {{item}}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>

                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="item">
                                <el-tooltip content="编辑" placement="top" :enterable="false">
                                    <el-button @click="showEditDialog(item.row.attr_id)" size="small"
                                        icon="el-icon-edit" type="primary" circle></el-button>
                                </el-tooltip>
                                <el-button size="small" @click="removeParamsById(item.row.attr_id)" type="danger"
                                    icon="el-icon-delete" circle>
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数弹窗 -->
        <el-dialog @close="addDialogClear()" :title="titleDialog" :visible.sync="paramsDialogVisible" width="50%"
            center>
            <el-form :model="addParamsForm" :rules="FormRules" ref="addParamsFormRef" label-width="100px">
                <el-form-item :label="titleDialog" prop="attr_name">
                    <el-input v-model="addParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="paramsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams()">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改参数弹窗 -->
        <el-dialog @close="editDialogClear()" :title="titleDialog" :visible.sync="editDialogVisible" width="50%" center>
            <el-form :model="editParamsForm" :rules="FormRules" ref="editParamsFormRef" label-width="100px">
                <el-form-item :label="titleDialog" prop="attr_name">
                    <el-input v-model="editParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams()">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script>
    export default {
        data() {
            return {
                cateList: [],
                cateProps: {
                    expandTrigger: 'hover',
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children',
                },
                selectedValue: [],
                activeName: 'many',
                manyData: [],
                onlyData: [],
                paramsDialogVisible: false,
                editDialogVisible: false,
                addParamsForm: {},
                editParamsForm: {},
                inputVisible: false,
                inputValue: '',
                FormRules: {
                    attr_name: [
                        { required: true, message: '请输入参数', trigger: 'blur' },
                        { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
                    ],
                },
            }
        },
        created() {
            this.getCateList();
        },
        methods: {
            async getCateList() {
                const { data } = await this.$http.get('categories');
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.cateList = data.data;
                }
            },
            // 获取参数列表
            async handleChange() {
                if (this.selectedValue.length !== 3) {
                    this.selectedValue = [];
                    this.manyData=[];
                    this.onlyData=[];
                    this.$notify({
                        title: '警告',
                        message: '只允许为三级分类设置相关参数',
                        type: 'warning',
                        duration: 1000
                    });
                    return;
                } else {
                    // 获取对应的参数
                    const { data } = await this.$http.get(`categories/${this.catId}/attributes`, { params: { sel: this.activeName } })
                    data.data.forEach(item => {
                        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [];
                        item.inputValue = '';
                        item.inputVisible = false;
                    })
                    if (data.meta.status !== 200) {
                        return this.$message.error(data.meta.msg);
                    } else {
                        if (this.activeName == 'many') {
                            this.manyData = data.data;
                        } else {
                            this.onlyData = data.data;

                        }
                    }
                }
            },
            async handleInputConfirm(item) {
                if (item.inputValue.trim().length === 0) {
                    return;
                } else {
                    item.attr_vals.push(item.inputValue.trim());
                }
                item.inputValue = '';
                item.inputVisible = false;
                const { data } = await this.$http.put(`categories/${this.catId}/attributes/${item.attr_id}`, {
                    attr_name: item.attr_name,
                    attr_sel: item.attr_sel,
                    attr_vals: item.attr_vals.join(','),
                });
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.$notify({
                        title: '修改参数项成功',
                        message: data.meta.msg,
                        type: 'success',
                        duration: 700
                    });
                }
            },
            async handleClose(index, item) {
                item.attr_vals.splice(index, 1);
                const { data } = await this.$http.put(`categories/${this.catId}/attributes/${item.attr_id}`, {
                    attr_name: item.attr_name,
                    attr_sel: item.attr_sel,
                    attr_vals: item.attr_vals.join(','),
                });
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.$notify({
                        title: '删除成功！',
                        message: data.meta.msg,
                        type: 'success',
                        duration: 700
                    });
                }
            },
            showInput(item) {
                item.inputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            handleClick() {
                this.handleChange();
            },
            addDialogClear() {
                this.$refs.addParamsFormRef.resetFields();
            },
            editDialogClear() {
                this.$refs.editParamsFormRef.resetFields();
            },
            addParams() {
                this.$refs.addParamsFormRef.validate(async valid => {
                    if (!valid) return;
                    const { data } = await this.$http.post(`categories/${this.catId}/attributes`, {
                        attr_name: this.addParamsForm.attr_name, attr_sel: this.activeName
                    });
                    if (data.meta.status !== 201) {
                        this.$notify.error({
                            title: '添加失败',
                            message: data.meta.msg,
                            duration: 700
                        })
                    } else {
                        this.$notify({
                            title: '添加成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                        this.handleChange();
                        this.paramsDialogVisible = false;
                    }
                })
            },
            editParams() {
                this.$refs.editParamsFormRef.validate(async valid => {
                    if (!valid) return;
                    const { data } = await this.$http.put(`categories/${this.catId}/attributes/${this.editParamsForm.attr_id}`, {
                        attr_name: this.editParamsForm.attr_name, attr_sel: this.activeName
                    });
                    if (data.meta.status !== 200) {
                        this.$notify.error({
                            title: '修改参数失败',
                            message: data.meta.msg,
                            duration: 700
                        })
                    } else {
                        this.$notify({
                            title: '添加成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                        this.handleChange();
                        this.editDialogVisible = false;

                    }
                })
            },
            async removeParamsById(id) {
                const result = await this.$confirm('此操作将永久删除用户,是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch((e) => {
                    console.log('e :>> ', e);
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
                if (result == 'confirm') {
                    const { data } = await this.$http.delete(`categories/${this.catId}/attributes/${id}`);
                    if (data.meta.status !== 200) {
                        return this.$message.error(data.meta.msg);
                    } else {
                        this.$notify({
                            title: '成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                        this.handleChange();
                    }
                }
            },
            async showEditDialog(id) {
                const { data } = await this.$http.get(`categories/${this.catId}/attributes/${id}`, { params: { attr_sel: this.activeName } });
                if (data.meta.status !== 200) {
                    this.$notify.error({
                        title: '添加失败',
                        message: data.meta.msg,
                        duration: 700
                    })
                } else {
                    this.editParamsForm = data.data;
                    console.log('66666', this.editParamsForm);
                }
                this.editDialogVisible = true;
            },
            async showEditRoleDialog(userInfo) {
                this.userInfo = userInfo;
                // 获取角色列表
                const { data } = await this.$http.get('roles');
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.roleList = data.data;
                    this.selectedRoleId = '';
                    this.editRoleDialogVisible = true;
                }
            },

        },
        computed: {
            isBtnDisabled() {
                return this.selectedValue.length !== 3 ? true : false;
            },
            catId() {
                return this.selectedValue.length == 3 ? this.selectedValue[2] : null;
            },
            titleDialog() {
                return this.activeName == 'many' ? '动态参数' : '静态属性';

            }
        },

    }
</script>
<style scoped>
    .mt {
        margin-top: 10px;
    }

    .el-tag {
        margin: 5px;
    }

    .input-new-tag {
        width: 90px;
    }
</style>