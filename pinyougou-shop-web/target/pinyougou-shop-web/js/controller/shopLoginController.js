app.controller('shopLoginController',function ($scope,shopLoginService) {

    //显示当前用户名
    $scope.showShopLoginName = function () {
        shopLoginService.shopLoginName().success(
            function (response) {
                $scope.showLoginName = response.shopLoginName;
            }
        );
    }
});