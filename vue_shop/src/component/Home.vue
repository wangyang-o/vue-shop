<template>
    <el-container class="home_container">
        <el-header>
            <div class="header_left">
                <i :class="isCollapse?'el-icon-d-arrow-left':'el-icon-d-arrow-right'" @click="toggleCollapse()"></i>
                <img class="home_ico" src="https://cdn.jsdelivr.net/gh/wangyang-o/imgcdn/img/20200512002714.png" alt="">
                <span>天行的电商项目</span>
            </div>
            <div>
                <el-button type="info" @click="logout()">退出登录</el-button>
            </div>
        </el-header>
        <el-container>
            <el-aside width="auto">
                <el-col :span="12" class="home_aside">
                    <el-menu active-text-color="#26de81" router  unique-opened :collapse="isCollapse"
                        :collapse-transition="false"  :default-active="activePath">
                        <!-- 一级菜单 -->
                        <el-submenu :index="item.id +''" v-for="(item, i) in munus" :key="item.id">
                            <template slot="title">
                                <svg class="icon" aria-hidden="true">
                                    <use :xlink:href="icons[item.id]"></use>
                                </svg>
                                <span>{{item.authName}}</span>
                            </template>
                            <!-- 二级菜单 -->
                            <el-menu-item :index="'/'+subitem.path" v-for="(subitem, j) in item.children"
                                :key="subitem.id"  @click="saveNavState('/'+subitem.path)">
                                <template slot="title">
                                    <i :class="childIcon[subitem.id]"></i>
                                    <span>{{subitem.authName}}</span>
                                </template>
                            </el-menu-item>
                        </el-submenu>
                    </el-menu>
                </el-col>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
        <el-footer>Footer</el-footer>
    </el-container>
</template>
<script>
    export default {
        created() {
            this.getMenus();
            this.activePath=window.sessionStorage.getItem('activePath');
        },
        data() {
            return {
                isCollapse: false,
                munus: [],
                activePath:'/users',
                icons: {
                    '125': '#icon-hat',
                    '103': '#icon-ITquanxian ',
                    '101': '#icon-shangpinguanli ',
                    '102': '#icon-dingdan',
                    '145': '#icon-shuju'

                },
                childIcon: {
                    '110': 'el-icon-lollipop',
                    '111': 'el-icon-sunny ',
                    '112': 'el-icon-moon ',
                    '104': 'el-icon-watermelon',
                    '115': 'el-icon-apple',
                    '121': 'el-icon-pear ',
                    '107': 'el-icon-s-promotion ',
                    '146': 'el-icon-s-data ',
                }
            }
        },
        methods: {
            logout() {
                this.$message.success('退出成功！');
                window.sessionStorage.clear();
                this.$router.push('/login');
            },
            toggleCollapse() {
                this.isCollapse = !this.isCollapse;
            },
            async getMenus() {
                const { data } = await this.$http.get('menus');
                if (data.meta.status !== 200) {
                    return this.$message.error(res.meta.msg);
                }
                else {
                    this.munus = data.data;
                }
            },
            saveNavState(activePath){
                window.sessionStorage.setItem('activePath',activePath);
                this.activePath=activePath;
            }
        },
    }
</script>
<style scoped>
    .home_container {
        height: 100vh;
    }

    .el-header {
        background: linear-gradient(90deg, #55efc4, #74b9ff, #dfe6e9);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header_left {
        height: inherit;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
    }

    .el-aside {
        display: flex;
    }

    .el-main {
        background-color: #dff9fb;
    }

    .el-footer {
        background-color: #34495e;
    }

    .home_ico {
        height: 100%;
        width: auto;
        margin-left: 30px;

    }

    .home_aside {
        flex: 1;
    }

    .icon {
        margin-right: 5px;
    }
</style>