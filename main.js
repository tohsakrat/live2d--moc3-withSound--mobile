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

		this.basePath = config.basePath + "/"
		this.audio = {}
		this.role = config.role

		this.bodyMotions = []
		this.idleMotions = [ 'idle' ]
		this.clickMotions = []
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
		
		this.currentMotion = ''
		window.thisViewer = this;
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
				var short = Math.min( width, height )
				this.model.position = new PIXI.Point( ( width * 0.5 ), ( height * 0.3 ) );
				this.model.scale = new PIXI.Point( ( width * .8), ( height * .8) );
				this.model.masks.resize( this.app.view.width, this.app.view.height );
				//console.log( this.model.position );
				////console.log( this.model.scale );
				//console.log( this.app.view.width );
				//console.log( this.app.view.height );
			}

		};
		this.isClick = false;
		
		
		
		
		/* PC端事件*/
		
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
					this.startAnimation( "touch_head", "base" );
				} else if ( this.isHit( 'TouchSpecial', event.offsetX, event.offsetY ) ) {
					this.startAnimation( "touch_special", "base" );
				} else {
					this.loadMotionList();
					while(1){
						let r;
						r= this.clickMotions[ Math.floor( Math.random() * this.clickMotions.length ) ];
						if(r!=thisViewer.currentMotion){
							thisViewer.currentMotion=r;
							break
							
						}
					 }
					this.startAnimation( thisViewer.currentMotion, "base" );
				}
			}

			this.isClick = false;
			this.model.inDrag = false;
		} );


/* 移动端事件*/
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
				let mouse_x = this.model.position.x - event.changedTouches[ 0 ].offsetX;
				let mouse_y = this.model.position.y - event.changedTouches[ 0 ].offsetY;
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
				if ( this.isHit( 'face', event.changedTouches[ 0 ].offsetX, event.changedTouches[ 0 ].offsetY ) ) {
					this.startAnimation( "touch_head", "special" );
				} else if ( this.isHit( 'TouchSpecial', event.changedTouches[ 0 ].offsetX, event.changedTouches[ 0 ].offsetY ) ) {
					this.startAnimation( "touch_special", "special" );
				} else {
					this.loadMotionList;
					console.log( this.bodyMotions )
					
					while(1){
						let r;
						r= this.clickMotions[ Math.floor( Math.random() * this.clickMotions.length ) ];
						if(r!=currentMotion){
							currentMotion=r;
							break
							
						}
					 }
					
					
					this.startAnimation( currentMotion, "special" );
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
				if ( this.isHit( 'face', event.changedTouches[ 0 ].offsetX, event.changedTouches[ 0 ].offsetY ) ) {
					this.startAnimation( "touch_head", "special" );
				} else if ( this.isHit( 'TouchSpecial', event.changedTouches[ 0 ].offsetX, event.changedTouches[ 0 ].offsetY ) ) {
					this.startAnimation( "touch_special", "special" );
				} else {
					this.loadMotionList();
					let currentMotion = this.clickMotions[ Math.floor( Math.random() * this.clickMotions.length ) ];
					this.startAnimation( currentMotion, "special" );
				}
			}
			this.isClick = false;
			this.model.inDrag = false;
		}

		//console.log(this.l2d.models[this.role])







		console.log( "Init finished." )
	}

	//读入动作列表
	loadMotionList() {

		this.bodyMotions = Array.from( this.model.motions, x => x[ 0 ] );
		this.idleMotions = this.bodyMotions.filter( ( x ) => {
			return x.toLowerCase().indexOf( 'idle' ) != -1
		} )
		this.clickMotions = this.bodyMotions.filter( ( x ) => {
			return x.toLowerCase().indexOf( 'idle' ) == -1
		} )
		//console.log( this.bodyMotions )
		//console.log( this.idleMotions )
		//console.log( this.clickMotions )
	}
	//读入音频列表
	loadAudio() {
		this.loadMotionList();
		//console.log( 'AudioLoad' )
		//console.log( this )
		//console.log( this.bodyMotions )
		for ( let motionId in this.bodyMotions ) {
			let m = this.l2d.models[ this.role ].motions.get( this.bodyMotions[ motionId ] );

			if ( m.Sound ) {
				let audio = new Audio( this.basePath + this.role + '/' + m.Sound );
				audio.load()
				this.audio[ this.bodyMotions[ motionId ] ] = audio;
			}
		}
	}

	//意味不明
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
		window.baseLayer = this.model.animator.addLayer( "base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1 );
		window.specialLayer = this.model.animator.addLayer( "special", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 10 );//覆盖
		window.expressionLayer = this.model.animator.addLayer( "expression", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD, 1 );//加算

		this.app.stage.addChild( this.model );
		this.app.stage.addChild( this.model.masks );
		window.onresize();
		this.loadAudio()
	}


	startAnimation( motionId, layerId ,fadeTime) {

		console.log( "startAnimation" )
		thisViewer.currentMotion=motionId;
		if ( !this.model ) {
			return;
		}
		console.log( "Animation:", motionId, layerId )
		let m = this.model.motions.get( motionId );
		
		//console.log(m)
		if ( !m ) {
			return;
		}

		var l = this.model.animator.getLayer( layerId );
		// console.log("layerId:", l)
		if ( !l ) {
			return;
		}
		
		l.play( m )//第二个参数为淡入淡出，但根据测试，单位秒，效果非常不好。还是用手写插值的办法淡入淡出。
		//console.log(l)
		if ( JSON.stringify( this.audio ) == '{}' ) {
			this.loadAudio()
		}
		for ( let u in this.audio ) {
			this.audio[ u ].pause();
			this.audio[ u ].currentTime=0;
		}
		//console.log(this.audio[motionId])
		if ( this.audio[ motionId ] ) this.audio[ motionId ].play();

	}
	
	//图形界面每刷新
	onUpdate( delta ) {
		
		this.addParameterValueById( "ParamBreath", 10 );//试试
		//console.log( this )
		
		let deltaTime = 0.016 * delta;

		let fadeTime=.5;
		if ( !this.animator.isPlaying ) {
		
		//if ( this.animator.isPlaying){console.log('updated');console.log(baseLayer._animation.duration - baseLayer._time);console.log(baseLayer)}
		//if ( !this.animator.isPlaying){console.log('timeout');console.log(baseLayer)}
			while(1){
				let r;
				r= thisViewer.idleMotions[ Math.floor( Math.random() * thisViewer.idleMotions.length ) ];
				if(r!=thisViewer.currentMotion){
					thisViewer.currentMotion=r;
						break
						}
					 }
			thisViewer.startAnimation( thisViewer.currentMotion, 'base', fadeTime )
		}
		
		this._animator.updateAndEvaluate( deltaTime );

		if ( this.inDrag ) {
			
			this.addParameterValueById( "ParamAngleX", this.pointerX * 30 * .8 );
			this.addParameterValueById( "ParamAngleY", -this.pointerY * 30 * .8 );
			this.addParameterValueById( "ParamBodyAngleX", this.pointerX * 10 );
			this.addParameterValueById( "ParamBodyAngleY", -this.pointerY * 10 );
			this.addParameterValueById( "ParamEyeBallX", this.pointerX * .6 );
			this.addParameterValueById( "ParamEyeBallY", -this.pointerY * .6 );
			//console.log(this.addParameterValueById)
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




	isHit( id, posX, posY ) {

		console.log( "isHit" )
		if ( !this.model ) {
			return false;
		}

		let m = this.model.getModelMeshById( id );
		console.log()
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
