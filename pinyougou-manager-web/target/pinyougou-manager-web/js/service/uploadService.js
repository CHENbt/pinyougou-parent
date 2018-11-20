app.service('uploadService',function ($http) {

    //上传文件
    this.uploadFile = function () {
        //FormData是HTML5种新增的一个类，在文件上传的时候用，上传时候用到二进制数据的就要用到这个类
        var formdata = new FormData();
        formdata.append('file',file.files[0]);  //file文件上传框的name
        return $http({
            method:'POST',
            url:'../upload.do',
            data:formdata,
            headers:{'Content-Type':undefined},
            transformRequest:angular.identity
        });
    }
});