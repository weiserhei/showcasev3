/**
 * For creation of the global in requirejs
 *
 * Please add all addins here (and the main.js)
 */
define([
		"threeCore",
		"OrbitControls",
		"OBJLoader",
		"js/libs/three/loaders/collada/Animation.js",
		"js/libs/three/loaders/collada/AnimationHandler.js",
		"js/libs/three/loaders/collada/KeyFrameAnimation.js"
       ], function (threeCore,OrbitControls,OBJLoader) {
    return OrbitControls;
});