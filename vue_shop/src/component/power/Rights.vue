<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card shadow="hover" class="mt">
            <!-- 用户列表 -->
            <el-table :data="rightsList.slice((currentPage-1)*pagesize,currentPage*pagesize)" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="authName" label="权限名称"></el-table-column>
                <el-table-column prop="path" label="路径"></el-table-column>
                <el-table-column prop="level" label="权限等级">
                    <template slot-scope="scope">

                        <el-tag type="danger" v-if="scope.row.level==='0'" effect="dark">一级权限</el-tag>
                        <el-tag v-else-if="scope.row.level==='1'" effect="dark">二级权限</el-tag>
                        <el-tag type="info" v-else effect="dark">三级权限</el-tag>
                    </template>
                </el-table-column>

            </el-table>
            <el-pagination class="mt"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[5, 10, 20, 40]" 
            :page-size="pagesize"         
            layout="total, sizes, prev, pager, next, jumper"
            :total="rightsList.length" background>    //这是显示总共有多少数据，
            </el-pagination>
        </el-card>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                currentPage: 1, //初始页
                pagesize: 5, //  每页的数据
                rightsList: [],
            }
        },
        created() {
            this.getRightsList();
        },
        methods: {
            // 初始页currentPage、初始每页数据数pagesize和数据data
            handleSizeChange(size) {
                this.pagesize = size;
                console.log(this.pagesize);  //每页下拉显示数据
            },
            handleCurrentChange(currentPage) {
                this.currentPage = currentPage;
                console.log(this.currentPage);  //点击第几页
            },
            async getRightsList() {
                const { data } = await this.$http.get('rights/list');

                if (data.meta.status !== 200) {
                    return this.$message.error(data.meta.msg);
                } else {
                    this.rightsList = data.data;
                }

            },
        }
    }
</script>
<style scoped>
    .mt {
        margin-top: 10px;
    }
</style>