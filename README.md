一个简单的图片资源加载器。

兼容性	：{ PC: [IE9+,Chrome,FireFox] , Mobile: [] }

version:
	"0.2.0":增加音频/视频文件的加载,
	"0.2.1":增加 CMD,AMD 引用
	"0.2.2":修复 音频/视频文件 replay时 触发imgLoaded事件的BUG

function ImgLoader(property,options){...}
参数说明：
	@param {String | Array | JSON } property | arg0 
		String : 准备加载的图片
		Array  : 准备加载的图片资源队列
		JSON   ：准备加载的图片或图片资源队列、加载完成后回调、加载进度回调。格式为：
			{
				"assets"	: 准备加载的图片或图片资源队列 {String | Array}
				"completed"	: 加载完成后回调 {function}
				"progress"	: 加载进度回调 {function}
			}
		注：如果第一个参数为JSON 格式，则会忽略后面的所有参数
	
	@param {Function | JSON } options | arg1
		Function : 加载完成后回调
			@param	{Integer}	arg0	加载进度百分比数 【0~100】
			@param	{Integer}	arg1	加载数量{百分数,成功数量，总数，失败数量}
		JSON 	 : 加载完成后回调、加载进度回调。格式为：
			{
				"completed"	: 加载完成后回调 {function}
				"progress"	: 加载进度回调 {function}
			}
		注：如果第二个参数为JSON 格式，则会忽略后面的所有参数
	
	@param {Function} arg2
		Function : 加载进度回调
			@param	{Integer}	arg0	加载进度百分比数 【0~100】
			@param	{Integer}	arg1	加载数量{百分数,成功数量，总数，失败数量}
	
	Public Function
		func load : {Main Function}	执行加载
			@param	参数列表同以上。
	
	Public Property
		assets	{Object}	加载资源列表(含加载状态。不论是否加载成功)
		asset 	{Object}	加载成功 资源列表

使用方式步骤
	1.设置资源列表：
		var assets=[...]; //预加载图片(jpg,jpeg,gif,png)、音频(mp3,ogg,wav)、视频(mp4,webm,ogv)的列表数组
	
	2.预定义加载进度回调和 加载完成时的回调
		function progress(a,b){  //加载进度回调
			var per=a+"%"; //计算当前百分比
		}
		function completed(a,b){
			alert("completed");
		}
		注：回调function可以在传递的时候直接定义为匿名函数。例如：
			var loader1=new ImgLoader(assets,function(a,b){...},function(a,b){...});
	3.实现对象并开始执行加载
		var loader1=new ImgLoader(assets,completed,progress);
		可以多种实现方式
		方式 1 :
			var loader1=new ImgLoader(assets,completed,progress);
		
		方式 2 ：
			var loader2=new ImgLoader(assets,{
				"completed":completed,
				"progress":progress
			});
		
		方式 3 ：
			var loader3=new ImgLoader({
				"assets":assets,
				"completed":completed,
				"progress":progress
			});
		
		方式 4 ：
			var loader4=new ImgLoader();
			loader4.load(assets,{
				"completed":completed,
				"progress":progress
			});
			注：此处的参数传递方式可以按照上面3种的任意一种形式
		说明：
			实例化的loader=new ImgLoader()对象，可以多次调用 loader.load(newAssets)方法，加载新的资源。
			加载的新资源将统一追加到 loader.assets属性中。

实际使用：
	var assets=[
		'css/bg1.mp3',
		'images/slogan.png', 'images/bg2.jpg','images/bg3.png',
		'images/btn_1.png', 'images/flower.png', 
		'images/m1.png', 'images/m2.png', 'images/m3.png', 'images/m4.png', 'images/m5.png', 
		'images/m6.png', 'images/m7.png', 'images/m8.png', 'images/m9.png', 'images/m10.png', 'images/m11.png'
	];
	var imgloader=new ImgLoader(assets,function(){
		//加载完成，进度条显示为 100%；
		$('#loadprogress').css({"width":"100%"});
		//加载完成，loading界面隐藏，并显示下一页
		$('#loader').fadeOut(500,function(){
			//....其他处理
		});
	},function(a,b){
		//加载过程中，显示加载进度
		// a : 0~100的整数
		// b : json对象，包含当前的预加载总数、加载成功总数、失败总数
		$('#loadprogress').css({"width":a+"%"});
	});
