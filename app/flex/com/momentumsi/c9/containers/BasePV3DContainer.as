package com.momentumsi.c9.containers
{
	import caurina.transitions.Tweener;
	
	import com.momentumsi.c9.containers.materials.FlexMaterial;
	import com.momentumsi.c9.containers.materials.ReflectionFlexMaterial;
	
	import flash.display.DisplayObject;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.utils.Dictionary;
	import flash.utils.Timer;
	
	import mx.containers.ViewStack;
	import mx.core.ContainerCreationPolicy;
	import mx.core.mx_internal;
	
	import org.papervision3d.Papervision3D;
	import org.papervision3d.cameras.Camera3D;
	import org.papervision3d.core.proto.CameraObject3D;
	import org.papervision3d.materials.MovieMaterial;
	import org.papervision3d.objects.DisplayObject3D;
	import org.papervision3d.objects.Plane;
	import org.papervision3d.scenes.MovieScene3D;
	import org.papervision3d.scenes.Scene3D;
	
	use namespace mx_internal;
	
	[Style(name="horizontalSpacing", type="Number", format="Length", inherit="no")]
	[Style(name="verticalSpacing", type="Number", format="Length", inherit="no")]
	
	public class BasePV3DContainer extends ViewStack
	{
		/**
		 * The time for each tween. Setting this lower will make the animations faster (but maybe choppier if the
		 * CPU can't keep up).
		 */
		public var tweenDuration:Number = 1;
		
		/**
		 * Is the reflection enabled? If so we create two 3D planes for each child. This effectively means that
		 * PaperVision has to render twice as many polygons if you enable the reflection, whch will slow performance. 
		 * But it looks nice.
		 */
		public function get reflectionEnabled():Boolean {
			return _reflectionEnabled;
		}
		
		public function set reflectionEnabled(value:Boolean):void {
			_reflectionEnabled = value;
		}
		
		private var _reflectionEnabled:Boolean = false;
		
		/**
		 * The number of segments used for the PaperVision Planes that are created. The lower the number the better
		 * the performance, but you'll notice distortion in your images when they are rotated. For some types of images 
		 * a value as low as 1 or 2 will work fine, but for things wil horizontal lines or text, you'll have to go higher.
		 */
		public var segments:Number = 6;
		
		/**
		 * @private
		 * 
		 * We're going to have a sprite that contains our PV3D scene added to the
		 * display list, which falls outside of the stuff that gets clipped normally by
		 * the container. So if we want to clip the content like you would expect from a 
		 * Container then we have to do our own clipping.
		 */
		private var clippingMask:Sprite;
		
		/**
		 * @private
		 * 
		 * This is the main Sprite that will get rendered with our 3D scene.
		 */
		private var pv3dSprite:Sprite;
		
		/**
		 * @private
		 * 
		 * The Scene3D that PaperVision will render. This will get rendered to the pv3dSprite object.
		 */
		protected var scene:Scene3D;
		
		/**
		 * @private
		 * 
		 * The Camera3D object that controls how we render the scene.
		 */
		protected var camera:CameraObject3D;
		
		/**
		 * @private
		 * 
		 * A Dictionary we'll use to store a reference to the Plane object we create. The key will be the DisplayObject and the
		 * value will be the Plane, that way we can take any child DIsplayObject and look up the 3D Plane.
		 */
		private var objectsToPlanes:Dictionary;
		
		/**
		 * @private
		 * 
		 * Same thing for the reflection Planes. Gotta be able to take any DIsplayObject and look up the reflection
		 * for that object.
		 */
		private var objectsToReflections:Dictionary;
		
		/**
		 * @private
		 * 
		 * We want to detect clicks on the 3D Planes, but we don't want to use the complex interactivity crap in PV3D.
		 * (It's not actually crap, it's awesome, but it's slow). So instead, since we're using a MovieScene3D, we can 
		 * simply access the container proeprty of any 3D object to get access to the DisplayObjec that it is in. Then
		 * we can use this container for our mouse click detection. So we need to be able take any of those container DIsplayObjects
		 * and look up the original child that it's associated with.
		 */
		private var containersToObjects:Dictionary;
		
		/**
		 * @private
		 * 
		 * When the 3D transition is complete and the selected child faces the user face on, then we want to substitute
		 * the real child in it's place, so that the user can interact with it. To do this we use a timer that gets reset 
		 * everytime a tween is started. Then once the tween has successfully completed, which means the selected child is
		 * directly facing the user, we do the old switcheroo.
		 */
		private var timer:Timer;
		
		public function BasePV3DContainer():void {
			super();
			
			//since we need to show all the children we have to make sure that
			//creationPolicy is set to all. Otherwise the other non-selected 
			//children would be blank until they were selected and that would look lame.
			this.creationPolicy = ContainerCreationPolicy.ALL;
			
			//crate our dictionaries, using weak keys
			objectsToPlanes = new Dictionary(true);
			objectsToReflections = new Dictionary(true);
			containersToObjects = new Dictionary(true);
			
			timer = new Timer(tweenDuration*1000, 1);
			timer.addEventListener(TimerEvent.TIMER_COMPLETE, timerComplete);
			
			pv3dSprite = new Sprite();
			setupScene();
		}
		
		override protected function createChildren():void {
			super.createChildren();
			
			clippingMask = new Sprite();
			rawChildren.addChild(clippingMask);
			
			rawChildren.addChildAt(pv3dSprite, 0);
			
			//we're just going to render the 3D scene on every frame
			this.addEventListener(Event.ENTER_FRAME, enterFrameHandler);
		}
		
		
		
		
		
		protected function setupScene():void {
			//turn off the debugging trace statements for PV3D
			Papervision3D.VERBOSE = false;
			
			//create a new MovieScene3D and tell it to draw to pv3dSprite
			scene = new MovieScene3D(pv3dSprite);
			
			//create a new Camera3D
			camera = new Camera3D();
			camera.z = -200;
		}
		
		protected function enterFrameHandler(event:Event):void {
			try {
				if(selectedChild != null){
					var plane:Plane = objectsToPlanes[selectedChild];
					
					if(Tweener.isTweening(plane)){
						scene.renderCamera(camera);
					}

				}
			}
			catch(e:Error) { }
		}
		
		override public function addChild(child:DisplayObject):DisplayObject {
			var child:DisplayObject = super.addChild(child);
			
			if(reflectionEnabled) {
				var reflMaterial:MovieMaterial = new ReflectionFlexMaterial(child);
				
				var reflection:Plane = new Plane(reflMaterial, child.width, child.height, segments, segments);
				scene.addChild(reflection);
				
				objectsToReflections[child] = reflection;
			}
		
			var material:MovieMaterial = new FlexMaterial(child, true);
			material.smooth = true;
			
			var plane:Plane = new Plane(material, child.width, child.height, segments, segments);	
			scene.addChild(plane);
			
			containersToObjects[plane.container] = child;
			
			//once the Plane is added to the scene we can access the container property, which we use to handle
			//mouse clicks
			plane.container.addEventListener(MouseEvent.CLICK, containerClicked);
			
			objectsToPlanes[child] = plane;
			
			return child;
		}
		
		protected function lookupPlane(child:DisplayObject):DisplayObject3D {
			return objectsToPlanes[child];
		}
		
		protected function lookupReflection(child:DisplayObject):DisplayObject3D {
			return objectsToReflections[child];
		}
		
		private function containerClicked(event:MouseEvent):void {
			var child:DisplayObject = containersToObjects[event.currentTarget];
			
			var index:int = getChildIndex(child);
			selectedIndex = index;
		}
		
		/**
		 * Whenever we remove a child we also remove the planes that we had created for it.
		 */
		override public function removeChild(child:DisplayObject):DisplayObject {
			var plane:Plane = objectsToPlanes[child];
			
			scene.removeChild(plane);
			
			if(reflectionEnabled) {
				var refl:Plane = objectsToReflections[child];
				scene.removeChild(refl);
			}
			
			return super.removeChild(child);
		}
		
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			//sometimes our child ordering gets jacked. Make sure our pv3d sprite is below the actual children
			//which is important once we show the real child display object
			if(rawChildren.contains(pv3dSprite)) {
				if(border) {
					rawChildren.setChildIndex(pv3dSprite, 0);
					rawChildren.setChildIndex(DisplayObject(border), 0);
				}
				else {
					rawChildren.setChildIndex(pv3dSprite, 0);
				}
			}
			
			clippingMask.graphics.clear();
			
			if(clipContent) {
				clippingMask.graphics.beginFill(0x000000);
				clippingMask.graphics.drawRect(0,0, unscaledWidth, unscaledHeight);
				pv3dSprite.mask = clippingMask;
			}
			
			pv3dSprite.y = unscaledHeight/2;
			pv3dSprite.x = unscaledWidth/2;
			
			layoutChildren(unscaledWidth, unscaledHeight);
			
		}
		
		protected function layoutChildren(unscaledWidth:Number, unscaledHeight:Number):void {
			if(timer.running) {
				timer.reset();
			}
			
			timer.start();
		}
		
		private function timerComplete(event:TimerEvent):void {
			showVisibleChild();
		}
		
		private function showVisibleChild():void {
			if(selectedChild != null) {
				selectedChild.visible = true;
				
				var plane:Plane = objectsToPlanes[selectedChild];
				plane.container.visible = false;
				
				if(border) {
					
					rawChildren.setChildIndex(pv3dSprite, 0);
					rawChildren.setChildIndex(DisplayObject(border), 0);
				}
				else {
					rawChildren.setChildIndex(pv3dSprite, 0);
				}
			}
		}
	}
}