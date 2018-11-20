 //控制层 
app.controller('goodsController' ,function($scope,$controller,$location,goodsService, uploadService,itemCatService,typeTemplateService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	}    
	
	//分页
	$scope.findPage=function(page,rows){			
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}
	
	//查询实体 
	$scope.findOne=function(){
		var id = $location.search()['id'];
		if(id == null){
			return ;
		}
		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;
				editor.html($scope.entity.tbGoodsDesc.introduction); //商品介绍
                //商品图片
				$scope.entity.tbGoodsDesc.itemImages = JSON.parse($scope.entity.tbGoodsDesc.itemImages);
                //扩展属性
				$scope.entity.tbGoodsDesc.customAttributeItems = JSON.parse($scope.entity.tbGoodsDesc.customAttributeItems);
				//规格选择
                $scope.entity.tbGoodsDesc.specificationItems = JSON.parse( $scope.entity.tbGoodsDesc.specificationItems);
				//转化SKU列表中的规格对象
				for(var i = 0 ; i < $scope.entity.itemList.length ; i ++){
					$scope.entity.itemList[i].spec = JSON.parse($scope.entity.itemList[i].spec);
				}


			}
		);
	}
	
	//保存 
	$scope.save=function(){
        $scope.entity.tbGoodsDesc.introduction = editor.html();

		var serviceObject;//服务层对象  				
		if($scope.entity.tbGoods.id!=null){//如果有ID
			serviceObject=goodsService.update( $scope.entity ); //修改  
		}else{
			serviceObject=goodsService.add( $scope.entity  );//增加 
		}				
		serviceObject.success(
			function(response){
				if(response.success){
                    alert("保存成功");
                   location.href='goods.html';
				}else{
					alert(response.message);
				}
			}		
		);				
	}
	
	 
	//批量删除 
	$scope.dele=function(){			
		//获取选中的复选框			
		goodsService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
					$scope.selectIds=[];
				}						
			}		
		);				
	}
	
	$scope.searchEntity={};//定义搜索对象 
	
	//搜索
	$scope.search=function(page,rows){			
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}

	$scope.image_entity={};

	//上传图片
	$scope.uploadFile = function () {
        uploadService.uploadFile().success(
			function (response) {
				if(response.success){
                    $scope.image_entity.url =response.message;//设置文件地址
				}else{
					alert(response.message);
				}
            }
		);
    }

	$scope.entity = {tbGoods:{},tbGoodsDesc:{itemImages:[],specificationItems:[]}};

    //将当前上传的图片保存到图片列表中
	$scope.add_image_entity = function () {
		$scope.entity.tbGoodsDesc.itemImages.push($scope.image_entity);
    }

    $scope.remove_image_entity = function (index) {
        $scope.entity.tbGoodsDesc.itemImages.splice(index,1);
    }


    //查询一级商品分类列表
    $scope.selectItemCart1List = function () {
		itemCatService.findByParentId(0).success(
			function (response) {
				$scope.itemCart1List = response;
            }
		);
    }

    /*
    监控方法中的参数的名称是固定的写法
     */
    //查询二级分类列表
    $scope.$watch('entity.tbGoods.category1Id',function (newValue,oldValue) {
        itemCatService.findByParentId(newValue).success(
            function (response) {
                $scope.itemCart2List = response;
            }
        );
    });

    //查询三级分类列表
    $scope.$watch('entity.tbGoods.category2Id',function (newValue,oldValue) {

        itemCatService.findByParentId(newValue).success(
            function (response) {
                $scope.itemCart3List = response;
            }
        );
    });


    //读取模板id
    $scope.$watch('entity.tbGoods.category3Id',function (newValue,oldValue) {
		itemCatService.findOne(newValue).success(
			function (response) {
				$scope.entity.tbGoods.typeTemplateId = response.typeId;
            }
		);
    });

    //读取模板id后，读取品牌列表
    $scope.$watch('entity.tbGoods.typeTemplateId',function (newValue,oldValue) {
		typeTemplateService.findOne(newValue).success(
			function (response) {
				$scope.typeTemplate=response; //模板对象
                $scope.typeTemplate.brandIds = JSON.parse($scope.typeTemplate.brandIds);  //品牌列表类型转换

				//扩展属性
				if($location.search()['id']  == null){//如果是增加商品
                    $scope.entity.tbGoodsDesc.customAttributeItems =  JSON.parse($scope.typeTemplate.customAttributeItems);
				}

            }
		);

		//读取规格
        typeTemplateService.findSpecList(newValue).success(
        	function (response) {
				$scope.specList = response;
            }
		);

    });

    //这个方法是在选定规格选项后添加到这个集合中
    $scope.updateSpecAttribute = function ($event,name,value) {
		var object = $scope.searchObjectByKey($scope.entity.tbGoodsDesc.specificationItems,'attributeName',name);
		if(object != null){
			if($event.target.checked){
                object.attributeValue.push(value);
			}else{ //取消勾选
                object.attributeValue.splice(object.attributeValue.indexOf(value),1); //移除选项
				if( object.attributeValue.length == 0){
                    $scope.entity.tbGoodsDesc.specificationItems.splice(//如果选项中没有选中的内容，就将整个对象取消
                    	$scope.entity.tbGoodsDesc.specificationItems.indexOf(object),1);
				}
			}

		}else{
            $scope.entity.tbGoodsDesc.specificationItems.push({'attributeName':name,'attributeValue':[value]});
		}
    }

    $scope.createItemList = function () {

    	$scope.entity.itemList = [{spec:{},price:0,num:99999,status:'0',idDefault:'0'}];//列表初始化

		var items =  $scope.entity.tbGoodsDesc.specificationItems;

		for(var i = 0 ; i < items.length; i ++ ){
            $scope.entity.itemList = addColunm($scope.entity.itemList,items[i].attributeName,items[i].attributeValue);
		}

    }
    
    addColunm = function (list, columnName,columnValues) {
		var newList = [];
		for(var i = 0 ; i < list.length ; i ++ ){
			var oldRow = list[i]
			for(var j = 0 ; j < columnValues.length; j ++){
				var newRow = JSON.parse(JSON.stringify(oldRow)); //深克隆
				newRow.spec[columnName] = columnValues[j];
                newList.push(newRow);
			}
		}


		return newList;
    }


    $scope.status = ['未审核','已审核','审核未通过','已关闭'];

    $scope.itemCatList = [];//商品分类列表

    $scope.findItemCastList = function () {
		itemCatService.findAll().success(
			function (response) {
				for(var i = 0 ; i < response.length ; i ++){
					$scope.itemCatList[response[i].id] = response[i].name;
				}
            }
		);
    }

    //判断某规格与规格选项是否应该被勾选
    $scope.checkAttributeValue = function (specName,optionName) {
 		var items =  $scope.entity.tbGoodsDesc.specificationItems;
 		var object = $scope.searchObjectByKey(items,'attributeName',specName);

 		if(object != null){
 			if(object.attributeValue.indexOf(optionName) >= 0){//如果能够查询到规格选项
				return true;
			}else{
 				return false;
			}

		}else{
 			return false;
		}
    }

});	
