;(function ($, window, document, undefined) {
	
	//弹窗插件
	var Popup = function(options){
		this.defaults = {
			title: '提示',
			content: '',
			ok: function() {}
		},
		this.options = $.extend({}, this.defaults, options);
	}
	
	Popup.prototype = {
		getModal:function(){
			var html = [];
			var data = this.options;
			html.push('<div class="modal fade" id="uploadTip" tabindex="-1" role="dialog" aria-labelledby="gridSystemModalLabel">');
			html.push('<div class="modal-dialog" role="document" style="width: 300px;">');
			html.push('<div class="modal-content">');
			html.push('<div class="modal-header">')
			html.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
			html.push('<h4 class="modal-title" id="gridSystemModalLabel">'+data.title+'</h4>')
			html.push('</div>')
			html.push('<div class="modal-body">')
			html.push('<span>' + data.content + '</span>')
			html.push('</div>')
			html.push('<div class="modal-footer">')
			html.push('<a class="btn btn-primary" data-dismiss="modal" id="modalYes">确认</a>')
			html.push('</div></div></div></div>')
		
			return html.join('');
		},
		addModal:function(){
			var that = this;
			$("body #uploadTip").remove();
			var htmlDom = this.getModal();
			$("body").append(htmlDom);
			$('body #uploadTip').modal('show');
			$("#modalYes").on('click',function(){
				that.options.ok();
			})
		}
		
	}
	
	$.showModal = function(options){
		var modal = new Popup(options);
		modal.addModal();
	}

	//上传、预览图片
	window.imageList = [];
	var ImageLoad = function($ele){
		this.$ele = $ele;
		this.defaults = {};
//		this.options = $.extend({}, this.defaults, options);
	}
	
	ImageLoad.prototype = {
		addImage:function(src){
			var html = [];
			html.push('<div class="smallImg clearfix"><img src="'+src+'" alt=""/>');
			html.push('<div><div class="progress">'+
			'<div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">0%'+
			'</div></div><span class="icon-all icon-upload"></span><span class="icon-all icon-delete"></span></div></div></div>');
			return html.join('')
		},
		viewImage:function () {
			/* file：file控件 
			 * prvid: 图片预览容器 
			 */
			var fd = new FormData(), //表单对象
				xhr = new XMLHttpRequest(),//ajax对象
				that = this,
				tip = "", // 设定提示信息 
				filters = {
				"jpeg": "/9j/4",
				"gif": "R0lGOD",
				"png": "iVBORw"
			}
			$("#preview>div").html('');
			console.log(that.$ele.files);
			
			if(window.imageList.length>8)
			{
				$.showModal({
					title: '提示',
					content: '一次不能传超过9张图片！',
					ok: function() {}
				});
				return;
			}
			else
			{
				for(var j = 0; j < that.$ele.files.length; j++) {
					window.imageList.push(that.$ele.files[j]);
				}
			}
			
			console.log(window.imageList);
			if(window.FileReader) { // html5方案 				
				for(var i=0, f; f = window.imageList[i]; i++) {
					var fr = new FileReader();
					fr.onload = function(e) {
						var src = e.target.result;
						if(!validateImg(src)) {
							$.showModal({
								title: '提示',
								content: '文件格式不正确！',
								ok: function() {}
							});
						} else {
							showPrvImg(src);
						}
					}
					fr.readAsDataURL(f);
	
				}
				
			} else { // 降级处理
				if(!/\.jpg$|\.png$|\.gif$/i.test(that.$ele.value)) {
					$.showModal({
						title: '提示',
						content: '文件格式不正确！',
						ok: function() {}
					});
				} else {
					showPrvImg(that.$ele.value);
				}
			}
			
			function validateImg(data) {
				
				var pos = data.indexOf(",") + 1;
				for(var e in filters) {
					if(data.indexOf(filters[e]) === pos) {
						return e;
					}
				}
				return null;
			}
		
			function showPrvImg(src) {
				var imageDom = that.addImage(src);
				$("#preview>div").append(imageDom);
				//上传事件
				$('.icon-upload').unbind('click');
				$(".icon-upload").on('click',function(){
					$.upLoad(this,{
						type:'one',//all:全部上传；one:单个上传
						url:'upload.php',
						callback:function(data){},
						uploading:function(){}
					})
				})
				//删除事件
				$(".icon-delete").unbind('click')
				$(".icon-delete").on('click',function(){
					$.removeSomeing(this);
				})
			}
		}		
	}

	$.previewImage = function($ele){
		var showImage = new ImageLoad($ele);
		showImage.viewImage();		
	}
	
	//文件上传
	var Upload = function($ele,options){
		this.$ele = $ele,
		this.defaults={
			type:'all',//all:全部上传；one:单个上传
			url:'',
			callback:function(data){},
			uploading:function(){}
		},
		this.options = $.extend({}, this.defaults, options);	
	}
	
	Upload.prototype = {
		uploadFile: function(){
			if(!window.imageList[0])
			{
				$.showModal({
					title: '提示',
					content: '请选择文件！',
					ok: function() {}
				});
				return;
			}
			var fd = new FormData(), //表单对象
				xhr = new XMLHttpRequest(), //ajax对象
				that = this,
				fileData = [];
			if(that.options.type == 'all'){
				fileData = window.imageList;
				that.options.uploading = function(pre){
					var progress = pre + '%';
					$("#preview .progress").show();
					$("#preview .progress-bar").css({ 'width': 0 })
					$("#preview .progress-bar").css({ 'width': progress });
					$("#preview .progress-bar").text(progress);
				}
			}
			else if(that.options.type == 'one'){
				
				var index = $("#preview .smallImg").index($(that.$ele).parent().parent());
				fileData.push(window.imageList[index]);
				that.options.uploading = function(pre){
					var progress = pre + '%';					
					$(that.$ele).parent().find('.progress').show();
					$(that.$ele).parent().find('.progress-bar').css({ 'width': 0 })
					$(that.$ele).parent().find('.progress-bar').css({ 'width': progress });
					$(that.$ele).parent().find('.progress-bar').text(progress);
				}
			}
			for(var n=0;n<fileData.length;n++)
			{					
				fd.append('file', fileData[n]);
				console.log(fd.get('file'))//文件存入表单对象
				xhr.open('post', that.options.url); //建立ajax请求
				//监听ajax状态
				
				xhr.onreadystatechange = function() {
					if(xhr.readyState == 4) {
						if(xhr.status == 200) {
							//上传成功回调
							if(that.options.callback instanceof Function) {
								$.showModal({
									title: '提示',
									content: '上传成功！',
									ok: function() {}
								});
								that.options.callback(xhr.responseText);
							}
						}
						else {
							console.log(xhr.status)
							$.showModal({
								title: '提示',
								content: '上传失败，请重新上传！',
								ok: function() {}
							});
						}
					} 
					
				}
				//进度条
				xhr.upload.onprogress = function(event) {
					var pre = Math.floor(100 * event.loaded / event.total);
					
					if(that.options.uploading instanceof Function) {
						that.options.uploading(pre);
					}
					
				}
				xhr.send(fd);
			}
			
		}
	}
	
	$.upLoad = function($ele,options){
		var objUpload = new Upload($ele,options);
		objUpload.uploadFile();
		
	}
	
	//移除
	$.removeSomeing = function($ele){
		if(arguments[0])
		{
			var fileIndex = $("#preview .smallImg").index($($ele).parent().parent());
			window.imageList.splice(fileIndex, 1);
			$("#preview .smallImg").eq(fileIndex).remove();
		}
		else
		{
			window.imageList.splice(0, window.imageList.length);
			$("#preview>div .smallImg").empty();
		}
	}

})(jQuery, window, document);