/**
 * OBJECT_TYPE
 */
enum OBJECT_TYPE {
	LIGHT = 'light',
	CAMERA = 'camera',
	SCENE = 'scene'
}

/**
 * LIGHT_TYPE
 */
enum LIGHT_TYPE {
	AMBIENT = 'ambient',
	DIRECT = 'direct',
	POINT = 'point'
}

/**
 * MATERIAL_TYPE
 */
enum MATERIAL_TYPE {
	COLOR = 'color',
	TEXTURE = 'texture'
}

export { OBJECT_TYPE, LIGHT_TYPE, MATERIAL_TYPE };
