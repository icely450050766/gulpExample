//动态刷新页面的配置
var gulp = require("gulp");
var del = require("del");//删除文件
var bytediff = require("gulp-bytediff");//计算压缩前后的文件大小差异
var header = require("gulp-header");//为每个文件添加文件头备注，装逼用
var runSequence = require("run-sequence");//串行运行gulp代码(因为gulp本身是并行运行的)
var livereload = require("gulp-livereload");//动态刷新
var cleanCss = require('gulp-clean-css');    //css压缩
var uglify = require('gulp-uglify');//JS压缩
var htmlmin = require('gulp-htmlmin');//html压缩
var imagemin = require("gulp-imagemin");//图片压缩
var tinypng = require("gulp-tinypng");//另一种图片压缩技术,在线压缩技术，比较慢
var autoprefixer = require('gulp-autoprefixer');//添加css样式的前缀

var beforeSize = 0;//经过gulp处理前，整个项目的大小
var afterSize = 0;//经过gulp处理后，整个项目的大小

//转换文件单位
function getUnit(size) {
    var unitArr = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var index = 0;

    var srcSize = parseFloat(size);
    var quotient = srcSize;//quotient：商
    while (quotient > 1024) {
        index += 1;
        quotient = quotient / 1024;
    }
    return quotient.toFixed(2) + " " + unitArr[index];
}

//计算单个文件压缩效果
function bytediffFormatter(data) {//比较文件大小的函数
    beforeSize += data.startSize;
    afterSize += data.endSize;
    var difference = (data.savings > 0) ? '  smaller.' : ' larger.';
    return data.fileName + '   ' + getUnit(data.startSize) + '   To  ' + getUnit(data.endSize) + '   ' + (100 - data.percent * 100).toFixed(2) + '%' + difference;
}


//动态刷新
gulp.task("reload", function () {
    livereload.listen();
    gulp.watch(["./build/*.*", "./build/**/*.*"], function (file) {
        livereload.reload(file)
    });
});

//删除整个publish文件夹
gulp.task("clearProject", function () {
    return del(["./publish/*"])
});

//全部复制，将整个项目的资源全部复制过去
gulp.task('copyAll', function () {
    var inputDir = './build/**/* ';//输入
    var outputDir = './publish/';//输出
    return gulp.src(inputDir).pipe(gulp.dest(outputDir));//将项目整个复制

});

// css的相关操作
gulp.task('cssDeal', function () {
    var inputDir = './build/css/*.css';//输入
    var outputDir = './publish/css';//输出
    var options = {
        browsers: ['last 2 versions', 'Android >= 4.0', "ff > 20"],
        cascade: true, //是否美化属性值 默认：true 像这样：
        //-webkit-transform: rotate(45deg);
        //        transform: rotate(45deg);
        remove: true //是否去掉不必要的前缀 默认：true
    };

    return gulp.src(inputDir)
        .pipe(bytediff.start())//开始计算
        .pipe(autoprefixer(options))
        .pipe(cleanCss())//压缩css
        .pipe(header('/*' + "createBy <%= name %>" + "*/\n", {name: 'icely'}))//在文件头部添加代码，用于添加版权信息，使用方法和模板相同
        .pipe(bytediff.stop(bytediffFormatter))//输出压缩大小
        .pipe(gulp.dest(outputDir));//导出css文件
});

// js的相关操作
gulp.task('jsDeal', function () {
    var inputDir = './build/js/*.js';//输入
    var outputDir = './publish/js';//输出

    return gulp.src(inputDir)
        .pipe(bytediff.start())//开始计算
        .pipe(uglify())//压缩js
        .pipe(header('/*' + "createBy <%= name %>" + "*/\n", {name: 'icely'}))//在文件头部添加代码，用于添加版权信息，使用方法和模板相同
        .pipe(bytediff.stop(bytediffFormatter))//输出压缩大小
        .pipe(gulp.dest(outputDir));//导出js文件
});

// html的相关操作
gulp.task('htmlDeal', function () {
    var inputDir = './build/html/*.html';//输入
    var outputDir = './publish/html';//输出
    var options = {//压缩配置的参数
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true//删除<style>和<link>的type="text/css"
    };


    return gulp.src(inputDir)
        .pipe(bytediff.start())//开始计算
        .pipe(htmlmin(options))//压缩html
        .pipe(header('<!--' + "createBy <%= name %>" + "-->", {name: 'icely'}))//在文件头部添加代码，用于添加版权信息，使用方法和模板相同
        .pipe(bytediff.stop(bytediffFormatter))//输出压缩大小
        .pipe(gulp.dest(outputDir));//导出html文件
});

//图片压缩
gulp.task("imageDeal", function () {
    var inputDir = './build/image/*.*';//输入
    var outputDir = './publish/image/';//输出
    var options = {//压缩配置的参数
        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: true, //类型：Boolean 默认：fagulplse 隔行扫描gif进行渲染
        multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
    };
    return gulp.src(inputDir)
        .pipe(bytediff.start())//开始计算
        .pipe(imagemin(options))//压缩图片
        .pipe(bytediff.stop(bytediffFormatter))//输出压缩大小
        .pipe(gulp.dest(outputDir));//导出图片文件
});


//空操作
gulp.task("empty", function () {});

//串行运行
gulp.task('run', function () {
    runSequence(//设置串行运行，保证先后顺序
        "clearProject",
        "copyAll",
        "cssDeal",
        "jsDeal",
        "htmlDeal",
        "imageDeal",
        function () {//计算整个项目经过gulp处理后的大小
            console.log("beforeSize:" + getUnit(beforeSize) + "     afterSize:" + getUnit(afterSize) + "     CompressPrecent:" + ((1 - afterSize / beforeSize) * 100).toFixed(2))
        }
    )
});

gulp.task("default", ["run"]);

//独立的只执行一次的gulp
gulp.task("tinypng", function () {
    console.log("tinypng_momo");
    var key1 = "XgNgkoyWbdIZd8OizINMjX2TpxAd_Gp3";//阿里个人邮箱
    var key2 = "IAl6s3ekmONUVMEqWZdIp1nV2ItJLyPC";//恒拓邮箱
    var inputDir = './build/image/*.*';//输入
    var outputDir = './publish/image/';//输出

    return gulp.src(inputDir)
        .pipe(bytediff.start())//开始计算
        .pipe(tinypng(key2))//压缩图片
        .pipe(bytediff.stop(bytediffFormatter))//输出压缩大小
        .pipe(gulp.dest(outputDir));//导出图片文件
});













