 //控制层 
app.controller('userController' ,function($scope,$controller,userService){

	
	$scope.reg = function () {
		//比较两次输入的密码是否一致
		if($scope.entity.password != $scope.password){
			alert("两次输入密码不一致，请重新输入！");
            $scope.entity.password == "";
            $scope.password = "";
			return ;
		}
		//新增
		userService.add($scope.entity,$scope.smsCode).success(
			function (response) {
				alert(response.message);
            }
		);
    }

    //发送验证码
    $scope.sendCode = function () {
		if($scope.entity.phone != null && !$scope.entity.phone.length > 0){
			alert("请填写手机号码");
			return ;
		}

		userService.sendCode($scope.entity.phone).success(
			function (response) {
				alert(response.message);
            }
		);
    }
    
});	
