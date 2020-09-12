<template>
  <div class="login_body">
    <div class="login_container">
      <!-- 头像 -->
      <div class="avatar_box">
        <img class="avatar" src="https://cdn.jsdelivr.net/gh/wangyang-o/imgcdn/img/20200512002714.png" alt />
      </div>
      <!-- 表单 -->
      <div class="login_form">
        <!-- input -->
        <el-form ref="loginFormRef" label-width="100px" :rules="rules" :model="formLogin">
          <el-form-item label="账号：" prop='username'>

            <el-input v-model="formLogin.username" class="my_after" prefix-icon="el-icon-user-solid"></el-input>
          </el-form-item>
          <el-form-item label="密码：" prop='password'>
            <el-input v-model="formLogin.password" prefix-icon="el-icon-lock" :type="flag?'text':'password'"
              class="my_after">
              <i slot="suffix" :class="flag?'el-icon-moon':'el-icon-sunny'" @click='flag=!flag'></i>
            </el-input>

          </el-form-item>
          <!-- <el-form-item label="验证码：" prop='required'>
            <el-input v-model="formLogin.type" class="my_after" prefix-icon="el-icon-message-solid"></el-input>
          </el-form-item> -->
          <!-- 按钮 -->

          <el-form-item>
            <el-button type="primary" round @click="login('loginFormRef')">登录</el-button>
            <el-button type="info" round @click="resetForm('loginFormRef')">重置</el-button>

          </el-form-item>

          <div class="register">
            <el-button type="text" >没有账号？</el-button>

          </div>
        </el-form>


      </div>
    </div>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        flag: false,
        formLogin: {
          username: 'admin',
          password: '123456',
          type: ''
        },
        rules: {
          username:
            [
              { required: true, message: '请输入账号', trigger: 'blur' },
              { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
            ],
          password:
            [
              { required: true, message: '请输入密码', trigger: 'blur' },
              { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }

            ]
        },
      };
    },
    methods: {
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      login(formName) {
        this.$refs[formName].validate(async valid => {
          // 表单验证
          if (!valid) return;
          // 请求
          const { data } = await this.$http.post('login', this.formLogin);
          // console.log(data);
          if (data.meta.status == 200) {
            this.$notify({
                    title: '成功',
                    message: `欢迎您,${data.data.username}`,
                    type: 'success',
                    duration:700
                });
            window.sessionStorage.setItem('token', data.data.token);
            this.$router.push('/home');
          } else {
            this.$notify.error({
                    title: '失败',
                    message: data.meta.msg,
                    type: 'error',
                    duration:1000
                });
          }


        });

      }
    }
  }


</script>

<style scoped>
  .login_body {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(#55efc4, #74b9ff, #dfe6e9);
  }

  .login_container {
    display: flex;
    width: 40vw;
    /* height: 350px; */
    background-color: #dff9fb;
    border-radius: 5%;
    box-shadow: 0 0 20px #dfe4ea;
    justify-content: center;

  }

  .login_container:hover {
    box-shadow: 0 0 20px #57606f;

  }

  .avatar_box {
    height: 50vh;
    flex: 1.5;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;

  }

  .avatar_box:hover>.avatar {
    transform: rotateZ(360deg);
    box-shadow: 0 0 10px #555;
  }

  .avatar {

    width: 90%;
    transition: all ease-in 0.5s;
    border-radius: 50%;
  }

  .login_form {
    flex: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 40px;
  }



  .my_after {
    /* overflow: hidden; */
    position: relative;
    width: 100%;
  }

  .my_after::before {
    content: '';
    position: absolute;
    height: 3px;
    bottom: 0;
    width: 0;
    transform: center;
    transition: .5s;
    background: linear-gradient(#55efc4, #74b9ff, #dfe6e9);
  }

  .my_after:hover:before {
    width: 100%;
  }

  .register {
    display: flex;
    justify-content: center;
    margin-left: 30px;
    margin-top: -20px;
  }
</style>