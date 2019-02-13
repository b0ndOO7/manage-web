
个人第一个vue项目，在不断学习中逐渐完善各功能


manage-web 项目，是接口自动化平台web端（期望做成兼容web、api的自动化平台，暂先满足api自动化需求）
系统主要采用 vue + axios + router + element组件 架构，在整个开发过程，也是对vue学习的过程，也是修修补补不断完善的过程;
难免存在方法、组件使用不恰当之处。

manage-web项目需配合使用 api_auto_test_platform<https://github.com/b0ndOO7/api_auto_test_platform> 后台项目使用


自动化测试平台，旨在打造一个分布式的自动化测试平台，集管理测试用例、测试数据，收集测试结果，合成测试报告等功能；控制执行机进行用例执行。


整体框架：
前端：vue + axios + router + element-ui
后端：spring boot + mybatis + httpclient + redis + mysql （暂时用到这些）


体验地址：
https://autotest.v11v.ml

注：家里路由做为服务器，会存在不稳定情况，待有时间、精力，重新申请域名、vps搭建稳定环境
若有幸你能访问该网址，请一定要轻虐，家庭router搞不住逛XX


开发环境搭建：
// todo


踩坑记录：
20190213：npm run build打包部署后，自定义样式不起效；
          解决方法：修改main.js中css文件 import顺序
