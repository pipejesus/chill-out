import * as THREE from "three";

export type TextureDef = {
    name: string,            // name of the texture for further reference.
    color: string,           // The main texture file name.
    displacement ?: string,  // The displacement map texture file name.
}

/**
 * Helper class for handling texture loading.
 */
export default class Assets {
    public textures: Map<string, THREE.Texture>;
    private textures_definitions: TextureDef[];
    private loader: THREE.TextureLoader;

    constructor( textures: TextureDef[] ) {
        this.textures_definitions = textures;
        this.loader = new THREE.TextureLoader();
        this.textures = new Map<string, THREE.Texture>();
    }

    /**
     * Loads all assets.
     */
    public async load() {
        await this.loadTextures();
    }

    /**
     * Loads the textures images and creates THREE.JS Textures
     */
    public async loadTextures() {
        const color_promises = this.createPreloadPromises( 'color', 'color_' );
        const color_textures = await Promise.all( color_promises );

        const displacement_promises = this.createPreloadPromises( 'displacement', 'displacement_' );
        const displacement_textures = await Promise.all( displacement_promises );

        color_textures.forEach( ( loaded_texture ) => {
            this.textures.set( loaded_texture.name, loaded_texture.texture );
        });

        displacement_textures.forEach( ( loaded_texture ) => {
            this.textures.set( loaded_texture.name, loaded_texture.texture );
        });

    }

    /**
     * Creates a Promise preload array.
     *
     * @param key_name name of the property in TextureDef from which the file names are read.
     * @param prefix prefix given to the name of the texture in the output Map
     */
    createPreloadPromises( key_name: string, prefix:string ) {
        let promises = [];

        this.textures_definitions.forEach( ( texture_def: TextureDef ) => {
            promises.push( this.createPreloadPromise( texture_def, key_name, prefix ) );
        } );

        return promises;
    }

    /**
     * Creates a single texture preload promise.
     *
     * @param texture_def Single texture definition containing color name, color texture, and displacement map texture.
     * @param key_name Name of the property in TextureDef from which the file names are read.
     * @param prefix Prefix given to the name of the texture in the output Map
     */
    createPreloadPromise( texture_def: TextureDef, key_name: string, prefix: string ) {
        return new Promise( ( resolve, reject ) => {
            let texture_name = prefix + texture_def.name;

            if ( ! texture_def[key_name] ) {
                return resolve( {
                    name: texture_name,
                    texture: null
                });
            }

            this.loader.load( texture_def[ key_name ],
                ( texture: THREE.Texture ) => {
                    resolve( {
                        name: texture_name,
                        texture: texture,
                    } );
                },
                () => {

                },
                () => {
                    resolve( {
                        name: texture_name,
                        texture: null,
                    } );
                });
        });
    }

}

