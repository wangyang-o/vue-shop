<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="hover" >
      <!-- 搜索 -->
      <el-row type="flex" justify="start" :gutter="20" class="mb">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="orderList" border class="mb">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="250px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time|dataFormat}}</template>
        </el-table-column>
        <el-table-column prop="role_name" label="操作">
          <template slot-scope="item">
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button
                @click="showEditDialog(item.row.id)"
                size="small"
                icon="el-icon-edit"
                type="primary"
                circle
              ></el-button>
            </el-tooltip>
            <el-tooltip content="物流状态" placement="top" :enterable="false">
              <el-button
                size="small"
                type="warning"
                icon="el-icon-location"
                @click="showProgress"
                circle
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 8, 15]"
        :page-size="queryInfo.pagesize"
        layout="sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 修改对话框 -->

    <el-dialog
      @close="editDialogClear()"
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="30%"
      center
    >
      <el-form :model="editForm" :rules="FormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="市省区/县：" prop="address1">
          <el-cascader
            v-model="editForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            class="cascader"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址：" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="summitEdit()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%" center>
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.ftime"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import cityData from "./citydata";
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 8,
      },
      total: 0,
      editForm: {
        address1: [],
        address1: "",
      },
      orderList: [],
      FormRules: {
        address1: [{ required: true, message: "请选择内容", trigger: "blur" }],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
          {
            min: 1,
            max: 30,
            message: "长度在 1 到 30 个字符",
            trigger: "blur",
          },
        ],
      },
      editDialogVisible: false,
      progressVisible: false,
      cityData: cityData,
      progressInfo: [],
       reverse: true,
    };
  },
  methods: {
    async getOrderList() {
      const { data } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (data.meta.status != 200) {
        return this.$message.error(data.meta.msg);
      }
      this.orderList = data.data.goods;
      this.total = data.data.total;
    },
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getOrderList();
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getOrderList();
    },
    showEditDialog(id) {
      console.log(id);
      this.editDialogVisible = true;
    },
    summitEdit() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        } else {
          this.editDialogVisible = false;
          this.$notify({
            title: "hello，world！",
            message: "该需求接口后台尚未编码",
            type: "warning",
            duration: 1500,
          });
        }
      });
    },
    editDialogClear() {
      this.$refs.editFormRef.resetFields();
    },
    async showProgress() {
      const { data } = await this.$http.get("kuaidi/1106975712662");
      if (data.meta.status != 200) {
        return this.$message.error(data.meta.msg);
      }
      console.log("data.data :>> ", data.data);
      this.progressInfo = data.data;
      this.progressVisible = true;
    },
  },
  created() {
    this.getOrderList();
  },
};
</script>
<style scoped>
.el-breadcrumb {
  margin-bottom: 20px;
}
.mb {
  margin-bottom: 20px;
}
.cascader {
  width: 100%;
}
</style>>