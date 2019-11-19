//购物车控制层
app.controller('cartController',function($scope,cartService){
    //查询购物车列表
    $scope.findCartList=function(){
        cartService.findCartList().success(
            function(response){
                $scope.cartList=response;
                $scope.totalValue = cartService.sum($scope.cartList);
            }
        );
    }

    //数量加减
    $scope.addGoodsToCartList = function (itemId, num) {
        cartService.addGoodsToCartList(itemId, num).success(
            function (response) {
                if(response.success){ //如果成功
                    $scope.findCartList(); //刷新列表
                }else{
                    alert(response.message);
                }
            }
        );
    }

    //获取当前用户的地址列表
    $scope.findAddressList = function () {
        cartService.findAddressList().success(
            function (response) {
                $scope.addressList = response;
                for(var i = 0 ; i <  $scope.addressList.length ; i ++){
                    if( $scope.addressList[i].isDefault == '1'){
                        $scope.address =  $scope.addressList[i];
                        break;
                    }
                }
            }
        );
    }

    //选择地址
    $scope.selectAddress = function (address) {
        $scope.address = address ;
    }

    //判断某地址对象是否是当前选择的地址
    $scope.isSlelectedAddress = function (address) {
         if(address == $scope.address){
             return true ;
         }else{
             return false;
         }
    }


    $scope.order = {pamentType:'1'};

    //选择支付类型
    $scope.selectPayType = function (type) {
        $scope.order.pamentType = type ;

    }

    //保存订单
    $scope.submitOrder = function () {

        $scope.order.receiverAreaName = $scope.address.address;
        $scope.order.receiverMobile = $scope.address.mobile;
        $scope.order.receiver = $scope.address.contact;

        cartService.submitOrder($scope.order).success(
            function (response) {
                alert(response.message);
            }
        );
        
    }

});
