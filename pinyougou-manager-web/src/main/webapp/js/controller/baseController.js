app.controller('baseController',function ($scope) {

    //分页控件配置currentPage:当前页   totalItems :总记录数  itemsPerPage:每页记录数  perPageOptions :分页选项  onChange:当页码变更后自动触发的方法
    $scope.paginationConf = {
        currentPage: 1,
        totalItems: 10,
        itemsPerPage: 10,
        perPageOptions: [10, 20, 30, 40, 50],
        onChange: function(){
            $scope.reloadList();
        }
    };

    //刷新列表
    $scope.reloadList=function(){
        $scope.search( $scope.paginationConf.currentPage ,  $scope.paginationConf.itemsPerPage );
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


    $scope.jsonToString = function (jsonString , key) {
        var json = JSON.parse(jsonString);
        var value = "";

        for(var i = 0 ; i < json.length; i ++){
            value +=", " +json[i][key];
        }

        return value;
        
    }
});