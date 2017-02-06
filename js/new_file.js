;(function($){
  	
  	var LightBox=function(settings){
  		var self=this;
  		this.settings={
  			speed:500
  		};
  		$.extend(this.settings,settings||{});
//		创建遮罩+弹出框
		this.popupMask = $('<div id="G-lightbox-mask">');
        this.popupWin = $('<div id="G-lightbox-popup">');
		
//		保存body
		this.bodyNode=$(document.body);
		
//		渲染剩下的DOM,且插到body中去
		this.renderDom();
		
//		图片预览区域
		this.picViewArea=this.popupWin.find('div.lightbox-pic-view');
//		图片
		this.popupPic=this.popupWin.find('img.lightbox-image');
//		图片描述区域
		this.picCaptionArea=this.popupWin.find('div.lightbox-pic-caption');
		this.nextBtn=this.popupWin.find('span.lightbox-next-btn');
		this.prevBtn=this.popupWin.find('span.lightbox-prev-btn');
		this.captionText=this.popupWin.find('p.lightbox-pic-caption');//图片描述
		this.currentIndex=this.popupWin.find('span.lightbox-of-index');//当前索引
		this.closeBtn=this.popupWin.find('span.lightbox-close-btn');
		
//		准备开发事件委托,获取组数据
//		事件委托：通俗的讲，事件就是onclick，onmouseover，onmouseout，等就是事件，
//		委托呢，就是让别人来做，这个事件本来是加在某些元素上的，然而你却加到别人身上来做，完成这个事件。
//		也就是：利用冒泡的原理，把事件加到父级上，触发执行效果。
		this.groupName=null;
		this.groupData=[];
		 this.bodyNode.delegate('.js-lightbox,*[data-role=lightbox]', 'click', function(e) {
            //阻止事件冒泡
            e.stopPropagation();
            var currentGroupName = $(this).attr('data-group');
            if (currentGroupName != self.groupName) { //如果点击的图片与当前不在同一组则获得该组中的图片信息
                self.groupName = currentGroupName;
                //根据当前组名获取同一组数据
                self.getGroup();
            };
            //初始化弹出框
            self.initPopup($(this));
        });
		 this.popupMask.click(function() {
            $(this).fadeOut();
            self.popupWin.fadeOut();
            self.clear = false; //关闭时再让其为false
        });
        this.closeBtn.click(function() {
            self.popupMask.fadeOut();
            self.popupWin.fadeOut();
            self.clear = false;
        });
		
		//绑定前后切换按钮事件
		this.flag=true;//防止双击等多击打乱index
		this.nextBtn.hover(function() {
            if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
                $(this).addClass('lightbox-next-btn-show');
            };
        }, function() {
            if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
                $(this).removeClass('lightbox-next-btn-show');
            }
        }).click(function(e) {
            if (!$(this).hasClass('disabled') && self.flag && self.groupData.length > 1) {
                self.flag = false;
                e.stopPropagation();
                self.goto('next');
            };
        });
        this.prevBtn.hover(function() {
            if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
                $(this).addClass('lightbox-prev-btn-show');
            };
        }, function() {
            if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
                $(this).removeClass('lightbox-prev-btn-show');
            }
        }).click(function(e) {
            if (!$(this).hasClass('disabled') && self.flag && self.groupData.length > 1) {
                self.flag = false;
                e.stopPropagation();
                self.goto('prev');
            };
        });
//		判断是否是ie6
		this.isIE6=/MSIE 6.0/gi.test(window.navigator.userAgent);
		//绑定窗口调整事件
		var timer=null;
		$(window).resize(function(){
			//防止图片关闭后，控制台里的数据还在改变
			if(self.clear){
				window.clearTimeout(timer);
				timer=window.setTimeout(function(){
					self.loadPicSize(self.groupData[self.index].src);
				},500);
				//兼容ie6
				if(self.isIE6){
					self.popupMask.css({
						width:$(window).width(),
						height:$(window).height()
					})
				}
			}
		}).keyup(function(e){
			//绑定键盘上下左右事件
			var keyValue=e.which;
			if(self.clear){
				if(keyValue==38||keyValue==37){
					//上或者左
					self.prevBtn.click();
				}else if(keyValue==40||keyValue==39){
					self.nextBtn.click();
				}
			}
		})
//		兼容ie6
		if(this.isIE6){
			$(window).scroll(function(){
				self.popupMask.css('top',$(window).scrollTop());
			})
		}
  	};
  	
  	
  	LightBox.prototype={
  		
  		//点击上下按钮需要做的操作
  		goto:function(dir){
  			if(dir=='next'){
  				this.index++;
  				if(this.index >= this.groupData.length-1){
  					this.nextBtn.addClass('disabled').removeClass('lightbox-next-btn-show');
  				}
  				if(this.index!=0){
  					this.prevBtn.removeClass('disabled');
  				}
  				//取得下一个图片的地址
  				var src=this.groupData[this.index].src;
  				this.loadPicSize(src);
  			}else if(dir=='prev'){
  				this.index--;
  				if(this.index<=0)
  				{
  					this.prevBtn.addClass('disabled').removeClass('lightbox-prev-btn-show');
  				}
  				if(this.index!=this.groupData.length-1){
  					this.nextBtn.removeClass('disabled');
  				}
  				var src=this.groupData[this.index].src;
  				this.loadPicSize(src);
  			}
  		},
  		//图片是否加载完成
  		preLoadImg:function(src,callback){
  			var img=new Image();
  			if(!!window.ActiveXObject){
  				img.onreadystatechange=function(){
  					if(this.readyState=='complete'){
  						callback();
  					}
  				}
  			}else{
  				img.onload=function(){
  					callback();
  				}
  			}
  			img.src=src;
  		},
  		//适应图片的宽高
  		changePic:function(width,height){
  			var self=this;
  			var winWidth=$(window).width();
  			var winHeight=$(window).height();
  			//设置缩放比例
  			var scale=Math.min(winWidth/(width+10),winHeight/(height+10),1)//10为border
  			width=width*scale;
  			height=height*scale;
  			this.picViewArea.animate({
  				width:width-10,
  				height:height-10
  			},self.settings.speed);
  			
  			var top=(winHeight-height)/2;
  			if(this.isIE6){
  				top+=$(window).scrollTop();
  			}
  			this.popupWin.animate({
  				width:width,
  				height:height,
  				marginLeft:-(width/2),
  				top:top
  			},self.settings.speed,function(){
  				self.popupPic.css({
  					width:width-10,
  					height:height-10
  				}).fadeIn();
  				self.picCaptionArea.fadeIn();
  				self.flag=true;
  				self.clear=true;
  			})
  		},
//		获取图片尺寸
		loadPicSize:function(sourceSrc){
			var self=this;
			//每次要把上次的宽高清空
			self.popupPic.css({
				width:'auto',
				height:'auto'
			}).hide();
			this.picCaptionArea.hide();//切换图片->图片未加载完，下面的文字先隐藏
//			查看图片是否加载完成
			this.preLoadImg(sourceSrc,function(){
				self.popupPic.attr('src',sourceSrc);
				var picWidth=self.popupPic.width();
				var picHeight=self.popupPic.height();
				self.changePic(picWidth,picHeight);
			});
			//描述文字+当前索引
			this.captionText.text(this.groupData[this.index].caption);
			this.currentIndex.text('当前索引：'+(this.index+1)+' of '+this.groupData.length);
		},  		
//		显示遮罩层+弹出层
		showMaskAndPopup:function(sourceSrc,currentId){
			var self = this;
           	this.popupPic.hide();
           	this.picCaptionArea.hide();

            //获得视口的宽与高
            var winWidth = $(window).width();
            var winHeight = $(window).height();
            //设置图片预览区域（弹出层）大小为视口宽高的一半
            this.picViewArea.css({ width:winHeight/2, height: winHeight / 2 });
            //设置IE6下的遮罩层
            if (this.isIE6) {
                var scrollTop = $(window).scrollTop();
                this.popupMask.css({
                    width: winWidth,
                    height: winHeight,
                    top: scrollTop
                })
            }
            this.popupMask.fadeIn(); //遮罩层弹出
            this.popupWin.fadeIn(); //弹出框弹出
            var viewHeight = winHeight / 2 + 10; //因为CSS中设置了弹出层有5像素的边框
            var topAnimate = (winHeight - viewHeight) / 2;
            //设置弹出层的水平垂直居中及动画效果
            this.popupWin.css({
                width: winWidth / 2 + 10, //有5像素的边框
                height: winHeight / 2 + 10,
                marginLeft: -(winWidth / 2 + 10) / 2, //水平居中
                top: (this.isIE6 ? -(winHeight + scrollTop) : -viewHeight) //如果为IE6则高度还要加上滚动条滚动的高度
            }).animate({
                    top: (this.isIE6 ? (topAnimate + scrollTop) : topAnimate)
                },
                self.settings.speed,
                function() {
                    self.loadPicSize(sourceSrc);
                });
            this.index = this.getIndexOf(currentId);
            var groupDataLength = this.groupData.length;
            if (groupDataLength > 1) {
//				1、对于string,number等基础类型，==和===是有区别的
//				1）不同类型间比较，==之比较“转化成同一类型后的值”看“值”是否相等，===如果类型不同，其结果就是不等
//				2）同类型比较，直接进行“值”比较，两者结果一样
//				2、对于Array,Object等高级类型，==和===是没有区别的
//				进行“指针地址”比较
//				3、基础类型与高级类型，==和===是有区别的
//				1）对于==，将高级转化为基础类型，进行“值”比较
//				2）因为类型不同，===结果为false
                if (this.index === 0) {
                    this.prevBtn.addClass('disabled');
                    this.nextBtn.removeClass('disabled');
                } else if (this.index === groupDataLength - 1) {
                    this.nextBtn.addClass('disabled');
                    this.prevBtn.removeClass('disabled');
                } else {
                    this.nextBtn.removeClass('disabled');
                    this.prevBtn.removeClass('disabled');
                }
            } else { //如果一组中只有一个图片时
                this.prevBtn.addClass('disabled');
                this.nextBtn.addClass('disabled');
            }

		},
		
		//取得索引
		getIndexOf:function(currentId){
			var index=0;
			$(this.groupData).each(function(i){
				index=i;
				if(this.id==currentId){
					return false;/*相当于break*/
				}
			})
			return index;
		},
//		初始化弹出框
		  initPopup: function(currentObj) {
            var self = this;
            //获得当前被点击图片的src及id,知道ID以便来确定是否可以有前后按钮
            sourceSrc = currentObj.attr('data-source');
            currentId = currentObj.attr('data-id');
            this.showMaskAndPopup(sourceSrc, currentId); //显示遮罩层及弹出层
        },

//		获取每组图片信息		
		getGroup:function(){
			var self=this;
//			找到同组别的all对象
			var groupList=this.bodyNode.find('*[data-group='+this.groupName+']');
//			清空数据,以便存放下一组图片
			self.groupData.length=0;
//			把每一组的图片都放入groupData中去
			groupList.each(function(){
				self.groupData.push({
					src:$(this).attr('data-source'),
					id:$(this).attr('data-id'),
					caption:$(this).attr('data-caption')
				})
			})
		},
  		renderDom:function(){
  			 var strDom = '<div class="lightbox-pic-view">' +
                '<span class="lightbox-btn lightbox-prev-btn lightbox-prev-btn-show"></span>' +
                '<img src="img/2-2.jpg" alt="" class="lightbox-image" width="100%"/>' +
                '<span class="lightbox-btn lightbox-next-btn lightbox-next-btn-show"></span> ' +
                '</div>' +
                '<div class="lightbox-pic-caption">' +
                '<div class="lightbox-caption-area">' +
                '<p class="lightbox-pic-desc">图片标题</p>' +
                '<span class="lightbox-of-index">当前索引：1 of 4</span>' +
                '</div>' +
                '<span class="lightbox-close-btn"></span>' +
                '</div>';
            //插入到this.popupWin
            this.popupWin.html(strDom);
            //把遮罩和弹出框插入到BODY
            this.bodyNode.append(this.popupMask, this.popupWin);
  		}
  	};
//	实际就是声明了一个全局变量LightBox
  	window["LightBox"]=LightBox;
})(jQuery);
