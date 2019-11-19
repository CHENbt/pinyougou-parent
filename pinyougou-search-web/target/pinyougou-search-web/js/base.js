//定义模块
var app=angular.module('pinyougou',[]);
//定义过滤器 一个过滤器只做一种过滤
app.filter('trustHtml',['$sce',function ($sce) {
    //这里的data是被过滤的内容，这就是传过来的要被过滤的内容
    return function (data) {
        //返回的就是过滤后的内容(信任html的转换)
        return $sce.trustAsHtml(data);
    }

}]);