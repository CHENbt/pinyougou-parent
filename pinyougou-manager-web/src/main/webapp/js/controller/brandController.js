
app.controller('brandController',function($scope,$http,$controller,brandService){

    $controller('baseController',{$scope:$scope});



    //查询品牌列表
    $scope.findAll=function(){
        brandService.findAll().success(
            function(response){
                $scope.list=response;
            }
        );
    }



    //分页
    $scope.findPage=function(page,size){
        brandService.findPage(page,size).success(
            function(response){
                $scope.list=response.rows;//显示当前页数据
                $scope.paginationConf.totalItems=response.total;//更新总记录数
            }
        );
    }


    //新增
    $scope.save = function () {
        var object = null;
        if($scope.entity.id != null){
            object = brandService.update($scope.entity);
        }else{
            object = brandService.add($scope.entity);
        }

        object.success(
            function (response) {
                if(response.success){
                    $scope.reloadList(); //刷新
                }else{
                    alert(response.message)
                }
            }
        );
    }

    //查询实体
    $scope.findOne = function (id) {
        brandService.findOne(id).success(
            function (response) {
                $scope.entity = response;
            }
        );
    }

    $scope.selectIds = [];

    //用户勾选复选框
    $scope.updateSelection = function ($event,id) { //方法参数中的第一个参数是源$event
        if($event.target.checked){ //$event.target 获得的就是当前的input,而复选框有一个checked，值为true，就选中，值为false就是没有选中
            $scope.selectIds.push(id);//push方法向集合中添加元素
        }else{
            var index = $scope.selectIds.indexOf(id); //indexOf的方法是查找传入的id，找到这个id在selectIds集合中的id
            $scope.selectIds.splice(index,1);//参数一是删除的位置，参数二是要删除的个数
        }

    }

    //删除
    $scope.dele = function () {
        brandService.dele($scope.selectIds).success(
            function (response) {
                if(response.success){
                    $scope.reloadList();//刷新
                }else{
                    alert(response.message);
                }
            }
        );
    }

    $scope.searchEntity = {}; //做这一步的原因是做一个初始化，如果没有这一步，$scope.searchEntity的值是一个null,就会有400,bad request的错误

    /*
    这里需要注意的一点是在做查询的时候，并不是写完查询方法就直接的调用了这个查询方法，而是通过刷新列表的的方法来间接的调用了这个方法
    如果在button标签上直接调用也是可以的，但是需要传入很长的参数，因为如果不传也会有400错误，因为在调用方法的时候方法中的参数没有传入，两个变量都是undined
     */
    //条件查询
    $scope.search = function (page,size) {

        brandService.search(page,size,$scope.searchEntity).success(
            function(response){
                $scope.list=response.rows;//显示当前页数据
                $scope.paginationConf.totalItems=response.total;//更新总记录数
            }
        );
    }
});