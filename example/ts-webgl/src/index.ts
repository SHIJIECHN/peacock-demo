/**
 * @description index
 */

// import main from './1.getting_started/6.1.coordinate_systems'
// import main from './1.getting_started/6.2.coordinate_systems_depth'
// import main from './1.getting_started/6.3.coordinate_systems_multiple'
// import main from './1.getting_started/7.1.camera_circle'
// import main from './1.getting_started/7.2.camera_keyboard_dt'

// import main from './02.lighting/1.color'
// import main from './02.lighting/2.1.basic_lighting_diffuse'
// import main from './02.lighting/2.2.basic_lighting_specular'
// import main from './02.lighting/2.3.basic_lighting-exercise1'
// import main from './02.lighting/2.4.basic_lighting-exercise2'
// import main from './02.lighting/3.1.materials'
// import main from './02.lighting/3.2.materials-exercise1'
// import main from './02.lighting/4.1.lighting_maps_diffuse_map'
// import main from './02.lighting/4.2.lighting_maps_specular_map'
// import main from './02.lighting/4.3.lighting_maps_exercise2'
// import main from './02.lighting/4.4.lighting_maps_exercise3'
// import main from './02.lighting/5.1.light_casters_directional'
// import main from './02.lighting/5.2.light_casters_point'
// import main from './02.lighting/5.3.light_casters_spot'
// import main from './02.lighting/5.4.light_casters_spot_soft'
import main from './02.lighting/6.1.multiple_lights'


const canvas = document.getElementById('webgl') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.log('Failed to get gl ceontext.');
} else {
  main(gl, canvas);
}

// import main from './02.lighting/test'
// main();

