// const PIXI = require('./l2d/pixi.min.js')
// const LIVE2DCUBISMFRAMEWORK = require('./live2dcubismframework.js')

// import PIXI from 
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

            //if (!modelNames.includes(name+'_model')){
                this.loader.add(name+'_model', modelDir+modelPath, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
                modelNames.push(name+'_model');
            //} 

            this.loader.load((loader, resources) => {
                let model3Obj = resources[name+'_model'].data;
                console.log(model3Obj);
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
                           if(element['File']){ let motionName = element['File'].split('/').pop().split('.').shift();
                            if (!motionNames.includes(name+'_'+motionName)){
                                loader.add(name+'_'+motionName, modelDir+element['File'], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
                                motionNames.push(name+'_'+motionName);
                            } else {
                                var n = name+'_'+motionName+String(Date.now());
                                loader.add(n, modelDir+element['File'], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
                                motionNames.push(name+'_'+motionName);
						   }
								loader.resources[name+'_'+motionName].sound=element.Sound;
								loader.resources[name+'_'+motionName].text=element.Text;
						   console.log(loader)
						   }
                        });
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
                        let n = element.split(name+'_').pop();
						var v=LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(r[element].data)
						v.sound=r[element].sound;
						v.text=r[element].text;
                        motions.set(n,v );
						console.log('motions')
						console.log(motions)
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
                    model.motions = motions;
                    this.models[name] = model;

                    v.changeCanvas(model);
                });
            });
        } else {
            v.changeCanvas(this.models[name]);
        }
    }
}