(function(window){
	var Scroll = function(selector,opts){
		var _t = this;
		this._opts =  {
			invoke:1,
			time:3000,
			touch:true
		};
		this.scrollObj = document.querySelector(selector);
		this.containerObj = this.scrollObj.querySelector('.scrollContainer');
		this.containerStyle = this.containerObj.style;
		this.items = this.containerObj.children;
		this.itemsCount = this.containerObj.childElementCount;
		this.firstItem = this.items[0];
		this.lastItem = this.items[this.items.length-1];
		this.scrollButObj = this.scrollObj.querySelector('.scrollBut');
		this.butItemOne = document.createElement('li');
		this.butItems = [];
		this.touchC = 0;  //触摸事件-触摸起始点
		this.touchX = 0;  //触摸事件-触摸过程中的移动位移
		this.touchXX = 1;
		this.curRelativeX = 0;
		this.speed = 300;

		this._start = function(){
			clearTimeout(_t.timer);
			_t.toRight();
			_t.timer = setTimeout(_t._start,_t.time);
		}

		//统一添加所有元素事件函数
		function _addContainerEvent(){
			if(_t.touch){
				Util.addEvent(_t.scrollObj,'touchstart',function(e){
					_t.touchC = e.touches[0].clientX;
				});
				Util.addEvent(_t.scrollObj,'touchmove',function(e){
					e.preventDefault();
					_t.touchX = _t.touchC- e.touches[0].clientX;
					_t.touchXX = _t.touchX/(3+Math.abs(_t.touchX));  //触摸事件-阻力后的位移
					_t.containerStyle.transform = 'translateX(-'+ (_t.curRelativeX+_t.touchXX) +'px)';
					_t.curRelativeX = (_t.curRelativeX+_t.touchXX);
				});
				Util.addEvent(_t.scrollObj,'touchend',function(e){
					if(_t.touchX>150){
						_t._start();
					}else if(_t.touchX<-150){
						_t.toLeft();
					}else{
						_t.curRelativeX = _t.current*_t.cWidth;
						_t.containerStyle.transform = 'translateX(-'+ (_t.curRelativeX) +'px)';
					}
				});
			}
			// Util.addEvent(_t.scrollObj,'mouseover',function(){
			// 	clearTimeout(_t.timer);
			// });
			// Util.addEvent(_t.scrollObj,'mouseout',function(){
			// 	clearTimeout(_t.timer);
			// 	_t.timer = setTimeout(_t._start,_t.time);
			// });
			Util.addEvent(_t.scrollButObj,'click',function(e){
				var that = this;
				var target = e.target;
				if(target === that) return;
				_t.current = target['data-scrollTo'];
				_t._start();
			});
			Util.addEvent(window,'resize',function(){
				clearTimeout(_t.timer);
				_t._render(true);
				_t.timer = setTimeout(_t._start,_t.time);
			});

		}
		
		function _init(){
			if(typeof opts === "object"){
				for(var i in opts){ 
					if(_t._opts[i] !== 'undefined') _t._opts[i] = opts[i];
				}
			}
			_t.current = _t._opts.invoke>0 ? _t._opts.invoke:1;
			_t.time = _t._opts.time;
			_t.touch = _t._opts.touch;

			_t._render();
			_addContainerEvent();	
			_t.timer = setTimeout(_t._start,_t.time);
		}

		_init();
	};

	Scroll.prototype.toLeft = function(){
		var _t = this;
		var tmp = _t.curRelativeX - (_t.current-1)*_t.cWidth;
		_t.doAnimation(_t.speed,function(){
			if(--_t.current < 1) {
				_t.current = _t.itemsCount;
			}
			_t.curRelativeX = _t.cWidth*_t.current;
			_t.containerStyle.transform = 'translateX(-'+ _t.curRelativeX +'px)';
			_t.butItemsAction(_t.current);
		},function(percent){
			_t.containerStyle.transform = 'translateX(-'+ (_t.curRelativeX-Math.min(tmp*percent,_t.curRelativeX)) +'px)';
		});

	}

	Scroll.prototype.toRight = function(){
		var _t = this;
		var tmp = _t.curRelativeX - (_t.current-1)*_t.cWidth;
		_t.doAnimation(_t.speed,function(){
			if(++_t.current > _t.itemsCount){
				_t.containerStyle.transform = 'translateX(-'+ _t.cWidth +'px)';
				_t.curRelativeX = _t.cWidth;
				_t.current = 1;
			}
			_t.butItemsAction(_t.current);
		},function(percent){
			_t.curRelativeX = Math.min(percent*_t.cWidth, _t.cWidth)+(_t.current*_t.cWidth);
			_t.containerStyle.transform = 'translateX(-'+ _t.curRelativeX +'px)';
		});
	}

	Scroll.prototype.doAnimation = function(speed,callback,animationtype){
		var start = 0;
		var _t = this;
		var animationFn = animationtype.bind(_t);
		function doing(timestamp){
			if(!start) start = timestamp;
			var progress = timestamp - start;
			var percent = progress/speed;
			animationFn(percent);
			if (progress < speed) {
				window.requestAnimationFrame(doing);
				return;
			}
			start = 0;
			if(typeof callback === 'function') callback();
		}
		window.requestAnimationFrame(doing);
	}

	Scroll.prototype._render = function(isreload){
		var _t = this;
		_t.cWidth = _t.scrollObj.clientWidth;
		//按钮组件初始化
		if(!isreload){
			for(var i=0;i<_t.itemsCount;i++){
				var cloneItem = _t.butItemOne.cloneNode();
				if(i===_t.current-1) cloneItem.className = 'on';
				cloneItem['data-scrollTo'] = i;
				_t.butItems.push(cloneItem);
				_t.scrollButObj.appendChild(cloneItem);
			}
				_t.scrollObj.appendChild(_t.scrollButObj);
				_t.containerObj.insertBefore(_t.lastItem.cloneNode(true),_t.firstItem);
				_t.containerObj.appendChild(_t.firstItem.cloneNode(true));
		}

		_t.scrollButObj.style.left = Math.floor((_t.cWidth/2)-(_t.scrollButObj.clientWidth)/2)+'px';
		//滑动框初始化
		_t.containerStyle.width = (_t.cWidth * (_t.itemsCount+2)) + 'px';
		_t.containerStyle.height = _t.scrollObj.clientHeight + 'px';
		_t.containerStyle.transform = 'translateX(-'+ _t.cWidth*_t.current +'px)';
		_t.curRelativeX = _t.cWidth*_t.current;
	}
	Scroll.prototype.butItemsAction = function(current){
		var _t = this;
		var len = _t.butItems.length;
		for(var i=0;i<len;i++){
			_t.butItems[i].className = '';
		}
		_t.butItems[_t.current-1].className = 'on';
	}

	Scroll.prototype.scrollTo = function(index){
		var _t = this;
		_t.current = index-1;
		_t._start();
	}
	window.Scroll = Scroll;
})(window);