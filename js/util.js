var Util = {
	addEvent:function(element,type,fn){
		if(typeof fn !== 'function') return;
		if(!element.handlers){ element.handlers = {}; }
		var handlers = element.handlers;
		if(!Array.isArray(handlers[type])){ handlers[type] = []; }
		handlers[type].push(fn);
		var handlersTypeArrL = handlers[type].length;
		if(element.addEventListener){
			element.addEventListener(type,handlers[type][handlersTypeArrL-1],false);
		}else if(element.attachEvent){
			element.attachEvent('on' + type,handlers[type][handlersTypeArrL-1]);
		}
	},
	removeEvent:function(element,type,fn){
		var handlers = element.handlers;
		if(!handlers || !Array.isArray(handlers[type])){ return; }
		var typeHandlerse = handlers[type];
		if(typeof fn === 'undefined') {
			for(var i=0;i<typeHandlerse.length;i++){
				this.doremoveEvent(element,type,typeHandlerse[i]);
			}
			element.handlers[type] = [];
			return;
		}
		for(var j=0;j<typeHandlerse.length;j++){
			if(typeHandlerse[j] === fn){
				break;
			}
		}
		this.doremoveEvent(element,type,typeHandlerse[j]);
		element.handlers[type].splice(j,1);
	},
	doremoveEvent:function(element,type,fn){
		if(element.removeEventListener){
			element.removeEventListener(type,fn,false);
		}else if(element.detachEvent){
			element.detachEvent(type,fn);
		}
	}
}