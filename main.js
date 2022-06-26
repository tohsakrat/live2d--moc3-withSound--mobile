class Viewer {
	constructor( config ) {
		let width = config.width || 800
		let height = config.height || 600
		let role = config.role
		let left = config.left //|| '0px'
		let top = config.top //|| '0px'
		let right = config.right //|| '0px'
		let bottom = config.bottom //|| '0px'
		let bg = config.background
		let opa = config.opacity
		let mobile = config.mobile
		
		this.basePath = config.basePath+"/"
		this.audio={}
		this.role =config.role
		
		//if ( !mobile ) {
		//	if ( this.isMobile() ) return;
		//}
		this.l2d = new L2D( config.basePath );
		this.canvas = $( "." + config.role );

		this.l2d.load( role, this );
		this.app = new PIXI.Application( {
			width: width,
			height: height,
			transparent: true,
			antialias: true // 抗锯齿
		} );
		this.canvas.html( this.app.view );
		this.canvas[ 0 ].style.position = 'fixed'
		
		if ( bg ) {
			this.canvas[ 0 ].style.background = `url("${bg}")`
			this.canvas[ 0 ].style.backgroundSize = 'cover'
		}
		if ( opa )
			this.canvas[ 0 ].style.opacity = opa
		if ( top )
			this.canvas[ 0 ].style.top = top
		if ( right )
			this.canvas[ 0 ].style.right = right
		if ( bottom )
			this.canvas[ 0 ].style.bottom = bottom
		if ( left )
			this.canvas[ 0 ].style.left = left

		this.app.ticker.add( ( deltaTime ) => {
			if ( !this.model ) {
				return;
			}

			this.model.update( deltaTime );
			this.model.masks.update( this.app.renderer );
		} );

		window.onresize = ( event ) => {
			if ( event === void 0 ) {
				event = null;
			}

			this.app.view.style.width = width + "px";
			this.app.view.style.height = height + "px";
			this.app.renderer.resize( width, height );

			if ( this.model ) {
				var short=Math.min(width,height)
				this.model.position = new PIXI.Point( ( width*0.5 ), ( height*0.1) );
				this.model.scale = new PIXI.Point( ( width*1), ( height*1 ) );
				this.model.masks.resize( this.app.view.width, this.app.view.height );
				console.log( this.model.position );
				console.log( this.model.scale );
				console.log( this.app.view.width );
				console.log( this.app.view.height );
			}

		};
		this.isClick = false;
		this.app.view.addEventListener( 'mousedown', ( event ) => {
			//console.log(event)
			this.isClick = true;
		} );

		this.app.view.addEventListener( 'mousemove', ( event ) => {
		
			if ( this.model ) {
				this.model.inDrag = true;
			}
			//  if (this.isClick) {
			//      this.isClick = false;
			//      if (this.model) {
			//          this.model.inDrag = true;
			//      }

			if ( this.model ) {
				let mouse_x = this.model.position.x - event.offsetX;
				let mouse_y = this.model.position.y - event.offsetY;
				this.model.pointerX = -mouse_x / this.app.view.height;
				this.model.pointerY = -mouse_y / this.app.view.width;
			}
		} );

		this.app.view.addEventListener( 'mouseup', ( event ) => {
				 event.stopPropagation();
				event.preventDefault();
			if ( !this.model ) {
				return;
			}
			this.isClick = true;
			//this.startAnimation( "touch_head", "gongping" );
			if ( this.isClick ) {
				if ( this.isHit( 'face', event.offsetX, event.offsetY ) ) {
					this.startAnimation( "touch_head","base");
				} else if ( this.isHit( 'TouchSpecial', event.offsetX, event.offsetY ) ) {
					this.startAnimation( "touch_special", "base" );
				} else {
            				    		

					const bodyMotions =Array.from(this.model.motions,x=>x[0]);
					console.log(bodyMotions)
					let currentMotion = bodyMotions[ Math.floor( Math.random() * bodyMotions.length ) ];
					this.startAnimation( currentMotion, "base");
				}
			}

			this.isClick = false;
			this.model.inDrag = false;
		} );

		this.app.view.ontouchstart = ( event ) => {

			console.log( 'tontouchstart' );
			this.isClick = true
		}

		this.app.view.ontouchmove = ( event ) => {
			console.log( 'tontouchmove' );
			if ( this.model ) {
				this.model.inDrag = true;
			}

			if ( this.model ) {
				let mouse_x = this.model.position.x - event.changedTouches[0].offsetX;
				let mouse_y = this.model.position.y - event.changedTouches[0].offsetY;
				this.model.pointerX = -mouse_x / this.app.view.height;
				this.model.pointerY = -mouse_y / this.app.view.width;
			}

				 event.stopPropagation();
				event.preventDefault();
		}

		this.app.view.ontouchend = ( event ) => {

			console.log( 'ontouchend' );
			if ( !this.model ) {
				return;
			}
			this.isClick = true;

			
			if ( this.isClick ) {
				if ( this.isHit( 'face', event.changedTouches[0].offsetX, event.changedTouches[0].offsetY ) ) {
					this.startAnimation( "touch_head", "base" );
				} else if ( this.isHit( 'TouchSpecial', event.changedTouches[0].offsetX, event.changedTouches[0].offsetY ) ) {
					this.startAnimation( "touch_special", "base" );
				} else {
					const bodyMotions =Array.from(this.model.motions,x=>x[0]);
					console.log(bodyMotions)
					let currentMotion = bodyMotions[ Math.floor( Math.random() * bodyMotions.length ) ];
					this.startAnimation( currentMotion, "base" );
				}
			}
			this.isClick = false;
			this.model.inDrag = false;
		}
this.app.view.addEventListener.ontouchcancel = ( event ) => {
			
				 event.stopPropagation();
				event.preventDefault();
			console.log( 'ontouchcancel' );
			if ( !this.model ) {
				return;
			}
			this.isClick = true;

			
			if ( this.isClick ) {
				if ( this.isHit( 'face', event.changedTouches[0].offsetX, event.changedTouches[0].offsetY ) ) {
					this.startAnimation( "touch_head", "base" );
				} else if ( this.isHit( 'TouchSpecial', event.changedTouches[0].offsetX, event.changedTouches[0].offsetY ) ) {
					this.startAnimation( "touch_special", "base" );
				} else {
					const bodyMotions =Array.from(this.model.motions,x=>x[0]);
					console.log(bodyMotions)
					let currentMotion = bodyMotions[ Math.floor( Math.random() * bodyMotions.length ) ];
					this.startAnimation( currentMotion, "base" );
				}
			}
			this.isClick = false;
			this.model.inDrag = false;
		}
		
        //console.log(this.l2d.models[this.role])
        
        
        
        setTimeout(	this.loadAudio
		
		, 2000 )
	
            
            
            
		console.log( "Init finished." )
	}
	
	
	
	
	loadAudio(){
	    
	  
    	let bodyMotions =Array.from(this.l2d.models[this.role].motions,x=>x[0]);
    	console.log('AudioLoad')
        console.log(bodyMotions)
		   for(let motionId  in  bodyMotions){
            let m = this.l2d.models[this.role].motions.get( bodyMotions[motionId] );
           
         	if(m.sound){
         	let audio = new Audio( this.basePath+this.role+'/'+m.sound);
         	audio.load()
         	this.audio[bodyMotions[motionId] ]=audio;
         	}
            }
            
            

			
	}

	changeCanvas( model ) {
		console.log( "changeCanvas" )
		this.app.stage.removeChildren();
		model.motions.forEach( ( value, key ) => {
			if ( key != "effect" ) {
				let btn = document.createElement( "button" );
				let label = document.createTextNode( key );
				btn.appendChild( label );
				btn.className = "btnGenericText";
				btn.addEventListener( "click", () => {
					this.startAnimation( key, "base" );
				} );
			}
		} );

		this.model = model;
		this.model.update = this.onUpdate; // HACK: use hacked update fn for drag support
		// console.log(this.model);
		this.model.animator.addLayer( "base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1 );

		this.app.stage.addChild( this.model );
		this.app.stage.addChild( this.model.masks );

            		
		window.onresize();
	}

	onUpdate( delta ) {
		//console.log( "onUpdate" )
		let deltaTime = 0.016 * delta;

		if ( !this.animator.isPlaying ) {
			window.idle = this.motions.get( "idle" );
			this.animator.getLayer( "base" )
				.play( idle );
		}
		this._animator.updateAndEvaluate( deltaTime );

		if ( this.inDrag ) {
			this.addParameterValueById( "ParamAngleX", this.pointerX * 30 );
			this.addParameterValueById( "ParamAngleY", -this.pointerY * 30 );
			this.addParameterValueById( "ParamBodyAngleX", this.pointerX * 10 );
			this.addParameterValueById( "ParamBodyAngleY", -this.pointerY * 10 );
			this.addParameterValueById( "ParamEyeBallX", this.pointerX );
			this.addParameterValueById( "ParamEyeBallY", -this.pointerY );
		}

		if ( this._physicsRig ) {
			this._physicsRig.updateAndEvaluate( deltaTime );
		}

		this._coreModel.update();

		let sort = false;
		for ( let m = 0; m < this._meshes.length; ++m ) {
			this._meshes[ m ].alpha = this._coreModel.drawables.opacities[ m ];
			this._meshes[ m ].visible = Live2DCubismCore.Utils.hasIsVisibleBit( this._coreModel.drawables.dynamicFlags[ m ] );
			if ( Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit( this._coreModel.drawables.dynamicFlags[ m ] ) ) {
				this._meshes[ m ].vertices = this._coreModel.drawables.vertexPositions[ m ];
				this._meshes[ m ].dirtyVertex = true;
			}
			if ( Live2DCubismCore.Utils.hasRenderOrderDidChangeBit( this._coreModel.drawables.dynamicFlags[ m ] ) ) {
				sort = true;
			}
		}

		if ( sort ) {
			this.children.sort( ( a, b ) => {
				let aIndex = this._meshes.indexOf( a );
				let bIndex = this._meshes.indexOf( b );
				let aRenderOrder = this._coreModel.drawables.renderOrders[ aIndex ];
				let bRenderOrder = this._coreModel.drawables.renderOrders[ bIndex ];

				return aRenderOrder - bRenderOrder;
			} );
		}

		this._coreModel.drawables.resetDynamicFlags();
	}

	startAnimation( motionId, layerId ) {
		
	console.log( "startAnimation" )
		if ( !this.model ) {
			return;
		}
		console.log( "Animation:", motionId, layerId )

		
		
		let m = this.model.motions.get( motionId );
		// console.log("motionId:", m)

		if ( !m ) {
			return;
		}

		var l = this.model.animator.getLayer( layerId );
		// console.log("layerId:", l)
		if ( !l ) {
			return;
		}
		l.play( m );
		/*setTimeout(()=>{

		l.play( idle );	
			
		}
		
		, 1000 *m.duration+100)*/
		

		//onsole.log(this.audio,motionId)
		if(JSON.stringify(this.audio)=='{}'){this.loadAudio()}
		for(let u in this.audio){
		     this.audio[u].pause();
		}
		//console.log(this.audio[motionId])
		this.audio[motionId].play();
	}

	isHit( id, posX, posY ) {
		
	console.log( "isHit" )
		if ( !this.model ) {
			return false;
		}

		let m = this.model.getModelMeshById( id );
		console.log(  )
		if ( !m ) {
			return false;
		}

		const vertexOffset = 0;
		const vertexStep = 2;
		const vertices = m.vertices;

		let left = vertices[ 0 ];
		let right = vertices[ 0 ];
		let top = vertices[ 1 ];
		let bottom = vertices[ 1 ];

		for ( let i = 1; i < 4; ++i ) {
			let x = vertices[ vertexOffset + i * vertexStep ];
			let y = vertices[ vertexOffset + i * vertexStep + 1 ];

			if ( x < left ) {
				left = x;
			}
			if ( x > right ) {
				right = x;
			}
			if ( y < top ) {
				top = y;
			}
			if ( y > bottom ) {
				bottom = y;
			}
		}

		let mouse_x = m.worldTransform.tx - posX;
		let mouse_y = m.worldTransform.ty - posY;
		let tx = -mouse_x / m.worldTransform.a;
		let ty = -mouse_y / m.worldTransform.d;
		return ( ( left <= tx ) && ( tx <= right ) && ( top <= ty ) && ( ty <= bottom ) );
	}

	isMobile() {
		var WIN = window;
		var LOC = WIN[ "location" ];
		var NA = WIN.navigator;
		var UA = NA.userAgent.toLowerCase();

		function test ( needle ) {
			return needle.test( UA );
		}
		var IsAndroid = test( /android|htc/ ) || /linux/i.test( NA.platform + "" );
		var IsIPhone = !IsAndroid && test( /ipod|iphone/ );
		var IsWinPhone = test( /windows phone/ );

		var device = {
			IsAndroid: IsAndroid,
			IsIPhone: IsIPhone,
			IsWinPhone: IsWinPhone
		}
		var documentElement = WIN.document.documentElement;
		for ( var i in device ) {
			if ( device[ i ] ) {
				documentElement.className += " " + i.replace( "Is", "" )
					.toLowerCase();
			}
		}
		return device.IsAndroid || device.IsIPhone || device.IsWinPhone
	}

}
