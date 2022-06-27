function titleCase(str) {

newStr = str.slice(0,1).toUpperCase() +str.slice(1).toLowerCase();

    return newStr;

}

  

function deepAll(a) {
	for (let k in a) {
	
	if(k=='Id'){
	if(a[k].indexOf('_')!=-1){
	a[k]=a[k].toLowerCase();
	let b=a[k].split('_');	b=b.map((x)=>titleCase(str))
	console.log(b)
	a[k]=b.join('')
	}
	
	}else{
	
	if(typeof(a[k])!='string')deepAll(a[k])}
	}
	return a;
}