require.config({
    // Default load path for js files
    baseUrl: 'js/app',
    // export globals
    shim: {
        // --- Use shim to mix together all THREE.js subcomponents
        'threeCore': {exports: "THREE"},
        'OrbitControls': {deps: ['threeCore'], exports: "THREE"},
        'ColladaLoader': {deps: ['threeCore'], exports: "THREE"},
        'OBJLoader': {deps: ['threeCore'], exports: "THREE"},
        // --- end THREE sub-components
        'detector': { exports: 'Detector' },
        'Stats': {exports: "Stats"},
        'TWEEN': {exports: "TWEEN"},
        'dat': {exports: "dat"},

    },
    // Third party code lives in js/lib
    paths: {
        // 'jquery': "https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min",
        'dat': "../libs/dat.gui.min",
        'TWEEN': "../libs/tween.min",
        // --- start THREE sub-components
        // 'threeCore': "../../scripts/three.js/build/three.min",
        'threeCore': "../libs/three/three",
        'three': "../libs/three",
        'OrbitControls': "../libs/three/controls/OrbitControls",
        'Stats': "../libs/stats.min",
        'detector': "../libs/three/Detector",
        'ColladaLoader': "../libs/three/loaders/ColladaLoader",
        'OBJLoader': "../libs/three/loaders/OBJLoader",
        "StateMachine": "../libs/state-machine.min",
        // 'MTLLoader': "../libs/three/loaders/MTLLoader",
        // --- end THREE sub-components

    }
});

require([
    // Load our app module and pass it to our definition function
    'app',
	'detector'
], function (App,Detector) {

	if ( ! Detector.webgl ) {
	
		// loadingScreen.container.style.display = "none";
		// message.style.display = "none";
		// loadingScreen.message.innerHTML = "<h1>No webGL, no panoglobe! :(</h1>";
		Detector.addGetWebGLMessage();
		
	} else {
		
		// The "app" dependency is passed in as "App"
		App.initialize();
        
        // animate is called from the loading manager
		// App.animate();

	}
	
});