import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            redirect: '/index'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[
                {
                    path: '/index',
                    component: resolve => require(['../components/page/Dashboard.vue'], resolve),
                    meta: { title: '首页' }
                },

                {
                    path: '/project',
                    component: resolve => require(['../components/page/ProjectManage.vue'], resolve),
                    meta: { title: '项目管理' },
                    children:[
                    ]
                },
                {
                    path: '/projects',
                    component: resolve => require(['../components/page/ProjectManage.vue'], resolve),
                    meta: { title: '项目列表' }
                },
                {
                    path: '/modules',
                    component: resolve => require(['../components/page/ModulesHome.vue'], resolve),
                    meta: { title: '功能模块' }
                },


                {
                    path: '/testmanage',
                    component: resolve => require(['../components/page/BaseTable.vue'], resolve),
                    meta: { title: '测试管理' }
                },
                {
                    path: '/hostmanage',
                    component: resolve => require(['../components/page/HostManage.vue'], resolve),
                    meta: { title: 'HOST配置' }
                },
                {
                    path: '/apimanage',
                    component: resolve => require(['../components/page/APIManage.vue'], resolve),
                    meta: { title: '接口管理' }
                },
                {
                    path: '/testcase',
                    component: resolve => require(['../components/page/TestCase.vue'], resolve),
                    meta: { title: '测试用例' }
                },
                {
                    path: '/testsuit',
                    component: resolve => require(['../components/page/TestCase.vue'], resolve),
                    meta: { title: '测试集' }
                },





                {
                    path: '/echart',
                    component: resolve => require(['../components/page/Tabs.vue'], resolve),
                    meta: { title: 'tab选项卡' }
                },
                {
                    path: '/about',
                    component: resolve => require(['../components/page/BaseForm.vue'], resolve),
                    meta: { title: '基本表单' }
                },
                {
                    // 富文本编辑器组件
                    path: '/editor',
                    component: resolve => require(['../components/page/VueEditor.vue'], resolve),
                    meta: { title: '富文本编辑器' }
                },
                {
                    // markdown组件
                    path: '/markdown',
                    component: resolve => require(['../components/page/Markdown.vue'], resolve),
                    meta: { title: 'markdown编辑器' }
                },
                {
                    // 图片上传组件
                    path: '/upload',
                    component: resolve => require(['../components/page/Upload.vue'], resolve),
                    meta: { title: '文件上传' }
                },
                {
                    // vue-schart组件
                    path: '/charts',
                    component: resolve => require(['../components/page/BaseCharts.vue'], resolve),
                    meta: { title: 'schart图表' }
                },
                {
                    // 拖拽列表组件
                    path: '/drag',
                    component: resolve => require(['../components/page/DragList.vue'], resolve),
                    meta: { title: '拖拽列表' }
                },
                {
                    // 权限页面
                    path: '/permission',
                    component: resolve => require(['../components/page/Permission.vue'], resolve),
                    meta: { title: '权限测试', permission: true }
                },
                {
                    path: '/404',
                    component: resolve => require(['../components/page/404.vue'], resolve),
                    meta: { title: '404' }
                },
                {
                    path: '/403',
                    component: resolve => require(['../components/page/403.vue'], resolve),
                    meta: { title: '403' }
                }
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve)
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
})
