app.service('shopLoginService', function ($http) {

    this.shopLoginName = function () {
        return $http.get('../shopLogin/name.do');
    }

});