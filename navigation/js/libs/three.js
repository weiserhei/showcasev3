/**
 * For creation of the global in requirejs
 *
 * Please add all addins here (and the main.js)
 */
define([
		"threeCore",
		"OrbitControls",
		// "OBJLoader",
		// "MTLLoader",
		// "js/libs/three/controls/OrbitControls.js",
		// "js/libs/three/loaders/OBJLoader.js",
		// "js/libs/three/loaders/ColladaLoader.js",
		"js/libs/three/loaders/collada/Animation.js",
		"js/libs/three/loaders/collada/AnimationHandler.js",
		"js/libs/three/loaders/collada/KeyFrameAnimation.js"
       ], function (threeCore,OrbitControls) {
    return OrbitControls;
});