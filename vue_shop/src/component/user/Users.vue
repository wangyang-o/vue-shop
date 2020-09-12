<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card shadow="hover">
            <!-- 搜索 -->
            <el-row type="flex" justify="end" :gutter="20" class="mb">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList()">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" icon="el-icon-plus" circle @click="addDialogVisible = true"></el-button>
                </el-col>
            </el-row>
            <!-- 用户列表 -->
            <el-table :data="userList" border class="mb">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="item">
                        <el-tooltip content="别改没用的，数据库自动恢复" placement="top" :enterable="false">
                            <el-switch v-model="item.row.mg_state" @change="userStateChanged(item.row)">
                            </el-switch>
                        </el-tooltip>
                    </template>

                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="item">
                        <el-tooltip content="编辑" placement="top" :enterable="false">
                            <el-button @click="showEditDialog(item.row.id)" size="small" icon="el-icon-edit"
                                type="primary" circle></el-button>
                        </el-tooltip>
                        <el-tooltip content="分配角色" placement="top" :enterable="false">
                            <el-button size="small" @click="showEditRoleDialog(item.row)" type="warning"
                                icon="el-icon-setting" circle>
                            </el-button>
                        </el-tooltip>
                        <el-button size="small" @click="removeUserById(item.row.id)" type="danger" icon="el-icon-delete"
                            circle>
                        </el-button>
                    </template>

                </el-table-column>


            </el-table>
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[3, 10, 15, 30]" :page-size="queryInfo.pagesize"
                layout="sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog @close="addDialogClear()" title="添加用户" :visible.sync="addDialogVisible" width="50%" center>
            <el-form :model="addForm" :rules="FormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser()">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改对话框 -->
        <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" center>
            <el-form :model="editForm" :rules="FormRules" ref="editFormRef" label-width="100px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo()">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改角色对话框 -->
        <el-dialog title="分配角色" :visible.sync="editRoleDialogVisible" width="50%" center>
            <el-divider>当前用户：{{userInfo.username}}</el-divider>
            <el-divider>当前角色：{{userInfo.role_name}}</el-divider>
            <br>
            <el-divider>
                <el-select v-model="selectedRoleId" placeholder="请选择">
                    <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
                    </el-option>
                </el-select>
            </el-divider>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRoleInfo()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                // 获取参数对象
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 3,
                },
                userList: [],
                roleList: [],
                userInfo: {},
                selectedRoleId: '',
                total: 0,
                addDialogVisible: false,
                editDialogVisible: false,
                editRoleDialogVisible: false,
                addForm: {},
                editForm: {},
                FormRules: {
                    username: [
                        { required: true, message: '请输入账号', trigger: 'blur' },
                        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                    ],
                    email: [
                        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                        { type: 'email', message: '请输入正确的邮箱地址xxx@xxx.xx', trigger: ['blur', 'change'] }
                    ],
                },

            }
        },
        methods: {

            handleSizeChange(newsize) {
                console.log(`每页 ${newsize} 条`);
                this.queryInfo.pagesize = newsize;
                this.getUserList();
            },
            handleCurrentChange(newpage) {
                console.log(`当前页: ${newpage}`);
                this.queryInfo.pagenum = newpage;
                this.getUserList();
            },
            // 关闭添加用户对话框的监听
            addDialogClear() {
                this.$refs.addFormRef.resetFields();
            },
            // 展示分配角色对话框
            async showEditRoleDialog(userInfo) {
                this.userInfo = userInfo;
                // 获取角色列表
                const { data } = await this.$http.get('roles');
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.roleList = data.data;
                    this.selectedRoleId='';
                    this.editRoleDialogVisible = true;
                }
            },
            async editRoleInfo() {
                const { id } = this.userInfo;
                const rid = this.selectedRoleId;
                console.log('rid :>> ', this.userInfo);
                if (!this.selectedRoleId) {
                    return this.$message.error('请选择要分配的角色！');
                } else {
                    const { data } = await this.$http.put(`users/${id}/role`, { rid });
                    if (data.meta.status !== 200) {
                        this.$notify.error({
                            title: '更新角色失败',
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
                        this.getUserList();
                        this.editRoleDialogVisible = false;

                    }
                }
            },
            // 提交添加用户
            addUser() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return;
                    const { data } = await this.$http.post('users', this.addForm);
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
                        this.getUserList();
                        this.addDialogVisible = false;
                    }
                })
            },
            async removeUserById(id) {
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
                    const { data } = await this.$http.delete(`users/${id}`);
                    if (data.meta.status !== 200) {
                        return this.$message.error(data.meta.msg);
                    } else {
                        this.$notify({
                            title: '成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                        this.getUserList();
                    }
                }
            },
            // 根据id查询用户信息
            async showEditDialog(id) {
                const { data } = await this.$http.get('users/' + id);
                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.editForm = data.data;
                    this.editDialogVisible = true;
                }
            },
            // 提交修改信息
            editUserInfo() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) {
                        return;
                    } else {
                        const { email, mobile } = this.editForm;
                        const { data } = await this.$http.put('users/' + this.editForm.id, { email, mobile })
                        if (data.meta.status !== 200) {
                            return this.$message.error(data.meta.msg);
                        }
                        this.editDialogVisible = false;
                        this.getUserList();
                        this.$notify({
                            title: '成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });

                    }

                })
            },
            async getUserList() {
                const { data } = await this.$http.get('users', { params: this.queryInfo });
                if (data.meta.status != 200) {
                    return this.$message.error(data.meta.msg);
                }
                this.userList = data.data.users;
                this.total = data.data.total;
                // this.$message.success(data.meta.msg);

            },
            async userStateChanged(userInfo) {
                const { data } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
                if (data.meta.status != 200) {
                    userInfo.mg_state = !userInfo.mg_state;
                    return this.$message.error(data.meta.msg);

                }
                this.$notify({
                    title: '成功',
                    message: data.meta.msg,
                    type: 'success',
                    duration: 700
                });
            }
        },
        created() {
            this.getUserList();
        },
    }
</script>
<style scoped>
    .el-breadcrumb {
        margin-bottom: 20px;
    }

    .mb {
        margin-bottom: 20px;
    }

    .ml {
        margin-left: 5px;
    }
</style>