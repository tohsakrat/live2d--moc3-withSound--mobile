//处理文件读取



class L2D {
    constructor (basePath) {
        this.basePath = basePath;
        this.loader = new PIXI.loaders.Loader(this.basePath);
        this.animatorBuilder = new LIVE2DCUBISMFRAMEWORK.AnimatorBuilder();
        this.timeScale = 1;
        this.models = {};
		//console.log(this.loader)
    }
    
		setPhysics3Json (value) {
        if (!this.physicsRigBuilder) {
            this.physicsRigBuilder = new LIVE2DCUBISMFRAMEWORK.PhysicsRigBuilder();
        }
        this.physicsRigBuilder.setPhysics3Json(value);


        return this;
    }
    
    load (name, v) {
        console.log("loading:", name)
        if (!this.models[name]) {
            let modelDir = name+'/';
            let modelPath = name+'.model3.json';
            let textures = new Array();
            let textureCount = 0;
            let motionNames = new Array();
            let modelNames = new Array();
            let expressionNames = new Array();

            //if (!modelNames.includes(name+'_model')){
                this.loader.add(name+'_model', modelDir+modelPath, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
                modelNames.push(name+'_model');
            //} 

            this.loader.load((loader, resources) => {
                let model3Obj = resources[name+'_model'].data;
                //console.log(model3Obj);
                if (typeof(model3Obj['FileReferences']['Moc']) !== "undefined") {
                    loader.add(name+'_moc', modelDir+model3Obj['FileReferences']['Moc'], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER });
                }

                if (typeof(model3Obj['FileReferences']['Textures']) !== "undefined") {
                    model3Obj['FileReferences']['Textures'].forEach((element) => {
                        loader.add(name+'_texture'+textureCount, modelDir+element);
                        textureCount++;
                    });
                }

                if (typeof(model3Obj['FileReferences']['Physics']) !== "undefined") {
                    loader.add(name+'_physics', modelDir+model3Obj['FileReferences']['Physics'], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
                }

                if (typeof(model3Obj['FileReferences']['Motions']) !== "undefined") {
                    for (let group in model3Obj['FileReferences']['Motions']) {
                        model3Obj['FileReferences']['Motions'][group].forEach((element) => {
							
							//有资源才读取，没资源拉倒
                           if(element['File']){ 
						   
								let motionName = element['File'].split('/').pop().split('.').shift()+String(element['Name'])+group+String(element['Expression']);
								let n = name+'_'+motionName;
								if (!motionNames.includes(name+'_'+motionName)){
									loader.add(n, modelDir+element['File'], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
									motionNames.push(name+'_'+motionName);
								} else {
									loader.add(n+String(Date.now()), modelDir+element['File'], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
									motionNames.push(name+'_'+motionName);
							   }
							   for(let item in element){
							   if(!loader.resources[name+'_'+motionName][item])loader.resources[name+'_'+motionName][item]=element[item]
							}
							   
							   
							   
							   
						   }
                        });
                    }
                }
                if (typeof(model3Obj['FileReferences']['Expressions']) !== "undefined") {
                    for (let expressionID in model3Obj['FileReferences']['Expressions']) {
					let name=model3Obj['FileReferences']['Expressions'][expressionID]['Name']
					loader.add(name, modelDir+model3Obj['FileReferences']['Expressions'][expressionID]['File'], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
					expressionNames.push(name);
					
                    }
                }
				
				
				
                let groups = null;
                if (typeof(model3Obj['Groups'] !== "undefined")) {
                    groups = LIVE2DCUBISMFRAMEWORK.Groups.fromModel3Json(model3Obj);
                }

                loader.load((l, r) => {
                    let moc = null;
					//console.log(Live2DCubismCore);
                    if (typeof(r[name+'_moc']) !== "undefined") {
                        moc = Live2DCubismCore.Moc.fromArrayBuffer(r[name+'_moc'].data);
                    }

                    if (typeof(r[name+'_texture'+0]) !== "undefined") {
                        for (let i = 0; i < textureCount; i++) {
                            textures.splice(i, 0, r[name+'_texture'+i].texture);
                        }
                    }

                    if (typeof(r[name+'_physics']) !== "undefined") {
                        this.setPhysics3Json(r[name+'_physics'].data);
                    }

                    let motions = new Map();
                    motionNames.forEach((element) => {
                        let n = element//.split(name+'_').pop();
						var v=LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(r[element].data)
						for(let item in r[element]){
							if(!v[item])v[item]=r[element][item]
						}
                        motions.set(n,v );
                    });

                    let expressions = new Map();
                    expressionNames.forEach((element) => {
						
						expressions.set(element,r[element].data)
						//console.log('motions')
						//console.log(motions)
                    });


                    let model = null;
                    let coreModel = Live2DCubismCore.Model.fromMoc(moc);
                    if (coreModel == null) {
                        return;
                    }

                    let animator = this.animatorBuilder
                        .setTarget(coreModel)
                        .setTimeScale(this.timeScale)
                        .build();

                    let physicsRig = this.physicsRigBuilder
                        .setTarget(coreModel)
                        .setTimeScale(this.timeScale)
                        .build();

                    let userData = null;

                    model = LIVE2DCUBISMPIXI.Model._create(coreModel, textures, animator, physicsRig, userData, groups);
                    
					/*预处理一些不兼容的动作*/
					
					//首字母大写
					window.titleCase=function(str) {

						let newStr = str.slice(0,1).toUpperCase() +str.slice(1).toLowerCase();

						return newStr;

					}
					
					//遍历所有参数
					window.ReplaceParameterId=function(a) {
						for (let k in a) {
						if(k=='targetId'){
						if(a[k].indexOf('_')!=-1){
							//console.log(a[k].indexOf('_')!=-1)
							a[k]=a[k].toLowerCase();
							let b=a[k].split('_');	b=b.map((x)=>titleCase(x))
							//console.log(b)
							a[k]=b.join('')
						}
						
						}else{
						
							if(typeof(a[k])!='string')ReplaceParameterId(a[k])}
						}
						
						return a;
					}
					
					//预处理其他版本模型的paramID，web端unity版格式通用，请根据自己的模型来。
                    motionNames.forEach((element) => {
						let motion = motions.get(element);
						//console.log(motion)
						motion.parameterTracks = motion.parameterTracks.map(
								(x)=>{
									x=ReplaceParameterId(x);
									return x;
								}
								)
							motions.set(element,motion);
							})
					
					/*读取表情，并写入动作/淡入淡出*/
                    motionNames.forEach((element) => {
						let motion = motions.get(element);
						if (motion.Expression){
							let parameterBlenders=expressions.get(motion.Expression).Parameters;
							parameterBlenders.forEach((item)=>{
								
								

								
								
								
								/*加算表情*/
								if(item.Blend=='Add'){
									motion.parameterTracks = motion.parameterTracks.map(
									(x)=>{
										if(x.targetId!=item.Id){return x;}else{
										let y=x;
										
										//补帧，避免新加表情太不自然
										if(y.points.length<5){
											let Track=[];
											for(let i=0;i<20;i++){
												let point=new LIVE2DCUBISMFRAMEWORK.AnimationPoint;
												point.time=i*motion.duration/20
												Track[i]=point;
											}
											let j=0;
											//console.log(x)
											for(let i=0;i<20;i++){
												if(x.points[j+1]){Track[i].value=x.points[j].value+(x.points[j+1].value - x.points[j].value)*((x.points[j+1].time - Track[i].time)/(x.points[j+1].time - x.points[j].time))
												if(Track[i].time>x.points[j].time)j++;}else{Track[i].value=x.points[j].value}
												
											}
											console.log(motion.name, item.Id)
											////console.log(Track)
											//console.log(y.points)
											y.points=Track
											
											if((y.segments[y.segments.length-1].offset==y.points.length-4) && (y.segments.length-1==0))y.segments[y.segments.length-1].offset=0;
											
											if(y.segments[y.segments.length-1].offset != y.points.length-2 ){
												y.segments[y.segments.length]=new LIVE2DCUBISMFRAMEWORK.AnimationSegment;
												y.segments[y.segments.length-1].evaluate=LIVE2DCUBISMFRAMEWORK.BuiltinAnimationSegmentEvaluators.LINEAR;//线性插值
												y.segments[y.segments.length-1].offset=y.points.length-2
											}
										}
										
										y.points = y.points.map((z)=>{
											z.value = z.value+item.Value;
											return z;
											})
											
										return y;
										}
									}
									)
								}
								/*其他类型的表情算法可以加在这里*/
								
							})
							//console.log(expression)
						}
						
									
									
					//淡入淡出	
					let fadeInTime = (motion.FadeIn)&&(motion.FadeIn>0)? motion.FadeIn/1000:0;//淡入淡出时间，单位秒
					let fadeOutTime = (motion.FadeOut)&&(motion.FadeOut>0)? motion.FadeOut/1000:0;//淡入淡出时间，单位秒	
					if(fadeInTime>motion.duration*.1)fadeInTime=motion.duration*.1//限制一些淡入淡出设置得太长的动作，可以删掉
					motion.parameterTracks = motion.parameterTracks.map(
					(x)=>{
						let y=x;
						if(y.points.length>=20){
							y.points = y.points.map((z)=>{
								
								if( z.time < fadeInTime)z.value=(z.time/fadeInTime)*z.value;
								
								if( motion.duration - z.time < fadeOutTime){//避免在一些duration不太准的情况出现负数
									let w=motion.duration-z.time;
									if(w<=0)w=0;
									z.value=w*z.value;
									}
									
								return z;
								})
								
							}
							return y;
						}
					)
						
						
						
						
						
                    });
						model.motions = motions;
						model.expressions = expressions;
						this.models[name] = model;

                    v.changeCanvas(model);
                });
            });
        } else {
            v.changeCanvas(this.models[name]);
        }
    }
}