app.controller('searchController',function ($scope,$location,searchService) {

    //定义搜索定向的结构
    $scope.searchMap = {'keywords':'','category':'','brand':'','spec':{},'price':'','pageNo':1,'pageSize':40,'sort':'','sortField':''};

    //搜索方法
    $scope.search = function () {
        $scope.searchMap.pageNo = parseInt($scope.searchMap.pageNo);
        searchService.search($scope.searchMap).success(

            function (response) {
                $scope.resultMap = response;
               // $scope.searchMap.pageNo = 1 ; //查询后显示第一页

                //构建分页栏
                buildPageLabel();

            }
        );

    }

    //构建分页栏
    buildPageLabel = function(){

        $scope.pageLabel = [];
        var firstPage = 1 ;
        var lastPage = $scope.resultMap.totalPages;
        $scope.firstPot = true;
        $scope.lastPot  = true;

        if($scope.resultMap.totalPages > 5){  //如果页码数量大于5的时候就要做这个处理
            if($scope.searchMap.pageNo <= 3){ //如果当前页码小于等于3，就显示前5页
                lastPage = 5;
                $scope.firstPot = false; //前边没点
            }else if($scope.searchMap.pageNo >= $scope.resultMap.totalPages - 2){ //如果当前页码大于总页数 - 2，就显示最后5页
                firstPage = $scope.resultMap.totalPages -4 ;
                $scope.lastPot = false;
            }else{  //如果在中间的情况
                firstPage = $scope.searchMap.pageNo - 2;
                lastPage = $scope.searchMap.pageNo + 2 ;
            }

        }else{
            $scope.firstPot = false;
            $scope.lastPot  = false;
        }

        for(var i = firstPage ; i <=  lastPage ;  i ++){
            $scope.pageLabel . push(i);
        }

    }

    //添加搜索项，改变searchMap的值
    $scope.addSearchItem = function (key,value) {

        if(key == 'category' || key == 'brand' || key == 'price'){ //如果用户点击的是分类或者品牌

            $scope.searchMap[key] = value;
        }else{ //除以上之外，用户点击的就是规格
            $scope.searchMap.spec[key] = value;
        }

        $scope.search();  //查询
    }

    $scope.removeSearchItem = function(key){

        if(key == 'category' || key == 'brand'|| key == 'price'){ //如果用户点击的是分类或者品牌

            $scope.searchMap[key] = '';
        }else{ //除以上之外，用户点击的就是规格
            delete $scope.searchMap.spec[key];
        }
        $scope.search();  //查询
    }

    //分压查询
    $scope.qeuryByPage = function (pageNo){

        if(pageNo < 1 || pageNo > $scope.resultMap.totalPages){
            return ;
        }

        $scope.searchMap.pageNo = pageNo;
        $scope.search();
    }

    //判断是否为首页
    $scope.isTopPage = function () {

        if($scope.searchMap.pageNo == 1){
            return true;
        }else{
            return false;
        }
        
    }

    //判断是否为尾页
    $scope.isEndPage = function () {

        if($scope.searchMap.pageNo == $scope.resultMap.totalPages){
            return true;
        }else{
            return false;
        }
    }
    //排序查询
    $scope.sortSearch = function (sortField,sort) {
        $scope.searchMap.sort = sort;
        $scope.searchMap.sortField = sortField;

        $scope.search();//查询
    }

    //判断关键字是是否是品牌
    $scope.keywordsIsBrand = function(){
        for(var i = 0 ; i < $scope.resultMap.brandList.length ; i ++){
            if($scope.searchMap.keywords.indexOf($scope.resultMap.brandList[i].text) >= 0){
                return true;
            }
        }
        return false;
    }

    //加载关键字
    $scope.loadkeywords = function () {
        $scope.searchMap.keywords = $location.search()['keywords'];
        $scope.search();//查询
    }

});
