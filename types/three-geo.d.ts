import * as THREE from 'three';
declare module 'three-geo' {
  export class GeoJsonGeometry {
    constructor(geoJson: any, options?: any);
    toBufferGeometry(): THREE.BufferGeometry;
  }
}
