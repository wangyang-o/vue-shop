<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card shadow="hover" class="mt">
            <!-- 搜索 -->
            <el-row type="flex" justify="end" :gutter="20" class="mb">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList()">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList()"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" icon="el-icon-plus" circle @click="goAddPage()"></el-button>
                </el-col>
            </el-row>
            <el-table :data="goodsList" border class="mt" stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称" width="700px"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格" width="95px"> </el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
                <el-table-column label="创建时间" width="180px">
                    <template slot-scope="scope">
                        {{scope.row.add_time|dataFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="item">
                        <el-tooltip content="听说api有问题，没做" placement="top" :enterable="false">
                            <el-button size="small" icon="el-icon-edit"
                                type="primary" circle></el-button>
                        </el-tooltip>
                        <el-button size="small" @click="removeGoodsById(item.row.goods_id)" type="danger"
                            icon="el-icon-delete" circle>
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[3, 10, 15, 30]" :page-size="queryInfo.pagesize"
                layout="sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10,
                },
                goodsList: [],
                total: 0,
            }
        },
        created() {
            this.getGoodsList();
        },
        methods: {
            async removeGoodsById(id) {
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
                    const { data } = await this.$http.delete(`goods/${id}`);
                    if (data.meta.status !== 200) {
                        return this.$message.error(data.meta.msg);
                    } else {
                        this.$notify({
                            title: '成功',
                            message: data.meta.msg,
                            type: 'success',
                            duration: 700
                        });
                        this.getGoodsList();
                    }
                }
            },
            handleSizeChange(newsize) {
                console.log(`每页 ${newsize} 条`);
                this.queryInfo.pagesize = newsize;
                this.getGoodsList();
            },
            handleCurrentChange(newpage) {
                console.log(`当前页: ${newpage}`);
                this.queryInfo.pagenum = newpage;
                this.getGoodsList();

            },
            async getGoodsList() {
                const { data } = await this.$http.get('goods', { params: this.queryInfo });
                if (data.meta.status != 200) {
                    return this.$message.error(data.meta.msg);
                }
                this.goodsList = data.data.goods;
                this.total = data.data.total;
                console.log('this. :>> ', this.goodsList);
            },
            goAddPage(){
                this.$router.push('/goods/add')
            },
        },

    }

</script>
<style scoped>
    .mt {
        margin-top: 10px;
    }
</style>