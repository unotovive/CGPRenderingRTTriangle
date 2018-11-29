class Ellipse implements BaseShape {
    private mpositioin: THREE.Vector3;
    get position(): THREE.Vector3 {
        return this.mpositioin;
    }

    private msize: THREE.Vector3;
    get size(): THREE.Vector3{
        return this.msize;
    }

    private mcolor: THREE.Color;
    get color(): THREE.Color {
        return this.mcolor;
    }

    private mia: number;
    get ia(): number {
        return this.mia;
    }

    private mid: number;
    get id(): number {
        return this.mid;
    }

    private mis: number;
    get is(): number {
        return this.mis;
    }

    private mn: number;
    get n(): number {
        return this.mn;
    }

    constructor(position: THREE.Vector3, size: THREE.Vector3, color: THREE.Color, ia: number, id: number, is: number, n: number)
    {
        this.mpositioin = new THREE.Vector3();
        this.mpositioin.copy(position);
        this.msize = new THREE.Vector3();
        this.msize.copy(size);
        this.mcolor = new THREE.Color;
        this.mcolor.copy(color);
        this.mia = ia;
        this.mid = id;
        this.mis = is;
        this.mn = n;
        console.log('test');
    }

    calcT(e: THREE.Vector3, v: THREE.Vector3): number {
        //課題はここを実装
        var alpha, beta, gamma;//連立方程式から得られた t に関する二次方程式の係数
        var D;//判別式
        var K = 1;//二次形式⇒1 は楕円面を表す
        var M = new THREE.Matrix4(); //4 行 4 列の係数行列
        var R0d = new THREE.Vector3();
        R0d.subVectors(e, this.position);
        //e:カメラ（視点）位置 v:光線ベクトル（正規化済み）
        //光線ベクトルが自身に衝突していればカメラからの距離を

        M = M.scale(new THREE.Vector3(1 / (this.size.x * this.size.x), 1 / (this.size.y * this.size.y), 1 / (this.size.z * this.size.z)));
        alpha = v.dot(v.clone().applyMatrix4(M));
        beta = R0d.dot(v.clone().applyMatrix4(M));
        gamma = R0d.dot(R0d.clone().applyMatrix4(M)) - K;
        //判別式
        D = beta * beta - alpha * gamma;
        //衝突していなければ-1を返す
        //console.log(D)
        if(D < 0){
            return -1;
        } else {
            return (-beta - Math.sqrt(D)) / alpha;
        }
    }

    calcNorm(p: THREE.Vector3): THREE.Vector3 {
        var mscale = new THREE.Matrix4().scale(new THREE.Vector3(1 / (this.size.x * this.size.x), 1 / (this.size.y * this.size.y), 1 / (this.size.z * this.size.z)));
        var postop = p;
        postop.sub(this.position);
        return postop.applyMatrix4(mscale).normalize();
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
