///<reference path="./node_modules/@types/three/index.d.ts"/>

class ThreeJSTest {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private geometry: THREE.Geometry;
    private material: THREE.Material;
    private torus: THREE.Mesh;
    private light: THREE.Light;
    private screenWidth: number = 256;
    private screenHeight: number = 256;
    private uniforms: THREE.Uniform[];
    private bgcolor: THREE.Color;
    private pointlight: PointLight;
    private shapes: BaseShape[];
 
    constructor() {
        this.readScene();
    }
 
    private readScene()
    {
        var s = scenes[0];
 
        this.bgcolor = new THREE.Color(s.bgcolor.r, s.bgcolor.g, s.bgcolor.b);
        this.pointlight = new PointLight(new THREE.Vector3(s.pointlight.x, s.pointlight.y, s.pointlight.z), s.pointlight.ii);
        this.shapes = new Array();
        for (var i = 0; i < s.ellipses.length; i++)
        {
            this.shapes[i] = new Ellipse(
                new THREE.Vector3(s.ellipses[i].x, s.ellipses[i].y, s.ellipses[i].z),
                new THREE.Vector3(s.ellipses[i].a, s.ellipses[i].b, s.ellipses[i].c),
                new THREE.Color(s.ellipses[i].material.r, s.ellipses[i].material.g, s.ellipses[i].material.b),
                s.ellipses[i].material.ka, s.ellipses[i].material.kd, s.ellipses[i].material.ks, s.ellipses[i].material.n);
        }
        var ellipsecnt = this.shapes.length;
        for (var i = 0; i < s.triangles.length; i++)
        {
            this.shapes[i + ellipsecnt] = new Triangle(
                new THREE.Vector3(s.triangles[i].x0, s.triangles[i].y0, s.triangles[i].z0),
                new THREE.Vector3(s.triangles[i].x1, s.triangles[i].y1, s.triangles[i].z1),
                new THREE.Vector3(s.triangles[i].x2, s.triangles[i].y2, s.triangles[i].z2),
                new THREE.Color(s.triangles[i].material.r, s.triangles[i].material.g, s.triangles[i].material.b),
                s.triangles[i].material.ka, s.triangles[i].material.kd, s.triangles[i].material.ks, s.triangles[i].material.n);
        }
    }
 
    public render() {
        var viewport = document.getElementById("viewport");
        var canvas = document.createElement("canvas");
        canvas.width = this.screenWidth;
        canvas.height = this.screenHeight;
        var context = canvas.getContext("2d");
 
        var img = new ImageData(canvas.width, canvas.height);
        for (var y = 0; y < img.height; y++) {
            for (var x = 0; x < img.width; x++) {
                var target = new THREE.Vector3(x - img.width / 2, -y + img.height / 2, 0);
                var cameraPosition = new THREE.Vector3(0, 0, 700);
                var  v = new THREE.Vector3();
                v.copy(target);
                v.sub(cameraPosition).normalize();
 
                var nearestshape: BaseShape = undefined;
                var t = Number.MAX_VALUE;
                for (var i = 0; i < this.shapes.length; i++)
                {
                    var tmpt = this.shapes[i].calcT(cameraPosition, v);
                    if (tmpt > 0 && (tmpt < t))
                    {
                        nearestshape = this.shapes[i];
                        t = tmpt;
                    }
                }
 
                var index = x + y * img.width;
                if (nearestshape != undefined)
                {
                    var hitpos = new THREE.Vector3();
                    hitpos.copy(cameraPosition).add(v.clone().multiplyScalar(t));
                    var objcol = nearestshape.calcShading(this.pointlight, hitpos, cameraPosition);
 
                    img.data[index * 4 + 0] = objcol.r;   //R
                    img.data[index * 4 + 1] = objcol.g;   //G
                    img.data[index * 4 + 2] = objcol.b;   //B
                    img.data[index * 4 + 3] = 255;    
                }
                else
                {
                    img.data[index * 4 + 0] = this.bgcolor.r;   //R
                    img.data[index * 4 + 1] = this.bgcolor.g;   //G
                    img.data[index * 4 + 2] = this.bgcolor.b;   //B
                    img.data[index * 4 + 3] = 255;              //A
                }
            }
        }
 
        context.putImageData(img, 0, 0);
        viewport.appendChild(canvas);
    }
 
 }
 
 var scenes = [
    {
        "pointlight": { "x": 200, "y": 280, "z": 100, "ii": 100000 },
        "bgcolor": { "r": 60, "g": 60, "b": 60 },
        "ellipses": [{ "x": 0, "y": 0, "z": 15, "a": 40, "b": 40, "c": 40, "material": { "r": 255, "g": 0, "b": 0, "ka": 0.1, "kd": 0.45, "ks": 0.45, "n": 30 } }],
        "triangles": [
            { "x0": -80, "y0": -100, "z0":  200, "x1": -80, "y1": 100, "z1": 200, "x2": -80, "y2": -100, "z2": -200, "material": { "r":   0, "g": 255, "b": 0, "ka": 0.1, "kd": 0.45, "ks": 0.45, "n": 30 } },
            { "x0": -80, "y0": -100, "z0": -200, "x1": -80, "y1": 100, "z1": 200, "x2": -80, "y2":  100, "z2": -200, "material": { "r":   0, "g": 255, "b": 0, "ka": 0.1, "kd": 0.45, "ks": 0.45, "n": 30 } }
        ]
    }
 ]
 
 document.addEventListener("DOMContentLoaded", function () {
    var threeJSTest = new ThreeJSTest();
    threeJSTest.render();
 });