<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card shadow="hover" class="mt">
            <el-row type="flex" justify="start" :gutter="20">
                <el-col>
                    <el-button type="danger" icon="el-icon-plus" circle @click="addDialogVisible = true"></el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table :data="rolesList" border class="mt">
                <el-table-column type="expand">
                    <template slot-scope="scope">

                        <el-row class="btbottom vcenter" v-for="(item1, index1) in scope.row.children" :key="item1.id">
                            <!-- 一级 -->

                            <el-col :span="4">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}
                                </el-tag>
                                <i class="el-icon-d-arrow-right"></i>
                            </el-col>
                            <!-- 二级 ,三级-->
                            <el-col :span="19">
                                <el-row class=" vcenter" v-for="(item2, index2) in item1.children" :key="item2.id">
                                    <!-- 二级 -->
                                    <el-col :span="4">
                                        <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                                            {{item2.authName}}</el-tag>
                                        <i class="el-icon-d-arrow-right"></i>
                                    </el-col>
                                    <!-- 三级 -->
                                    <el-col :span="18">
                                        <el-tag type="warning" @close="removeRightById(scope.row,item3.id)" closable
                                            v-for="(item3, index3) in item2.children" :key="item3.id">{{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>

                            </el-col>
                        </el-row>

                    </template>
                </el-table-column>
                <el-table-column type="index" label="序号" width="50px"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作"> <template slot-scope="item">
                        <el-tooltip content="编辑" placement="top" :enterable="false">
                            <el-button @click="showEditDialog(item.row.id)" size="small" icon="el-icon-edit"
                                type="primary" circle></el-button>
                        </el-tooltip>
                        <el-tooltip content="分配权限" placement="top" :enterable="false">
                            <el-button size="small" @click="showSetRightDialog(item.row)" type="warning"
                                icon="el-icon-setting" circle>
                            </el-button>
                        </el-tooltip>
                        <el-button size="small" @click="removeRoleById(item.row.id)" type="danger" icon="el-icon-delete"
                            circle>
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 添加角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%" center>
            <el-form :model="addForm" :rules="FormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole()">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改对话框 -->
        <el-dialog title="修改角色信息" :visible.sync="editDialogVisible" width="50%" center>
            <el-form :model="editForm" :rules="FormRules" ref="editFormRef">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRoleInfo()">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配权限 -->
        <el-dialog title="分配权限" :visible.sync="rightDialogVisible" width="50%" center @close="defKeys=[]">

            <el-tree :data="rightsList" :props="treeProps" ref="treeRef" show-checkbox node-key="id"
                :default-checked-keys="defKeys"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="rightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRight()">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script>
    export default {
        data() {
            return {
                rolesList: [],
                rightsList: [],
                defKeys: [],
                addDialogVisible: false,
                editDialogVisible: false,
                rightDialogVisible: false,
                roleId: '',
                treeProps: {
                    label: 'authName',
                    children: 'children'
                },
                addForm: {},
                editForm: {},
                FormRules: {
                    roleName: [
                        { required: true, message: '请输入账号', trigger: 'blur' },
                        { min: 1, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                    ],
                },
            }
        },
        created() {
            this.getRoleList();
        },
        methods: {
            addRole() {
                this.$refs.addFormRef.validate(async valid => {
                    const { data } = await this.$http.post('roles', this.addForm);
                    if (data.meta.status !== 201) {
                        this.$notify.error({
                            title: '添加失败',
                            message: data.meta.msg,
                            duration: 700
                        })
                    } else {
                        this.addDialogVisible = false;
                        this.$notify({
                            title: '添加成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                        this.getRoleList();
                        console.log(data);
                    }
                });
            },
            // 根据id查询角色信息
            async removeRightById(role, rightId) {
                const confirmResult = await this.$confirm('删除该权限, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
                if (confirmResult == 'confirm') {
                    const { data } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
                    if (data.meta.status !== 200) {
                        return this.$message.error(data.meta.msg);
                    } else {
                        this.$notify({
                            title: '成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                        role.children = data.data;
                    }
                }

            },
            async removeRoleById(id) {
                const result = await this.$confirm('此操作将永久删除角色,是否继续?', '提示', {
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
                    const { data } = await this.$http.delete(`roles/${id}`);
                    if (data.meta.status !== 200) {
                        return this.$message.error(data.meta.msg);
                    } else {
                        this.$notify({
                            title: '成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                        this.getRoleList();
                    }
                }
            },
            // 展示权限树
            async showSetRightDialog(role) {
                this.roleId = role.id;
                const { data } = await this.$http.get('rights/tree');
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.$notify({
                        title: '成功',
                        message: data.meta.msg,
                        type: 'success',
                        duration: 700
                    });
                }
                this.rightsList = data.data;
                this.getLeafKeys(role, this.defKeys);
                this.rightDialogVisible = true;
            },
            async allotRight() {
                const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
                const rids = keys.join(',');
                const { data } = await this.$http.post(`roles/${this.roleId}/rights`, { rids });
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.$notify({
                        title: '成功',
                        message: data.meta.msg,
                        type: 'success',
                        duration: 700
                    });
                }
                this.getRoleList();
                this.rightDialogVisible=false;
            },
            // 展示编辑框
            async showEditDialog(id) {
                const { data } = await this.$http.get(`roles/${id}`);
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.editForm = data.data;
                    this.editDialogVisible = true;
                }
            },
            // 发送修改请求
            editRoleInfo() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) {
                        return;
                    } else {
                        // const { email, mobile } = this.editForm;
                        const { data } = await this.$http.put(`roles/${this.editForm.roleId}`, this.editForm)
                        console.log(data);
                        if (data.meta.status !== 200) {
                            return this.$message.error(data.meta.msg);
                        }
                        this.editDialogVisible = false;
                        this.getRoleList();
                        this.$notify({
                            title: '成功',
                            message: '修改成功',
                            type: 'success',
                            duration: 700
                        });

                    }

                })
            },
            async getRoleList() {
                const { data } = await this.$http.get('roles');
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.rolesList = data.data;
                }
            },
            getLeafKeys(node, arr) {
                if (!node.children) {
                    return arr.push(node.id);
                } else {
                    node.children.forEach(item => {
                        this.getLeafKeys(item, arr);
                    })
                }

            }
        },
    }
</script>
<style scoped>
    .mt {
        margin-top: 10px;
    }

    .el-tag {
        margin: 7px;
    }

    .btbottom {
        border-bottom: 1px dashed #000;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>