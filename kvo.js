function Observer(obj,mtd){
		this.obj = obj;
		this.mtd = mtd;
	}
	function equalCompatibilize(cls){
		if(cls.prototype.hasOwnProperty('equals')){
			return;
		}
		cls.prototype.equals = function(val){
			return this.toString()==val.toString();
		}
	};
	Array.prototype.removeObject = function(obj){
		for(i in this){
			if(this[i]!=Array.prototype.removeObject && this[i].equals(obj)){
				this.splice(i,1);
				return;
			}
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
			Object.defineProperty(obj,key,{'set':function(val){
				obj[oldSetterName] = oldSetter;// store for rollback
				obj[oldSetterName](val);
				for (observer in obj[observerPropertyName]){
					observer.mtd.call(observer.obj,val);
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
					console.log(observer);
					observer.mtd.call(observer.obj,val);
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
			}
		}
	}
}
function addObserverForKeyInObj(observer,mtd,key,obj){
	kvoCompatibilize(obj,key);
	obj[key+'Observers'].push(new Observer(observer,mtd));
}

function removeObserverForKeyInObj(observer,mtd,key,obj){
	obj[key+'Observers'].removeObject(new Observer(observer,mtd));
	kvoDecompatibilize(obj,key);
}

var a = {'a': 'ddsaf'};
var b = {'observe':function(val){
	console.log(val);
}};
console.log('ddd'+b['observe']);
addObserverForKeyInObj(b,b['observe'],'a',a);
a.a = 'aaaaa';
console.log('set');
removeObserverForKeyInObj(b,b.observe,'a',a);
a.a = 'bbbbb';
