class Triangle implements BaseShape {
    private mverticies: THREE.Vector3[];
    get verticies(): THREE.Vector3[] {
        return this.mverticies;
    }
 
    private mcolor: THREE.Color;
    get color(): THREE.Color {
        return this.mcolor;
    }
 
    private mka: number;
    get ia(): number {
        return this.mka;
    }
 
    private mkd: number;
    get id(): number {
        return this.mkd;
    }
 
    private mks: number;
    get is(): number {
        return this.mks;
    }
 
    private mn: number;
    get n(): number {
        return this.mn;
    }
 
    private mnormal: THREE.Vector3;
    get normal(): THREE.Vector3{
        return this.mnormal;
    }
 
    constructor(p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, color: THREE.Color, ia: number, id: number, is: number, n: number)
    {
        this.mverticies = new Array();
        this.mverticies[0] = new THREE.Vector3().copy(p0);
        this.mverticies[1] = new THREE.Vector3().copy(p1);
        this.mverticies[2] = new THREE.Vector3().copy(p2);
        this.mcolor = new THREE.Color;
        this.mcolor.copy(color);
        this.mka = ia;
        this.mkd = id;
        this.mks = is;
        this.mn = n;
 
        //法線を計算，時計回りを表面とする
        var v1 = new THREE.Vector3().subVectors(this.verticies[2], this.verticies[0]);
        var v2 = new THREE.Vector3().subVectors(this.verticies[1], this.verticies[0]);
        this.mnormal = new THREE.Vector3().crossVectors(v1, v2).normalize();
    }
 
    private det(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): number{
        return (a.x * b.y * c.z) + (a.y * b.z * c.x) + (a.z * b.x * c.y) - (a.x * b.z * c.y) - (a.y * b.x * c.z) - (a.z * b.y * c.x);
    }
 
    calcT(e: THREE.Vector3, v: THREE.Vector3): number {
        const bunbo = this.normal.clone().dot(v);
        const bunsi = this.normal.dot(this.verticies[0].clone().sub(e));
        if (Math.abs(bunbo) < 0.000001) {
            return -1; //平行なので交差していない，よって-1を返して終了する
        } else {
            //分子/分母で距離tを算出する
            const t = bunsi / bunbo;
            //e0，e1，e2を算出する
            const e0 = this.verticies[0].clone().sub(this.verticies[1]);
            const e1 = this.verticies[1].clone().sub(this.verticies[2]);
            const e2 = this.verticies[2].clone().sub(this.verticies[0]);
            //tから交点iを算出する
            const i = e.clone().add(v.clone().multiplyScalar(t));
            //iv0，iv1，iv2を算出する
            const iv0 = this.verticies[0].clone().sub(i);
            const iv1 = this.verticies[1].clone().sub(i);
            const iv2 = this.verticies[2].clone().sub(i);
            //cross0,cross1,cross2を算出し，
            const cross0 = iv0.clone().cross(e0);
            const cross1 = iv1.clone().cross(e1);
            const cross2 = iv2.clone().cross(e2);
            //cross0 * n
            //cross1 * n
            //cross2 * n すべて0より大きければ
            if(cross0.clone().dot(this.normal) > 0 && cross1.clone().dot(this.normal) > 0 && cross2.clone().dot(this.normal) > 0) {
                console.log(t)
                return t;
            } else {
                return -1;
            }
        }

    }
 
    calcNorm(p: THREE.Vector3): THREE.Vector3 {
        return this.normal.clone();
    }
 
    calcShading(q: PointLight, p: THREE.Vector3, e: THREE.Vector3): THREE.Color {
        //拡散反射光・鏡面反射光の計算に共通な項を計算する。⇒(4)

        //交点と点光源との距離 r
        var r = q.position.clone().sub(p).length();
        //単位光源ベクトル L.
        var L = q.position.clone().sub(p).divideScalar(r).normalize();
        //単位法線ベクトル N
        var N = this.calcNorm(p).normalize();
        //単位視線ベクトル V
        var V = p.clone().sub(e).normalize();
        //環境光の強度 ia を求める。⇒(1)
        var ia = this.ia
        //光源からの光が交点に照射していなければ，
        if(L.clone().dot(N) < 0) {
            //交点は陰部分か影の内部かのいずれかであるので，
            //反射光の強度は ia の値のみとなる。
            //id, is はともに 0 となる。
            var id = 0;
            var is = 0;
        } else {
            var id = (this.id * q.ii / r**2) * N.clone().dot(L);
            var R = (N.clone().multiplyScalar(2 * (N.clone().dot(L)))).sub(L).normalize();
            var is = (this.is * q.ii / r ** 2) * R.clone().dot(V) ** this.n;
           }
        //光源からの光が交点に照射しているならば，
        //交点は「陽」の部分にあるので，
        //拡散反射光の強度 id を求める。⇒(2)
        //単位正反射ベクトル R⇒(3)
        //鏡面反射光の強度 is を求める。⇒(3)
        //環境光，拡散反射光，鏡面反射光の和として，反射光の強度を求める。
        var pR = this.color.r * ia + this.color.r * id + 255 * is;
        var pG = this.color.g * ia + this.color.g * id + 255 * is;
        var pB = this.color.b * ia + this.color.b * id + 255 * is;
        return new THREE.Color(pR, pG, pB); //反射光を返す
    }
    
 }