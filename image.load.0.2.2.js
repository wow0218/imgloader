(function(window){
	/*	简单的 图片资源加载器
	 *	兼容性	：{ PC: [IE9+,Chrome,FireFox] , Mobile: [] }
	 *  @author	: "WangPeng"
	 *	@email	: "wow0218@163.com"
	 *	@version: 
	 *		"0.2.0":增加音频/视频文件的加载,
	 		"0.2.1":增加 CMD,AMD 引用
	 		"0.2.2":修复 音频/视频文件 replay时 触发imgLoaded事件的BUG
	 *	@param {String | Array | JSON } property | arg0 
	 *		String : 准备加载的图片
	 *		Array  : 准备加载的图片资源队列
	 * 		JSON   ：准备加载的图片或图片资源队列、加载完成后回调、加载进度回调。格式为：
	 *			{
	 *				"assets"	: 准备加载的图片或图片资源队列 {String | Array}
	 *				"completed"	: 加载完成后回调 {function}
	 *				"progress"	: 加载进度回调 {function}
	 *			}
	 *			注：如果第一个参数为JSON 格式，则会忽略后面的所有参数
	 *
	 *	@param {Function | JSON } options | arg1
	 *		Function : 加载完成后回调
	 *			@param	{Integer}	arg0	加载进度百分比数 【0~100】
	 *			@param	{Integer}	arg1	加载数量{百分数,成功数量，总数，失败数量}
	 *		JSON 	 : 加载完成后回调、加载进度回调。格式为：
	 *			{
	 *				"completed"	: 加载完成后回调 {function}
	 *				"progress"	: 加载进度回调 {function}
	 *			}	
	 *			注：如果第二个参数为JSON 格式，则会忽略后面的所有参数
	 *	
	 *	@param {Function} arg2
	 *		Function : 加载进度回调
	 *			@param	{Integer}	arg0	加载进度百分比数 【0~100】
	 *			@param	{Integer}	arg1	加载数量{百分数,成功数量，总数，失败数量}
	 *
	 *	Public Function
	 *		func load : {Main Function}	执行加载
	 *			@param	参数列表同以上。
	 *	
	 *	Public Property
	 *		assets	{Object}	加载资源列表(含加载状态。不论是否加载成功)
	 *		asset 	{Object}	加载成功 资源列表
	 *
	 */

	function ImgLoader(property,options){
		var onloadedcompleted	,// 加载完成回调
			onloading			,// 加载进度回调
			NUM_ELEMENTS = 0	,// 资源总数
			NUM_LOADED = 0		,// 已加载数量
			NUM_ERROR = 0		,// 加载错误数量
			TempProperty = {}	,// 资源列表
			LOADED_THEMES={}	,// 加载成功的资源
			// imgUrlHash={}		,// 图片资源链接相对/绝对映射
			// mediaDuring=0		,// 媒体资源总长度
			// mediaBuffer=0		,// 已加载媒体资源长度
			NUM_MEDIA_COUNT=0	,// 媒体数量
			NUM_MEDIA_LOADED=0	,// 已加载媒体数量
			NUM_MEDIA_ERROR=0	;// 加载失败媒体数量
			//不需要单独定义待加载资源队列
			//loadList = [] 		;// 待加载资源队列
		var timerId=null;
		this.assets=TempProperty;//对象引用
		this.asset=LOADED_THEMES;
		this.load=function(prop,opt){
			var loadList=[];
			//初始化参数
			if(typeof(prop) == 'string'){
				loadList[0]=prop;
			}else if(Object.prototype.toString.apply(prop)=='[object Array]'){
				//property 为数组 对象 则考虑其他参数
				loadList=prop;

				//回调函数,每次初始化都是覆盖
				if(typeof(opt) == 'function'){
					onloadedcompleted	=	opt;
					onloading			=	typeof(arguments[2])=='function'? arguments[2] : onloading;
				}else if(typeof(opt) == 'object'){
					onloadedcompleted	=	opt['completed']	||	onloadedcompleted	;
					onloading			=	opt['progress']		||	onloading			;
				}
			}else if(typeof(prop) == 'object'){
				//property 为json 对象 则不考虑其他参数
				loadList			=	prop['assets']		||	[]					;
				onloadedcompleted	=	prop['completed']	||	onloadedcompleted	;
				onloading			=	prop['progress']	||	onloading			;
			}

			// 不需要重置，仅在对象实例化时定义
			//图片资源总数
			//NUM_ELEMENTS +=loadList.length;
			
			// NUM_LOADED = 0;
			// NUM_ERROR = 0;
			// TempProperty = {};// 资源列表
			// LOADED_THEMES={};

			for(var i=0;i<loadList.length;i++){
				var src=loadList[i];
				//已经开始加载了,没有判断是否加载成功
				if(TempProperty[src] != undefined ){continue;}

				if(/\.jpg$|\.jpeg$|\.png$|\.gif$/.test(src.toLowerCase())){ //后缀名判断 图片资源
					NUM_ELEMENTS++;
					loadImg(src);
				}else if(/\.mp3$|\.ogg$|\.wav$/.test(src.toLowerCase())){ 	//后缀名判断 音频资源
					NUM_MEDIA_COUNT++;
					loadAudio(src);
				}else if(/\.mp4$|\.webm$|\.ogv$/.test(src.toLowerCase())){ 	//后缀名判断 视频资源
					NUM_MEDIA_COUNT++;
					loadVideo(src);
				}else{	// 不符合格式要求的文件不加载
					NUM_ELEMENTS++;
					//按照 图片加载失败调用
					NUM_ERROR++;
					assetsLoaded();
				}
			}
		};
		function loadImg(img){
			var image=new Image();
			// 改用W3C DOM2标准
			// image.onload=loaded;
			// image.onerror=error;
			image.addEventListener("load",function(e){
				NUM_LOADED++;
				assetsLoaded();
				this.removeEventListener("load",arguments.callee,false);
			},false);
			image.addEventListener("error",function(e){
				NUM_ERROR++;
				//console.log(this);
				assetsLoaded();
				this.removeEventListener("error",arguments.callee,false);
			},false);
			image.src=img;
			//存储资源引用
			TempProperty[img]=image;
		};
		function loadAudio(audio){
			// 音频文件能直接new创建
			var music=new Audio();

			// 加载过程无法获取，废弃这2个事件监听
			//var duration=0,buffer=0; //单位秒
			//music.addEventListener("loadedmetadata",function(e){
			//	//console.log("成功获取资源长度:");
			//	var d = this.duration - duration;
			//	mediaDuring +=d;
			//	duration = this.duration;
			//},false);
			//music.addEventListener("durationchange",function(e){
			//	//console.log("资源长度改变 ");
			//	var d = this.duration - duration;
			//	mediaDuring +=d;
			//	duration = this.duration;
			//},false);
			/* 
			 * //不会在正确的时间触发 
				music.addEventListener("progress",function(e){
					console.log("客户端正在请求数据 ");
					var b=this.buffered.end(0)-buffer;
					mediaBuffer +=b;
					buffer = this.buffered.end(0);
					assetsLoaded();
				},false);
			*/
			music.addEventListener("canplay",function(e){
				//"可以播放，但中途可能因为加载而暂停 ";
				NUM_MEDIA_LOADED++;
				//mediaBuffer += (duration - buffer);
				//buffer = duration;
				//console.log("canplay");
				assetsLoaded();
				//清除事件
				this.removeEventListener("canplay",arguments.callee,false);
			},false);
			music.addEventListener("error",function(e){
				//"请求数据时遇到错误 ";
				NUM_MEDIA_ERROR++;
				//mediaBuffer += (duration - buffer);
				//buffer = duration;
				assetsLoaded();
				//清除事件
				this.removeEventListener("error",arguments.callee,false);
			},false);
			music.src=audio;
			music.load();
			//存储资源引用
			TempProperty[audio]=music;
		};
		function loadVideo(video){
			//视频文件创建DOM
			var music=document.createElement('video');
			// 加载过程无法获取，废弃这2个事件监听
			//var duration=0,buffer=0; //单位秒
			// music.addEventListener("loadedmetadata",function(e){
			// 	//console.log("成功获取资源长度:");
			// 	var d = this.duration - duration;
			// 	mediaDuring +=d;
			// 	duration = this.duration;
			// },false);
			// music.addEventListener("durationchange",function(e){
			// 	//console.log("资源长度改变 ");
			// 	var d = this.duration - duration;
			// 	mediaDuring +=d;
			// 	duration = this.duration;
			// },false);		
			music.addEventListener("canplay",function(e){
				//"可以播放，但中途可能因为加载而暂停 ";
				NUM_MEDIA_LOADED++;
				//mediaBuffer += (duration - buffer);
				//buffer = duration;
				assetsLoaded();
				this.removeEventListener("canplay",arguments.callee,false);
			},false);
			music.addEventListener("error",function(e){
				//"请求数据时遇到错误 ";
				NUM_MEDIA_ERROR++;
				//mediaBuffer += (duration - buffer);
				//buffer = duration;
				assetsLoaded();
				this.removeEventListener("error",arguments.callee,false);
			},false);
			music.src=video;
			music.load();
			//存储资源引用
			TempProperty[video]=music;
		};

		function checkProgress(){
			// var imgprogress =0, mediaprogress=0;
			// var imgPercent,mediaPercent;
			// if(!!NUM_ELEMENTS){
			// 	imgPercent =(NUM_LOADED+NUM_ERROR)/NUM_ELEMENTS *100;
			// 	imgprogress =1;
			// }else{
			// 	imgPercent =0;
			// }
			// 没有用到 流数据
			// if(!!mediaDuring){
			// 	mediaPercent =mediaBuffer/mediaDuring* 100;
			// 	mediaprogress =1;
			// }else{
			// 	mediaPercent =0;
			// }
			//var progress = !!(imgprogress + mediaprogress) ? Math.floor((imgPercent+mediaPercent)/(imgprogress + mediaprogress)) : 100;
			var progress = !!(NUM_ELEMENTS + NUM_MEDIA_COUNT) ? Math.floor((NUM_LOADED + NUM_MEDIA_LOADED + NUM_ERROR + NUM_MEDIA_ERROR)/(NUM_ELEMENTS + NUM_MEDIA_COUNT) * 100) : 100;

			return {
				"progress": progress,
				"loaded":NUM_LOADED + NUM_MEDIA_LOADED,
				"error":NUM_ERROR + NUM_MEDIA_ERROR,
				"total":NUM_ELEMENTS + NUM_MEDIA_COUNT
			}
		};
		function assetsLoaded(){
			var data= checkProgress();
			if(data.progress>=100){
				clearTimeout(timerId);
				//先调用 progress  100% 然后延迟200ms 调用 completed
				typeof(onloading) =='function' && onloading(100,data);
				timerId=setTimeout(function(){
					//加载完毕 则调用completed
					typeof(onloadedcompleted) =='function' && onloadedcompleted(Math.min(100,data.progress),data);
				},500);
			}else{
				//加载进行中...调用 onloading
				typeof(onloading) =='function' && onloading(Math.min(100,data.progress),data);
			}
		};
		this.load.apply(this,arguments);
	};

	/*	使用方式介绍
	 *	1.设置资源列表：
	 *		var assets=[...]; //预加载图片列表数组
	 *
	 *	2.预定义加载进度回调和 加载完成时的回调
	 *		function progress(a,b){  //加载进度回调
	 *			var per=a+"%"; //计算当前百分比
	 *		}
	 *		function completed(a,b){
	 *			alert("completed");
	 *		}
	 *		注：回调function可以在传递的时候直接定义为匿名函数。例如：
	 *			var loader1=new ImgLoader(assets,function(a,b){...},function(a,b){...});
	 *
	 *	3.实现对象并开始执行加载
	 *		var loader1=new ImgLoader(assets,completed,progress);
	 *	  可以多种实现方式
	 *		方式 1 :
	 *			var loader1=new ImgLoader(assets,completed,progress);
	 *					
	 *		方式 2 ：
	 *			var loader2=new ImgLoader(assets,{
	 *				"completed":completed,
	 *				"progress":progress
	 *			});
	 *
	 *		方式 3 ：
	 *			var loader3=new ImgLoader({
	 *				"assets":assets,
	 *				"completed":completed,
	 *				"progress":progress
	 *			});
	 *
	 *		方式 4 ：
	 *			var loader4=new ImgLoader();
	 *			loader4.load(assets,{
	 *				"completed":completed,
	 *				"progress":progress
	 *			});
	 *			注：此处的参数传递方式可以按照上面3种的任意一种形式
	 */

	if ( typeof define === "function" && define.amd ) {
		define( "ImgLoader", [], function() {
			return ImgLoader;
		});
	}
	window.ImgLoader =ImgLoader;
 })(typeof window !== "undefined" ? window : this);