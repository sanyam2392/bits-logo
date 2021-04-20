
let renderer = new THREE.WebGLRenderer();
let scene = new THREE.Scene();
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1500);
let cameraRotation = 0;
let cameraRotationSpeed = 0.001;
let cameraAutoRotation = true;
let orbitControls = new THREE.OrbitControls(camera);
const controls = new THREE.OrbitControls( camera, renderer.domElement );
let spotLight = new THREE.SpotLight(0xffffff, 1, 0, 10, 2);
let textureLoader = new THREE.TextureLoader();


let bitsLogo = {
  sphere: function (size) {
    let sphere = new THREE.CircleGeometry( 2,42);
    return sphere;
  },

  material: function (options) {
    let material = new THREE.MeshPhongMaterial();
    return material;
  },
  
  glowMaterial: function (intensity, fade, color) {
    
    let glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        'c': {
          type: 'f',
          value: intensity },

        'p': {
          type: 'f',
          value: fade },

        glowColor: {
          type: 'c',
          value: new THREE.Color(color) },

        viewVector: {
          type: 'v3',
          value: camera.position } },


     

      side: THREE.BackSide,
      transparent: true });


    return glowMaterial;
  },
  texture: function (material, property, uri) {
    let textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = true;
    textureLoader.load(
    uri,
    function (texture) {
      material[property] = texture;
      material.needsUpdate = true;
    });

  } };


let createLogo = function (options) {
  
  let surfaceGeometry = bitsLogo.sphere(options.surface.size);
  let surfaceMaterial = bitsLogo.material(options.surface.material);
  let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

 
  let atmosphereGeometry = bitsLogo.sphere(options.surface.size + options.atmosphere.size);
  let atmosphereMaterialDefaults = {
    side: THREE.DoubleSide,
    transparent: true };

  let atmosphereMaterialOptions = Object.assign(atmosphereMaterialDefaults, options.atmosphere.material);
  let atmosphereMaterial = bitsLogo.material(atmosphereMaterialOptions);
  let atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

  
  let atmosphericGlowGeometry = bitsLogo.sphere(options.surface.size + options.atmosphere.size + options.atmosphere.glow.size);
  let atmosphericGlowMaterial = bitsLogo.glowMaterial(options.atmosphere.glow.intensity, options.atmosphere.glow.fade, options.atmosphere.glow.color);
  let atmosphericGlow = new THREE.Mesh(atmosphericGlowGeometry, atmosphericGlowMaterial);

  
  let bits = new THREE.Object3D();
  surface.name = 'surface';
  atmosphere.name = 'atmosphere';
  atmosphericGlow.name = 'atmosphericGlow';
  bits.add(surface);
  bits.add(atmosphere);
  bits.add(atmosphericGlow);

  
  for (let textureProperty in options.surface.textures) {
    bitsLogo.texture(
    surfaceMaterial,
    textureProperty,
    options.surface.textures[textureProperty]);

  }

  
  for (let textureProperty in options.atmosphere.textures) {
    bitsLogo.texture(
    atmosphereMaterial,
    textureProperty,
    options.atmosphere.textures[textureProperty]);

  }

  return bits;
};

let logo = createLogo({
  surface: {
    size: 0.5,
    material: {
      specular: new THREE.Color('grey'),
      shininess: 10 },

    textures: {
      map: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/BITS_Pilani-Logo.svg/1200px-BITS_Pilani-Logo.svg.png',
      } },


  atmosphere: {
    size: 0.003,
    material: {
    opacity: 0.8 },

    textures: {
      map: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/BITS_Pilani-Logo.svg/1200px-BITS_Pilani-Logo.svg.png',
      alphaMap: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/BITS_Pilani-Logo.svg/1200px-BITS_Pilani-Logo.svg.png' },

    glow: {
      size: 0.02,
      intensity: 0.7,
      fade: 0,
      color: 0x93cfef } } });




let galaxyGeometry = new THREE.SphereGeometry(100, 32, 32);
let galaxyMaterial = new THREE.MeshBasicMaterial({
  side: THREE.BackSide });

let galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);


textureLoader.crossOrigin = true;
textureLoader.load(
'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/starfield.png',
function (texture) {
  galaxyMaterial.map = texture;
  scene.add(galaxy);
});



renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(1, 1, 1);
orbitControls.enabled = !cameraAutoRotation;

scene.add(camera);
scene.add(spotLight);
scene.add(logo);


spotLight.position.set(2, 0, 4);


logo.receiveShadow = true;
logo.castShadow = true;
logo.getObjectByName('surface').geometry.center();


window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


let render = function () {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

render();


