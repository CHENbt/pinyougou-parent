app.service('loginService',function ($http) {

    //读取数据列表绑定到列表中
    this.showName = function () {
        return $http.get('../login/name.do');
    }
    
});