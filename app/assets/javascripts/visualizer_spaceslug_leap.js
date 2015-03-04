var controller;
var frame;
var container;
var camera;
var scene;
var renderer;
var controller; 
var controls;

// $(document).ready(function() {

spaceslugLeap = function() {


  // normalizing the coordinates 

  var leapCoordinates = $('#lmCoordinates');
  var normalizedCoordinates = $('#normalizedCoordinates');
  var windowCoordinates = ('#windowCoordinates');


  var controller = Leap.loop(function(frame) {
    frame = controller.frame();

    var interactionBox = frame.interactionBox;


    if (frame.pointables.length > 0) {
      //Leap coordinates
      var tipPosition = frame.pointables[0].tipPosition;
      // leapCoordinates.innerText = vectorToString(tipPosition, 1);

      //Normalized coordinates
      var normalizedPosition = interactionBox.normalizePoint(tipPosition, true);
      // normalizedCoordinates.innerText = vectorToString(normalizedPosition, 4);

      //Pixel coordinates in current window
      var windowPosition = [normalizedPosition[0] * window.innerWidth,
        window.innerHeight - (normalizedPosition[1] * window.innerHeight),
        0
      ];
      // debugger
      // windowCoordinates.innerText = vectorToString(windowPosition, 0);
      var windowPositionX = parseInt(windowPosition[0]);
      var windowPositionY = parseInt(windowPosition[1]);

      circlePosition(windowPositionX, windowPositionY);

    }



  });



  function vectorToString(vector, digits) {
    if (typeof digits === "undefined") {
      digits = 1;
    }
    return "(" + vector[0].toFixed(digits) + ", " + vector[1].toFixed(digits) + ", " + vector[2].toFixed(digits) + ")";
  }


  // });

  $(document).ready(function() {
    $('body').append(renderer.domElement);
  });

  var leapPosition = {
    x: 0,
    y: 0
  };





  var getAverageVolume = function(array) {
    var values = 0;
    var average;

    var length = array.length;

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
      values += array[i];
    }

    average = values / length;
    return average;
  }

  var controller = new Leap.Controller();
  frame = controller.frame()
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);



  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);


  controls = new THREE.LeapTwoHandControls(camera, controller, scene);

  controls.translationSpeed = 20;
  controls.translationDecay = 0.3;
  controls.scaleDecay = 0.5;
  controls.rotationSlerp = 0.8;
  controls.rotationSpeed = 4;
  controls.pinchThreshold = 0.5;
  controls.transSmoothing = 0.5;
  controls.rotationSmoothing = 0.2;




  function animate() {


    requestAnimationFrame(animate);

    renderer.render(scene, camera);
    controls.update();

  };

  // animate(); 


  camera.position.z = 10;
  var ballCount = 0; //counter for spheres
  var i = 0; //counter for hue
  var j = 0; //counter for freq channel

  var render = function() {
    // Throttle frame rate
    setTimeout(function() {
      requestAnimationFrame(render);
    }, 1000 / 30);

    // Define circle
    var radius = 2,
      segments = 64,
      material = new THREE.LineBasicMaterial({
        color: 0x000000
      }),
      geometry = new THREE.CircleGeometry(radius, segments);
    // Remove center vertex
    geometry.vertices.shift();
    // to work with MeshBasicMaterial
    circle = new THREE.Line(geometry, material)

    // Setting colour twice - Ineffient
    // You can do this directly without pusher - see setHSL in three.js
    var color = pusher.color('hsv', [Math.round(i), 70, 100]).hex6();
    circle.material.color.setHex(color);
    i += 0.1;

    // Leap interaction
    circlePosition = function(x, y) {
      circle.position.x = 8 * (x / window.innerWidth - 0.5);
      circle.position.y = -8 * (y / window.innerHeight - 0.5);
      circle.position.z = 2;

    };

    // debugger 
    // console.log(windowPosition[0], windowPosition[1]); 


    scene.traverse(function(object) {
      if (object instanceof THREE.Line) {

        var sensitivity = 1

        // Cycle through colours
        var hsl = object.material.color.getHSL();
        var averageVolume = getAverageVolume(frequencyAmplitudeArray);
        var musicIntensity = Math.pow(averageVolume / 255, sensitivity);
        object.material.color.setHSL(hsl.h, musicIntensity, hsl.l);

        // Move circle further back
        object.position.z -= musicIntensity / 2;

        // Pulse to the music
        // Dealing with small numbers because circles are very sensitive
        // to changes in size           
        var scaleFactor = frequencyAmplitudeArray[j % frequencyAmplitudeArray.length] / 25500;
        object.scale.x *= scaleFactor + 0.996;
        object.scale.y *= scaleFactor + 0.996;
        j++;


        // Rotate rings
        circle.rotation.x += 0.1;
        circle.rotation.y += 0.01;

        // Make objects in the distance darker
        object.material.color.offsetHSL(0, 0, -0.003);

      };
    });

    // Don't add a new circle if music is not playing
    if (getAverageVolume(frequencyAmplitudeArray)) {
      scene.add(circle);
      ballCount++;
    };

    renderer.render(scene, camera);
  };


}
