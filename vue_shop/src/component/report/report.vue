<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="hover" class="mt">
      <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
      <div id="main" style="width: 800px;height:400px;"></div>
    </el-card>
  </div>
</template>
<script>
  import echarts from "echarts";
  export default {
    async mounted() {
      const { data } = await this.$http.get("reports/type/1");
      console.log('data.data :>> ', data);
      if (data.meta.status !== 200) {
        return this.$notify({
          title: "获取失败",
          message: data.meta.msg,
          type: "error",
          duration: 1500,
        });
      }
      const target={};
      Object.assign(target, this.options,data.data);
      // console.log('target :>> ', JSON.stringify(target,null,4));
      // const result={...this.options,...data.data}
      // 基于准备好的dom，初始化echarts实例
      let myChart = echarts.init(document.getElementById("main"));
      myChart.setOption(target);
    },
    data() {
      return {
        options: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }

      };
    },
    methods: {},
  };
</script>
<style scoped>
  .mt {
    margin-top: 10px;
  }
</style>