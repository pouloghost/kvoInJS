Array.prototype.removeObject = function(obj){
		for(i in this){
		if(this[i].constructor.prototype.hasOwnProperty('equals') && this[i].equals(obj)){
				this.splice(i,1);
				return;
			}
		}
	};
Array.prototype.containObject = function(obj){
	for(i in this){
		if(this[i].constructor.prototype.hasOwnProperty('equals') && this[i].equals(obj)){
			return true;
		}
	}
	return false;
}	
function Observer(obj,mtd){
	this.obj = obj;
	this.mtd = mtd;
}
function equalCompatibilize(cls){
	if(cls.prototype&&cls.prototype.hasOwnProperty('equals')){
		return;
	}
	cls.prototype.equals = function(val){
		if(val instanceof cls){//class compare
			for (i in val){
				switch(typeof val[i]){
					case 'number':
					case 'boolean':
					case 'string':
						if(val[i] != this[i]){
							return false;
						}else{
							break;
						}
					case 'function':
						if (this[i].toString() == val[i].toString()) {
							break;
						} else {
							//functions can be compared by toString();
							return false;
						};
						break;
					case 'object':
						//equalcompatibilize the class
						//may be changed
						if (val[i] instanceof this[i].constructor) {
							equalCompatibilize(this[i].constructor);
							if (val[i].equals (this[i])){
								break;
							} else {
								return false;
							}
						} else {
							return false;//not the same class
						};
						break;
				}
			}
		}else{
			return false;//not the same class
		}
		return true;
	}
};
function kvoCompatibilize (obj,key){//add a observer array and setter for the key
	var observerPropertyName = key+'Observers';
	var oldSetterName = '_set'+key.replace(key[0],key[0].toUpperCase());
	if(obj.hasOwnProperty(observerPropertyName)){//have been kvo compatiblized
		// if(obj.hasOwnProperty(setterMethodName)){
		// 	if(obj.hasOwnProperty('_'+setterMethodName)){//user defined setter
		// 		return;
		// 	}else{

		// 	}
		// }
		return;
	}else{
		//init observer list
		obj[observerPropertyName] = new Array();
		var oldSetter = Object.getOwnPropertyDescriptor(obj,key)['set'];//old setter
		// obj[setterMethodName]
		if(oldSetter){
			obj[oldSetterName] = oldSetter;// store for rollback
			Object.defineProperty(obj,key,{'set':function(val){
				obj[oldSetterName](val);
				for (i in obj[observerPropertyName]){
					var observer = obj[observerPropertyName][i];
					if(observer.hasOwnProperty('mtd')){
						observer.mtd.call(observer.obj,val);
					}
				}
			}});
		}else{
			//remove setter recursion
			obj['_'+key] = obj[key];
			delete obj[key];
			Object.defineProperty(obj,key,{'set':function(val){
				obj['_'+key] = val;
				for (i in obj[observerPropertyName]){
					var observer = obj[observerPropertyName][i];
					if(observer.hasOwnProperty('mtd')){
						observer.mtd.call(observer.obj,val);
					}
				}
			},'get':function(){return obj['_'+key]}});
		}
	}
}

function kvoDecompatibilize(obj,key){
	var observerPropertyName = key+'Observers';
	var oldSetterName = '_set'+key.replace(key[0],key[0].toUpperCase());
	if(!obj.hasOwnProperty(observerPropertyName)){// not compatible
		return;
	}else{
		if(obj[observerPropertyName].length == 0){
			delete obj[observerPropertyName];
			if(obj[oldSetterName]){
				Object.defineProperty(obj,key,{'set':obj[oldSetterName]});
				delete obj[oldSetterName];
			}else{// reset the default set and get for property that didn't have an old one
				delete obj[key];
				obj[key] = obj['_' + key];
				delete obj['_' + key];
			}
		}
	}
}
function addObserverForKeyInObj(observer,mtd,key,obj){
	kvoCompatibilize(obj,key);
	var obs = new Observer(observer,mtd);
	if(!obj[key+'Observers'].containObject(obs)){
		obj[key+'Observers'].push(obs);
	}
	console.log('add ' + obj[key+'Observers'].length);
}

function removeObserverForKeyInObj(observer,mtd,key,obj){
	obj[key+'Observers'].removeObject(new Observer(observer,mtd));
	kvoDecompatibilize(obj,key);
	console.log('remove ' + obj[key+'Observers'].length);
}

