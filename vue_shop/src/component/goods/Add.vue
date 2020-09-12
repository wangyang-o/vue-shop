<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="hover" class="mt">
      <el-alert title="添加商品信息" type="success" center show-icon class="mt"></el-alert>
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息" icon="el-icon-edit"></el-step>
        <el-step title="商品参数" icon="el-icon-s-order"></el-step>
        <el-step title="商品属性" icon="el-icon-s-promotion"></el-step>
        <el-step title="商品图片" icon="el-icon-picture"></el-step>
        <el-step title="商品内容" el-icon-s-opportunity></el-step>
        <el-step title="完成" icon="el-icon-upload"></el-step>
      </el-steps>

      <el-form :model="addForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTableLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称:" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格:" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量:" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量:" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类:" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" label="#" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals" size="small">
                <el-checkbox-button
                  :label="item1"
                  v-for="(item1, index) in item.attr_vals"
                  :key="index"
                ></el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              label-width="150px"
              v-for="item in onlyTableData"
              :label="item.attr_name+':'"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action上传地址 -->

            <el-upload
              :file-list="fileList"
              :headers="headerObj"
              ref="upload"
              :action="uploadURL"
              list-type="picture-card"
              :on-success="handleSuccess"
              :on-remove="handleRemove"
            >
              <i slot="default" class="el-icon-plus"></i>
              <div slot="file" slot-scope="{file}">
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt />
                <span class="el-upload-list__item-actions">
                  <!-- 预览图片 -->
                  <span
                    class="el-upload-list__item-preview"
                    @click="handlePictureCardPreview(file)"
                  >
                    <i class="el-icon-zoom-in"></i>
                  </span>
                  <!-- 删除图片 -->
                  <span
                    v-if="!disabled"
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                  >
                    <i class="el-icon-delete"></i>
                  </span>
                </span>
              </div>
            </el-upload>
            <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="dialogImageUrl" alt />
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-row type="flex" justify="center" class="mt">
              <el-button type="primary" @click="addGood()">添加商品</el-button>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      uploadURL: "http://api.ojbk666.top/api/private/v1/upload",
      activeIndex: "0",
      cateList: [],
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: [],
      },
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
        expandTrigger: "hover",
      },
      manyTableData: [],
      onlyTableData: [],
      formRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请输入商品分类", trigger: "blur" },
        ],
      },

      dialogImageUrl: "",
      dialogVisible: false,
      disabled: false,
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      fileList: [],
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    handleRemove(file) {
      // 点击删除按钮，使其消失。参考地址：https://segmentfault.com/q/1010000019618247
      let fileList = this.$refs.upload.uploadFiles;
      let index = fileList.findIndex((fileItem) => {
        return fileItem.uid === file.uid;
      });
      fileList.splice(index, 1);
      // 删除最后推送时的数据
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((item) => item.pic === filePath);
      this.addForm.pics.splice(i, 1);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleSuccess(response) {
      console.log("成功上传文件：", response.data);
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
    },
    async addGood() {
      this.addForm.goods_cat = this.addForm.goods_cat.join(",");
      console.log("object :>> ", this.addForm.goods_cat);
      this.manyTableData.forEach((item) => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(","),
        };
        this.addForm.attrs.push(newInfo);
      });
      this.onlyTableData.forEach((item) => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals,
        };
        this.addForm.attrs.push(newInfo);
      });
      const { data } = await this.$http.post("goods", this.addForm);
      if (data.meta.status !== 201) {
        return this.$message.error(data.meta.msg);
      } else {
          this.$notify({
          title: "成功",
          message: data.meta.msg,
          type: "success",
          duration: 1000,
        });
        this.$router.push('/goods');

      }
    },
    async getCateList() {
      const { data } = await this.$http.get("categories");
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg);
      } else {
        this.cateList = data.data;
      }
    },
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTableLeave(now, old) {
      let formValid;
      if (old === "0" && this.addForm.goods_cat.length !== 3) {
        this.$notify({
          title: "哎呀，亲！",
          message: "请选择商品分类",
          type: "error",
          duration: 1000,
        });
        return false;
      }
      let valid = this.$refs.formRef.validate((valid) => {
        if (!valid) {
          this.$notify.error({
            title: "失败",
            message: "请添加必要的表单项",
            type: "error",
            duration: 1000,
          });
        }
        formValid = valid;
      });
      if (!formValid) {
        this.$notify({
          title: "哎呀，亲！",
          message: "请选择填写完整表单！",
          type: "error",
          duration: 1000,
        });
        return false;
      }
    },
    async tabClicked() {
      if (this.activeIndex === "1") {
        const { data } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (data.meta.status !== 200) {
          return this.$message.error(data.meta.msg);
        } else {
          data.data.forEach((element) => {
            element.attr_vals =
              element.attr_vals.length === 0
                ? []
                : element.attr_vals.split(",");
          });
          this.manyTableData = data.data;
        }
      } else if (this.activeIndex === "2") {
        const { data } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (data.meta.status !== 200) {
          return this.$message.error(data.meta.msg);
        } else {
          this.onlyTableData = data.data;
        }
      }
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      } else {
        return null;
      }
    },
  },
};
</script>
<style scoped>
.mt {
  margin-top: 10px;
}

.el-steps {
  margin: 20px;
}
</style>