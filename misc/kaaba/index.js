// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class Vector2 {
    constructor(x = 0, y = 0){
        this.set({
            x,
            y
        });
    }
    get length() {
        return Math.hypot(this.x, this.y);
    }
    get lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
    get angle() {
        return Math.atan2(this.y, this.x);
    }
    set({ x =this.x , y =this.y  }) {
        this.x = x;
        this.y = y;
        return this;
    }
    add({ x =0 , y =0  }) {
        this.x += x;
        this.y += y;
        return this;
    }
    sub({ x =0 , y =0  }) {
        this.x -= x;
        this.y -= y;
        return this;
    }
    scale(factor = 1) {
        this.x *= factor;
        this.y *= factor;
        return this;
    }
    unit() {
        return this.scale(1 / this.length);
    }
    rotate(angle = 0) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const { x , y  } = this;
        this.x = x * cos - y * sin;
        this.y = x * sin + y * cos;
        return this;
    }
    equals({ x =0 , y =0  }) {
        return this.x === x && this.y === y;
    }
    bounded({ min =null , max =null  }) {
        if (min && (this.x < min.x || this.y < min.y)) {
            return false;
        }
        if (max && (this.x > max.x || this.y > max.y)) {
            return false;
        }
        return true;
    }
    map(fn) {
        this.x = fn(this.x);
        this.y = fn(this.y);
        return this;
    }
    affix({ prefix ='' , suffix =''  }) {
        this.x = prefix + this.x + suffix;
        this.y = prefix + this.y + suffix;
        return this;
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
    }
    toString() {
        return `<${this.x}, ${this.y}>`;
    }
    static fromMouseEvent({ clientX , clientY  }) {
        return new Vector2(clientX, clientY);
    }
    static fromRectPos({ left , top  }) {
        return new Vector2(left, top);
    }
    static fromRectSize({ width , height  }) {
        return new Vector2(width, height);
    }
}
var x = 1e-6;
function A1(o) {
    let n = x;
    return x = o, n;
}
function T1(o) {
    return o * Math.PI / 180;
}
function _1(o) {
    return o * 180 / Math.PI;
}
function V1(o, n, c) {
    return o + (n - o) * c;
}
function D1(o, n, c) {
    let e = n - o;
    return Math.abs(n - o) < x ? o : (c - o) / e;
}
function O1(o, n) {
    return (o % n + n) % n;
}
var sc = Object.freeze({
    __proto__: null,
    get EPSILON () {
        return x;
    },
    setEpsilon: A1,
    degToRad: T1,
    radToDeg: _1,
    lerp: V1,
    inverseLerp: D1,
    euclideanModulo: O1
}), T = Float32Array;
function zn(o) {
    let n = T;
    return T = o, n;
}
function m(o = 0, n = 0) {
    let c = new T(2);
    return o !== void 0 && (c[0] = o, n !== void 0 && (c[1] = n)), c;
}
var j1 = m;
function Q1(o, n, c) {
    return c = c || new T(2), c[0] = o, c[1] = n, c;
}
function F1(o, n) {
    return n = n || new T(2), n[0] = Math.ceil(o[0]), n[1] = Math.ceil(o[1]), n;
}
function P1(o, n) {
    return n = n || new T(2), n[0] = Math.floor(o[0]), n[1] = Math.floor(o[1]), n;
}
function E1(o, n) {
    return n = n || new T(2), n[0] = Math.round(o[0]), n[1] = Math.round(o[1]), n;
}
function X1(o, n = 0, c = 1, e) {
    return e = e || new T(2), e[0] = Math.min(c, Math.max(n, o[0])), e[1] = Math.min(c, Math.max(n, o[1])), e;
}
function Y1(o, n, c) {
    return c = c || new T(2), c[0] = o[0] + n[0], c[1] = o[1] + n[1], c;
}
function Z1(o, n, c, e) {
    return e = e || new T(2), e[0] = o[0] + n[0] * c, e[1] = o[1] + n[1] * c, e;
}
function I1(o, n) {
    let c = o[0], e = o[1], r = o[0], u = o[1], i = Math.sqrt(c * c + e * e), M = Math.sqrt(r * r + u * u), f = i * M, a = f && Tn(o, n) / f;
    return Math.acos(a);
}
function qn(o, n, c) {
    return c = c || new T(2), c[0] = o[0] - n[0], c[1] = o[1] - n[1], c;
}
var L1 = qn;
function H1(o, n) {
    return Math.abs(o[0] - n[0]) < x && Math.abs(o[1] - n[1]) < x;
}
function C1(o, n) {
    return o[0] === n[0] && o[1] === n[1];
}
function U1(o, n, c, e) {
    return e = e || new T(2), e[0] = o[0] + c * (n[0] - o[0]), e[1] = o[1] + c * (n[1] - o[1]), e;
}
function B1(o, n, c, e) {
    return e = e || new T(2), e[0] = o[0] + c[0] * (n[0] - o[0]), e[1] = o[1] + c[1] * (n[1] - o[1]), e;
}
function G1(o, n, c) {
    return c = c || new T(2), c[0] = Math.max(o[0], n[0]), c[1] = Math.max(o[1], n[1]), c;
}
function J1(o, n, c) {
    return c = c || new T(2), c[0] = Math.min(o[0], n[0]), c[1] = Math.min(o[1], n[1]), c;
}
function Sn(o, n, c) {
    return c = c || new T(2), c[0] = o[0] * n, c[1] = o[1] * n, c;
}
var K1 = Sn;
function N1(o, n, c) {
    return c = c || new T(2), c[0] = o[0] / n, c[1] = o[1] / n, c;
}
function An(o, n) {
    return n = n || new T(2), n[0] = 1 / o[0], n[1] = 1 / o[1], n;
}
var W1 = An;
function R1(o, n, c) {
    c = c || new T(3);
    let e = o[0] * n[1] - o[1] * n[0];
    return c[0] = 0, c[1] = 0, c[2] = e, c;
}
function Tn(o, n) {
    return o[0] * n[0] + o[1] * n[1];
}
function _n(o) {
    let n = o[0], c = o[1];
    return Math.sqrt(n * n + c * c);
}
var k1 = _n;
function Vn(o) {
    let n = o[0], c = o[1];
    return n * n + c * c;
}
var v1 = Vn;
function Dn(o, n) {
    let c = o[0] - n[0], e = o[1] - n[1];
    return Math.sqrt(c * c + e * e);
}
var m1 = Dn;
function On(o, n) {
    let c = o[0] - n[0], e = o[1] - n[1];
    return c * c + e * e;
}
var b1 = On;
function s1(o, n) {
    n = n || new T(2);
    let c = o[0], e = o[1], r = Math.sqrt(c * c + e * e);
    return r > 1e-5 ? (n[0] = c / r, n[1] = e / r) : (n[0] = 0, n[1] = 0), n;
}
function d1(o, n) {
    return n = n || new T(2), n[0] = -o[0], n[1] = -o[1], n;
}
function jn(o, n) {
    return n = n || new T(2), n[0] = o[0], n[1] = o[1], n;
}
var no = jn;
function Qn(o, n, c) {
    return c = c || new T(2), c[0] = o[0] * n[0], c[1] = o[1] * n[1], c;
}
var oo = Qn;
function Fn(o, n, c) {
    return c = c || new T(2), c[0] = o[0] / n[0], c[1] = o[1] / n[1], c;
}
var co = Fn;
function eo(o = 1, n) {
    n = n || new T(2);
    let c = Math.random() * 2 * Math.PI;
    return n[0] = Math.cos(c) * o, n[1] = Math.sin(c) * o, n;
}
function ro(o) {
    return o = o || new T(2), o[0] = 0, o[1] = 0, o;
}
function uo(o, n, c) {
    c = c || new T(2);
    let e = o[0], r = o[1];
    return c[0] = e * n[0] + r * n[4] + n[12], c[1] = e * n[1] + r * n[5] + n[13], c;
}
function io(o, n, c) {
    c = c || new T(2);
    let e = o[0], r = o[1];
    return c[0] = n[0] * e + n[4] * r + n[8], c[1] = n[1] * e + n[5] * r + n[9], c;
}
var dc = Object.freeze({
    __proto__: null,
    create: m,
    setDefaultType: zn,
    fromValues: j1,
    set: Q1,
    ceil: F1,
    floor: P1,
    round: E1,
    clamp: X1,
    add: Y1,
    addScaled: Z1,
    angle: I1,
    subtract: qn,
    sub: L1,
    equalsApproximately: H1,
    equals: C1,
    lerp: U1,
    lerpV: B1,
    max: G1,
    min: J1,
    mulScalar: Sn,
    scale: K1,
    divScalar: N1,
    inverse: An,
    invert: W1,
    cross: R1,
    dot: Tn,
    length: _n,
    len: k1,
    lengthSq: Vn,
    lenSq: v1,
    distance: Dn,
    dist: m1,
    distanceSq: On,
    distSq: b1,
    normalize: s1,
    negate: d1,
    copy: jn,
    clone: no,
    multiply: Qn,
    mul: oo,
    divide: Fn,
    div: co,
    random: eo,
    zero: ro,
    transformMat4: uo,
    transformMat3: io
}), gn = Float32Array, Pn = new Map([
    [
        Float32Array,
        ()=>new Float32Array(12)
    ],
    [
        Float64Array,
        ()=>new Float64Array(12)
    ],
    [
        Array,
        ()=>new Array(12).fill(0)
    ]
]), P = Pn.get(Float32Array);
function En(o) {
    let n = gn;
    return gn = o, P = Pn.get(o), n;
}
function ao(o, n, c, e, r, u, i, M, f) {
    let a = P();
    return a[3] = 0, a[7] = 0, a[11] = 0, o !== void 0 && (a[0] = o, n !== void 0 && (a[1] = n, c !== void 0 && (a[2] = c, e !== void 0 && (a[4] = e, r !== void 0 && (a[5] = r, u !== void 0 && (a[6] = u, i !== void 0 && (a[8] = i, M !== void 0 && (a[9] = M, f !== void 0 && (a[10] = f))))))))), a;
}
function fo(o, n, c, e, r, u, i, M, f, a) {
    return a = a || P(), a[0] = o, a[1] = n, a[2] = c, a[3] = 0, a[4] = e, a[5] = r, a[6] = u, a[7] = 0, a[8] = i, a[9] = M, a[10] = f, a[11] = 0, a;
}
function lo(o, n) {
    return n = n || P(), n[0] = o[0], n[1] = o[1], n[2] = o[2], n[3] = 0, n[4] = o[4], n[5] = o[5], n[6] = o[6], n[7] = 0, n[8] = o[8], n[9] = o[9], n[10] = o[10], n[11] = 0, n;
}
function to(o, n) {
    n = n || P();
    let c = o[0], e = o[1], r = o[2], u = o[3], i = c + c, M = e + e, f = r + r, a = c * i, t = e * i, l = e * M, h = r * i, $ = r * M, w = r * f, y = u * i, p = u * M, g = u * f;
    return n[0] = 1 - l - w, n[1] = t + g, n[2] = h - p, n[3] = 0, n[4] = t - g, n[5] = 1 - a - w, n[6] = $ + y, n[7] = 0, n[8] = h + p, n[9] = $ - y, n[10] = 1 - a - l, n[11] = 0, n;
}
function Mo(o, n) {
    return n = n || P(), n[0] = -o[0], n[1] = -o[1], n[2] = -o[2], n[4] = -o[4], n[5] = -o[5], n[6] = -o[6], n[8] = -o[8], n[9] = -o[9], n[10] = -o[10], n;
}
function Mn(o, n) {
    return n = n || P(), n[0] = o[0], n[1] = o[1], n[2] = o[2], n[4] = o[4], n[5] = o[5], n[6] = o[6], n[8] = o[8], n[9] = o[9], n[10] = o[10], n;
}
var ho = Mn;
function $o(o, n) {
    return Math.abs(o[0] - n[0]) < x && Math.abs(o[1] - n[1]) < x && Math.abs(o[2] - n[2]) < x && Math.abs(o[4] - n[4]) < x && Math.abs(o[5] - n[5]) < x && Math.abs(o[6] - n[6]) < x && Math.abs(o[8] - n[8]) < x && Math.abs(o[9] - n[9]) < x && Math.abs(o[10] - n[10]) < x;
}
function po(o, n) {
    return o[0] === n[0] && o[1] === n[1] && o[2] === n[2] && o[4] === n[4] && o[5] === n[5] && o[6] === n[6] && o[8] === n[8] && o[9] === n[9] && o[10] === n[10];
}
function Xn(o) {
    return o = o || P(), o[0] = 1, o[1] = 0, o[2] = 0, o[4] = 0, o[5] = 1, o[6] = 0, o[8] = 0, o[9] = 0, o[10] = 1, o;
}
function wo(o, n) {
    if (n = n || P(), n === o) {
        let l;
        return l = o[1], o[1] = o[4], o[4] = l, l = o[2], o[2] = o[8], o[8] = l, l = o[6], o[6] = o[9], o[9] = l, n;
    }
    let c = o[0 * 4 + 0], e = o[0 * 4 + 1], r = o[0 * 4 + 2], u = o[1 * 4 + 0], i = o[1 * 4 + 1], M = o[1 * 4 + 2], f = o[2 * 4 + 0], a = o[2 * 4 + 1], t = o[2 * 4 + 2];
    return n[0] = c, n[1] = u, n[2] = f, n[4] = e, n[5] = i, n[6] = a, n[8] = r, n[9] = M, n[10] = t, n;
}
function Yn(o, n) {
    n = n || P();
    let c = o[0 * 4 + 0], e = o[0 * 4 + 1], r = o[0 * 4 + 2], u = o[1 * 4 + 0], i = o[1 * 4 + 1], M = o[1 * 4 + 2], f = o[2 * 4 + 0], a = o[2 * 4 + 1], t = o[2 * 4 + 2], l = t * i - M * a, h = -t * u + M * f, $ = a * u - i * f, w = 1 / (c * l + e * h + r * $);
    return n[0] = l * w, n[1] = (-t * e + r * a) * w, n[2] = (M * e - r * i) * w, n[4] = h * w, n[5] = (t * c - r * f) * w, n[6] = (-M * c + r * u) * w, n[8] = $ * w, n[9] = (-a * c + e * f) * w, n[10] = (i * c - e * u) * w, n;
}
function yo(o) {
    let n = o[0], c = o[0 * 4 + 1], e = o[0 * 4 + 2], r = o[1 * 4 + 0], u = o[1 * 4 + 1], i = o[1 * 4 + 2], M = o[2 * 4 + 0], f = o[2 * 4 + 1], a = o[2 * 4 + 2];
    return n * (u * a - f * i) - r * (c * a - f * e) + M * (c * i - u * e);
}
var xo = Yn;
function Zn(o, n, c) {
    c = c || P();
    let e = o[0], r = o[1], u = o[2], i = o[4 + 0], M = o[4 + 1], f = o[4 + 2], a = o[8 + 0], t = o[8 + 1], l = o[8 + 2], h = n[0], $ = n[1], w = n[2], y = n[4 + 0], p = n[4 + 1], g = n[4 + 2], z = n[8 + 0], j = n[8 + 1], Q = n[8 + 2];
    return c[0] = e * h + i * $ + a * w, c[1] = r * h + M * $ + t * w, c[2] = u * h + f * $ + l * w, c[4] = e * y + i * p + a * g, c[5] = r * y + M * p + t * g, c[6] = u * y + f * p + l * g, c[8] = e * z + i * j + a * Q, c[9] = r * z + M * j + t * Q, c[10] = u * z + f * j + l * Q, c;
}
var go = Zn;
function zo(o, n, c) {
    return c = c || Xn(), o !== c && (c[0] = o[0], c[1] = o[1], c[2] = o[2], c[4] = o[4], c[5] = o[5], c[6] = o[6]), c[8] = n[0], c[9] = n[1], c[10] = 1, c;
}
function qo(o, n) {
    return n = n || m(), n[0] = o[8], n[1] = o[9], n;
}
function So(o, n, c) {
    c = c || m();
    let e = n * 4;
    return c[0] = o[e + 0], c[1] = o[e + 1], c;
}
function Ao(o, n, c, e) {
    e !== o && (e = Mn(o, e));
    let r = c * 4;
    return e[r + 0] = n[0], e[r + 1] = n[1], e;
}
function To(o, n) {
    n = n || m();
    let c = o[0], e = o[1], r = o[4], u = o[5];
    return n[0] = Math.sqrt(c * c + e * e), n[1] = Math.sqrt(r * r + u * u), n;
}
function _o(o, n) {
    return n = n || P(), n[0] = 1, n[1] = 0, n[2] = 0, n[4] = 0, n[5] = 1, n[6] = 0, n[8] = o[0], n[9] = o[1], n[10] = 1, n;
}
function Vo(o, n, c) {
    c = c || P();
    let e = n[0], r = n[1], u = o[0], i = o[1], M = o[2], f = o[1 * 4 + 0], a = o[1 * 4 + 1], t = o[1 * 4 + 2], l = o[2 * 4 + 0], h = o[2 * 4 + 1], $ = o[2 * 4 + 2];
    return o !== c && (c[0] = u, c[1] = i, c[2] = M, c[4] = f, c[5] = a, c[6] = t), c[8] = u * e + f * r + l, c[9] = i * e + a * r + h, c[10] = M * e + t * r + $, c;
}
function Do(o, n) {
    n = n || P();
    let c = Math.cos(o), e = Math.sin(o);
    return n[0] = c, n[1] = e, n[2] = 0, n[4] = -e, n[5] = c, n[6] = 0, n[8] = 0, n[9] = 0, n[10] = 1, n;
}
function Oo(o, n, c) {
    c = c || P();
    let e = o[0 * 4 + 0], r = o[0 * 4 + 1], u = o[0 * 4 + 2], i = o[1 * 4 + 0], M = o[1 * 4 + 1], f = o[1 * 4 + 2], a = Math.cos(n), t = Math.sin(n);
    return c[0] = a * e + t * i, c[1] = a * r + t * M, c[2] = a * u + t * f, c[4] = a * i - t * e, c[5] = a * M - t * r, c[6] = a * f - t * u, o !== c && (c[8] = o[8], c[9] = o[9], c[10] = o[10]), c;
}
function jo(o, n) {
    return n = n || P(), n[0] = o[0], n[1] = 0, n[2] = 0, n[4] = 0, n[5] = o[1], n[6] = 0, n[8] = 0, n[9] = 0, n[10] = 1, n;
}
function Qo(o, n, c) {
    c = c || P();
    let e = n[0], r = n[1];
    return c[0] = e * o[0 * 4 + 0], c[1] = e * o[0 * 4 + 1], c[2] = e * o[0 * 4 + 2], c[4] = r * o[1 * 4 + 0], c[5] = r * o[1 * 4 + 1], c[6] = r * o[1 * 4 + 2], o !== c && (c[8] = o[8], c[9] = o[9], c[10] = o[10]), c;
}
function Fo(o, n) {
    return n = n || P(), n[0] = o, n[1] = 0, n[2] = 0, n[4] = 0, n[5] = o, n[6] = 0, n[8] = 0, n[9] = 0, n[10] = 1, n;
}
function Po(o, n, c) {
    return c = c || P(), c[0] = n * o[0 * 4 + 0], c[1] = n * o[0 * 4 + 1], c[2] = n * o[0 * 4 + 2], c[4] = n * o[1 * 4 + 0], c[5] = n * o[1 * 4 + 1], c[6] = n * o[1 * 4 + 2], o !== c && (c[8] = o[8], c[9] = o[9], c[10] = o[10]), c;
}
var ne = Object.freeze({
    __proto__: null,
    setDefaultType: En,
    create: ao,
    set: fo,
    fromMat4: lo,
    fromQuat: to,
    negate: Mo,
    copy: Mn,
    clone: ho,
    equalsApproximately: $o,
    equals: po,
    identity: Xn,
    transpose: wo,
    inverse: Yn,
    determinant: yo,
    invert: xo,
    multiply: Zn,
    mul: go,
    setTranslation: zo,
    getTranslation: qo,
    getAxis: So,
    setAxis: Ao,
    getScaling: To,
    translation: _o,
    translate: Vo,
    rotation: Do,
    rotate: Oo,
    scaling: jo,
    scale: Qo,
    uniformScaling: Fo,
    uniformScale: Po
}), q = Float32Array;
function In(o) {
    let n = q;
    return q = o, n;
}
function E(o, n, c) {
    let e = new q(3);
    return o !== void 0 && (e[0] = o, n !== void 0 && (e[1] = n, c !== void 0 && (e[2] = c))), e;
}
var Eo = E;
function Xo(o, n, c, e) {
    return e = e || new q(3), e[0] = o, e[1] = n, e[2] = c, e;
}
function Yo(o, n) {
    return n = n || new q(3), n[0] = Math.ceil(o[0]), n[1] = Math.ceil(o[1]), n[2] = Math.ceil(o[2]), n;
}
function Zo(o, n) {
    return n = n || new q(3), n[0] = Math.floor(o[0]), n[1] = Math.floor(o[1]), n[2] = Math.floor(o[2]), n;
}
function Io(o, n) {
    return n = n || new q(3), n[0] = Math.round(o[0]), n[1] = Math.round(o[1]), n[2] = Math.round(o[2]), n;
}
function Lo(o, n = 0, c = 1, e) {
    return e = e || new q(3), e[0] = Math.min(c, Math.max(n, o[0])), e[1] = Math.min(c, Math.max(n, o[1])), e[2] = Math.min(c, Math.max(n, o[2])), e;
}
function Ho(o, n, c) {
    return c = c || new q(3), c[0] = o[0] + n[0], c[1] = o[1] + n[1], c[2] = o[2] + n[2], c;
}
function Co(o, n, c, e) {
    return e = e || new q(3), e[0] = o[0] + n[0] * c, e[1] = o[1] + n[1] * c, e[2] = o[2] + n[2] * c, e;
}
function Uo(o, n) {
    let c = o[0], e = o[1], r = o[2], u = o[0], i = o[1], M = o[2], f = Math.sqrt(c * c + e * e + r * r), a = Math.sqrt(u * u + i * i + M * M), t = f * a, l = t && hn(o, n) / t;
    return Math.acos(l);
}
function b(o, n, c) {
    return c = c || new q(3), c[0] = o[0] - n[0], c[1] = o[1] - n[1], c[2] = o[2] - n[2], c;
}
var Bo = b;
function Go(o, n) {
    return Math.abs(o[0] - n[0]) < x && Math.abs(o[1] - n[1]) < x && Math.abs(o[2] - n[2]) < x;
}
function Jo(o, n) {
    return o[0] === n[0] && o[1] === n[1] && o[2] === n[2];
}
function Ko(o, n, c, e) {
    return e = e || new q(3), e[0] = o[0] + c * (n[0] - o[0]), e[1] = o[1] + c * (n[1] - o[1]), e[2] = o[2] + c * (n[2] - o[2]), e;
}
function No(o, n, c, e) {
    return e = e || new q(3), e[0] = o[0] + c[0] * (n[0] - o[0]), e[1] = o[1] + c[1] * (n[1] - o[1]), e[2] = o[2] + c[2] * (n[2] - o[2]), e;
}
function Wo(o, n, c) {
    return c = c || new q(3), c[0] = Math.max(o[0], n[0]), c[1] = Math.max(o[1], n[1]), c[2] = Math.max(o[2], n[2]), c;
}
function Ro(o, n, c) {
    return c = c || new q(3), c[0] = Math.min(o[0], n[0]), c[1] = Math.min(o[1], n[1]), c[2] = Math.min(o[2], n[2]), c;
}
function Ln(o, n, c) {
    return c = c || new q(3), c[0] = o[0] * n, c[1] = o[1] * n, c[2] = o[2] * n, c;
}
var ko = Ln;
function vo(o, n, c) {
    return c = c || new q(3), c[0] = o[0] / n, c[1] = o[1] / n, c[2] = o[2] / n, c;
}
function Hn(o, n) {
    return n = n || new q(3), n[0] = 1 / o[0], n[1] = 1 / o[1], n[2] = 1 / o[2], n;
}
var mo = Hn;
function v(o, n, c) {
    c = c || new q(3);
    let e = o[2] * n[0] - o[0] * n[2], r = o[0] * n[1] - o[1] * n[0];
    return c[0] = o[1] * n[2] - o[2] * n[1], c[1] = e, c[2] = r, c;
}
function hn(o, n) {
    return o[0] * n[0] + o[1] * n[1] + o[2] * n[2];
}
function Cn(o) {
    let n = o[0], c = o[1], e = o[2];
    return Math.sqrt(n * n + c * c + e * e);
}
var Un = Cn;
function Bn(o) {
    let n = o[0], c = o[1], e = o[2];
    return n * n + c * c + e * e;
}
var bo = Bn;
function Gn(o, n) {
    let c = o[0] - n[0], e = o[1] - n[1], r = o[2] - n[2];
    return Math.sqrt(c * c + e * e + r * r);
}
var so = Gn;
function Jn(o, n) {
    let c = o[0] - n[0], e = o[1] - n[1], r = o[2] - n[2];
    return c * c + e * e + r * r;
}
var n0 = Jn;
function k(o, n) {
    n = n || new q(3);
    let c = o[0], e = o[1], r = o[2], u = Math.sqrt(c * c + e * e + r * r);
    return u > 1e-5 ? (n[0] = c / u, n[1] = e / u, n[2] = r / u) : (n[0] = 0, n[1] = 0, n[2] = 0), n;
}
function o0(o, n) {
    return n = n || new q(3), n[0] = -o[0], n[1] = -o[1], n[2] = -o[2], n;
}
function Kn(o, n) {
    return n = n || new q(3), n[0] = o[0], n[1] = o[1], n[2] = o[2], n;
}
var c0 = Kn;
function Nn(o, n, c) {
    return c = c || new q(3), c[0] = o[0] * n[0], c[1] = o[1] * n[1], c[2] = o[2] * n[2], c;
}
var e0 = Nn;
function Wn(o, n, c) {
    return c = c || new q(3), c[0] = o[0] / n[0], c[1] = o[1] / n[1], c[2] = o[2] / n[2], c;
}
var r0 = Wn;
function u0(o = 1, n) {
    n = n || new q(3);
    let c = Math.random() * 2 * Math.PI, e = Math.random() * 2 - 1, r = Math.sqrt(1 - e * e) * o;
    return n[0] = Math.cos(c) * r, n[1] = Math.sin(c) * r, n[2] = e * o, n;
}
function i0(o) {
    return o = o || new q(3), o[0] = 0, o[1] = 0, o[2] = 0, o;
}
function a0(o, n, c) {
    c = c || new q(3);
    let e = o[0], r = o[1], u = o[2], i = n[3] * e + n[7] * r + n[11] * u + n[15] || 1;
    return c[0] = (n[0] * e + n[4] * r + n[8] * u + n[12]) / i, c[1] = (n[1] * e + n[5] * r + n[9] * u + n[13]) / i, c[2] = (n[2] * e + n[6] * r + n[10] * u + n[14]) / i, c;
}
function f0(o, n, c) {
    c = c || new q(3);
    let e = o[0], r = o[1], u = o[2];
    return c[0] = e * n[0 * 4 + 0] + r * n[1 * 4 + 0] + u * n[2 * 4 + 0], c[1] = e * n[0 * 4 + 1] + r * n[1 * 4 + 1] + u * n[2 * 4 + 1], c[2] = e * n[0 * 4 + 2] + r * n[1 * 4 + 2] + u * n[2 * 4 + 2], c;
}
function l0(o, n, c) {
    c = c || new q(3);
    let e = o[0], r = o[1], u = o[2];
    return c[0] = e * n[0] + r * n[4] + u * n[8], c[1] = e * n[1] + r * n[5] + u * n[9], c[2] = e * n[2] + r * n[6] + u * n[10], c;
}
function t0(o, n, c) {
    c = c || new q(3);
    let e = n[0], r = n[1], u = n[2], i = n[3] * 2, M = o[0], f = o[1], a = o[2], t = r * a - u * f, l = u * M - e * a, h = e * f - r * M;
    return c[0] = M + t * i + (r * h - u * l) * 2, c[1] = f + l * i + (u * t - e * h) * 2, c[2] = a + h * i + (e * l - r * t) * 2, c;
}
function M0(o, n) {
    return n = n || new q(3), n[0] = o[12], n[1] = o[13], n[2] = o[14], n;
}
function h0(o, n, c) {
    c = c || new q(3);
    let e = n * 4;
    return c[0] = o[e + 0], c[1] = o[e + 1], c[2] = o[e + 2], c;
}
function $0(o, n) {
    n = n || new q(3);
    let c = o[0], e = o[1], r = o[2], u = o[4], i = o[5], M = o[6], f = o[8], a = o[9], t = o[10];
    return n[0] = Math.sqrt(c * c + e * e + r * r), n[1] = Math.sqrt(u * u + i * i + M * M), n[2] = Math.sqrt(f * f + a * a + t * t), n;
}
var oe = Object.freeze({
    __proto__: null,
    create: E,
    setDefaultType: In,
    fromValues: Eo,
    set: Xo,
    ceil: Yo,
    floor: Zo,
    round: Io,
    clamp: Lo,
    add: Ho,
    addScaled: Co,
    angle: Uo,
    subtract: b,
    sub: Bo,
    equalsApproximately: Go,
    equals: Jo,
    lerp: Ko,
    lerpV: No,
    max: Wo,
    min: Ro,
    mulScalar: Ln,
    scale: ko,
    divScalar: vo,
    inverse: Hn,
    invert: mo,
    cross: v,
    dot: hn,
    length: Cn,
    len: Un,
    lengthSq: Bn,
    lenSq: bo,
    distance: Gn,
    dist: so,
    distanceSq: Jn,
    distSq: n0,
    normalize: k,
    negate: o0,
    copy: Kn,
    clone: c0,
    multiply: Nn,
    mul: e0,
    divide: Wn,
    div: r0,
    random: u0,
    zero: i0,
    transformMat4: a0,
    transformMat4Upper3x3: f0,
    transformMat3: l0,
    transformQuat: t0,
    getTranslation: M0,
    getAxis: h0,
    getScaling: $0
}), S = Float32Array;
function Rn(o) {
    let n = S;
    return S = o, n;
}
function p0(o, n, c, e, r, u, i, M, f, a, t, l, h, $, w, y) {
    let p = new S(16);
    return o !== void 0 && (p[0] = o, n !== void 0 && (p[1] = n, c !== void 0 && (p[2] = c, e !== void 0 && (p[3] = e, r !== void 0 && (p[4] = r, u !== void 0 && (p[5] = u, i !== void 0 && (p[6] = i, M !== void 0 && (p[7] = M, f !== void 0 && (p[8] = f, a !== void 0 && (p[9] = a, t !== void 0 && (p[10] = t, l !== void 0 && (p[11] = l, h !== void 0 && (p[12] = h, $ !== void 0 && (p[13] = $, w !== void 0 && (p[14] = w, y !== void 0 && (p[15] = y)))))))))))))))), p;
}
function w0(o, n, c, e, r, u, i, M, f, a, t, l, h, $, w, y, p) {
    return p = p || new S(16), p[0] = o, p[1] = n, p[2] = c, p[3] = e, p[4] = r, p[5] = u, p[6] = i, p[7] = M, p[8] = f, p[9] = a, p[10] = t, p[11] = l, p[12] = h, p[13] = $, p[14] = w, p[15] = y, p;
}
function y0(o, n) {
    return n = n || new S(16), n[0] = o[0], n[1] = o[1], n[2] = o[2], n[3] = 0, n[4] = o[4], n[5] = o[5], n[6] = o[6], n[7] = 0, n[8] = o[8], n[9] = o[9], n[10] = o[10], n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, n;
}
function x0(o, n) {
    n = n || new S(16);
    let c = o[0], e = o[1], r = o[2], u = o[3], i = c + c, M = e + e, f = r + r, a = c * i, t = e * i, l = e * M, h = r * i, $ = r * M, w = r * f, y = u * i, p = u * M, g = u * f;
    return n[0] = 1 - l - w, n[1] = t + g, n[2] = h - p, n[3] = 0, n[4] = t - g, n[5] = 1 - a - w, n[6] = $ + y, n[7] = 0, n[8] = h + p, n[9] = $ - y, n[10] = 1 - a - l, n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, n;
}
function g0(o, n) {
    return n = n || new S(16), n[0] = -o[0], n[1] = -o[1], n[2] = -o[2], n[3] = -o[3], n[4] = -o[4], n[5] = -o[5], n[6] = -o[6], n[7] = -o[7], n[8] = -o[8], n[9] = -o[9], n[10] = -o[10], n[11] = -o[11], n[12] = -o[12], n[13] = -o[13], n[14] = -o[14], n[15] = -o[15], n;
}
function $n(o, n) {
    return n = n || new S(16), n[0] = o[0], n[1] = o[1], n[2] = o[2], n[3] = o[3], n[4] = o[4], n[5] = o[5], n[6] = o[6], n[7] = o[7], n[8] = o[8], n[9] = o[9], n[10] = o[10], n[11] = o[11], n[12] = o[12], n[13] = o[13], n[14] = o[14], n[15] = o[15], n;
}
var z0 = $n;
function q0(o, n) {
    return Math.abs(o[0] - n[0]) < x && Math.abs(o[1] - n[1]) < x && Math.abs(o[2] - n[2]) < x && Math.abs(o[3] - n[3]) < x && Math.abs(o[4] - n[4]) < x && Math.abs(o[5] - n[5]) < x && Math.abs(o[6] - n[6]) < x && Math.abs(o[7] - n[7]) < x && Math.abs(o[8] - n[8]) < x && Math.abs(o[9] - n[9]) < x && Math.abs(o[10] - n[10]) < x && Math.abs(o[11] - n[11]) < x && Math.abs(o[12] - n[12]) < x && Math.abs(o[13] - n[13]) < x && Math.abs(o[14] - n[14]) < x && Math.abs(o[15] - n[15]) < x;
}
function S0(o, n) {
    return o[0] === n[0] && o[1] === n[1] && o[2] === n[2] && o[3] === n[3] && o[4] === n[4] && o[5] === n[5] && o[6] === n[6] && o[7] === n[7] && o[8] === n[8] && o[9] === n[9] && o[10] === n[10] && o[11] === n[11] && o[12] === n[12] && o[13] === n[13] && o[14] === n[14] && o[15] === n[15];
}
function kn(o) {
    return o = o || new S(16), o[0] = 1, o[1] = 0, o[2] = 0, o[3] = 0, o[4] = 0, o[5] = 1, o[6] = 0, o[7] = 0, o[8] = 0, o[9] = 0, o[10] = 1, o[11] = 0, o[12] = 0, o[13] = 0, o[14] = 0, o[15] = 1, o;
}
function A0(o, n) {
    if (n = n || new S(16), n === o) {
        let z;
        return z = o[1], o[1] = o[4], o[4] = z, z = o[2], o[2] = o[8], o[8] = z, z = o[3], o[3] = o[12], o[12] = z, z = o[6], o[6] = o[9], o[9] = z, z = o[7], o[7] = o[13], o[13] = z, z = o[11], o[11] = o[14], o[14] = z, n;
    }
    let c = o[0 * 4 + 0], e = o[0 * 4 + 1], r = o[0 * 4 + 2], u = o[0 * 4 + 3], i = o[1 * 4 + 0], M = o[1 * 4 + 1], f = o[1 * 4 + 2], a = o[1 * 4 + 3], t = o[2 * 4 + 0], l = o[2 * 4 + 1], h = o[2 * 4 + 2], $ = o[2 * 4 + 3], w = o[3 * 4 + 0], y = o[3 * 4 + 1], p = o[3 * 4 + 2], g = o[3 * 4 + 3];
    return n[0] = c, n[1] = i, n[2] = t, n[3] = w, n[4] = e, n[5] = M, n[6] = l, n[7] = y, n[8] = r, n[9] = f, n[10] = h, n[11] = p, n[12] = u, n[13] = a, n[14] = $, n[15] = g, n;
}
function vn(o, n) {
    n = n || new S(16);
    let c = o[0 * 4 + 0], e = o[0 * 4 + 1], r = o[0 * 4 + 2], u = o[0 * 4 + 3], i = o[1 * 4 + 0], M = o[1 * 4 + 1], f = o[1 * 4 + 2], a = o[1 * 4 + 3], t = o[2 * 4 + 0], l = o[2 * 4 + 1], h = o[2 * 4 + 2], $ = o[2 * 4 + 3], w = o[3 * 4 + 0], y = o[3 * 4 + 1], p = o[3 * 4 + 2], g = o[3 * 4 + 3], z = h * g, j = p * $, Q = f * g, F = p * a, X = f * $, Y = h * a, Z = r * g, I = p * u, L = r * $, H = h * u, C = r * a, B = f * u, G = t * y, J = w * l, K = i * y, N = w * M, W = i * l, s = t * M, d = c * y, nn = w * e, on = c * l, cn = t * e, en = c * M, rn = i * e, pn = z * M + F * l + X * y - (j * M + Q * l + Y * y), wn = j * e + Z * l + H * y - (z * e + I * l + L * y), yn = Q * e + I * M + C * y - (F * e + Z * M + B * y), xn = Y * e + L * M + B * l - (X * e + H * M + C * l), U = 1 / (c * pn + i * wn + t * yn + w * xn);
    return n[0] = U * pn, n[1] = U * wn, n[2] = U * yn, n[3] = U * xn, n[4] = U * (j * i + Q * t + Y * w - (z * i + F * t + X * w)), n[5] = U * (z * c + I * t + L * w - (j * c + Z * t + H * w)), n[6] = U * (F * c + Z * i + B * w - (Q * c + I * i + C * w)), n[7] = U * (X * c + H * i + C * t - (Y * c + L * i + B * t)), n[8] = U * (G * a + N * $ + W * g - (J * a + K * $ + s * g)), n[9] = U * (J * u + d * $ + cn * g - (G * u + nn * $ + on * g)), n[10] = U * (K * u + nn * a + en * g - (N * u + d * a + rn * g)), n[11] = U * (s * u + on * a + rn * $ - (W * u + cn * a + en * $)), n[12] = U * (K * h + s * p + J * f - (W * p + G * f + N * h)), n[13] = U * (on * p + G * r + nn * h - (d * h + cn * p + J * r)), n[14] = U * (d * f + rn * p + N * r - (en * p + K * r + nn * f)), n[15] = U * (en * h + W * r + cn * f - (on * f + rn * h + s * r)), n;
}
function T0(o) {
    let n = o[0], c = o[0 * 4 + 1], e = o[0 * 4 + 2], r = o[0 * 4 + 3], u = o[1 * 4 + 0], i = o[1 * 4 + 1], M = o[1 * 4 + 2], f = o[1 * 4 + 3], a = o[2 * 4 + 0], t = o[2 * 4 + 1], l = o[2 * 4 + 2], h = o[2 * 4 + 3], $ = o[3 * 4 + 0], w = o[3 * 4 + 1], y = o[3 * 4 + 2], p = o[3 * 4 + 3], g = l * p, z = y * h, j = M * p, Q = y * f, F = M * h, X = l * f, Y = e * p, Z = y * r, I = e * h, L = l * r, H = e * f, C = M * r, B = g * i + Q * t + F * w - (z * i + j * t + X * w), G = z * c + Y * t + L * w - (g * c + Z * t + I * w), J = j * c + Z * i + H * w - (Q * c + Y * i + C * w), K = X * c + I * i + C * t - (F * c + L * i + H * t);
    return n * B + u * G + a * J + $ * K;
}
var _0 = vn;
function mn(o, n, c) {
    c = c || new S(16);
    let e = o[0], r = o[1], u = o[2], i = o[3], M = o[4 + 0], f = o[4 + 1], a = o[4 + 2], t = o[4 + 3], l = o[8 + 0], h = o[8 + 1], $ = o[8 + 2], w = o[8 + 3], y = o[12 + 0], p = o[12 + 1], g = o[12 + 2], z = o[12 + 3], j = n[0], Q = n[1], F = n[2], X = n[3], Y = n[4 + 0], Z = n[4 + 1], I = n[4 + 2], L = n[4 + 3], H = n[8 + 0], C = n[8 + 1], B = n[8 + 2], G = n[8 + 3], J = n[12 + 0], K = n[12 + 1], N = n[12 + 2], W = n[12 + 3];
    return c[0] = e * j + M * Q + l * F + y * X, c[1] = r * j + f * Q + h * F + p * X, c[2] = u * j + a * Q + $ * F + g * X, c[3] = i * j + t * Q + w * F + z * X, c[4] = e * Y + M * Z + l * I + y * L, c[5] = r * Y + f * Z + h * I + p * L, c[6] = u * Y + a * Z + $ * I + g * L, c[7] = i * Y + t * Z + w * I + z * L, c[8] = e * H + M * C + l * B + y * G, c[9] = r * H + f * C + h * B + p * G, c[10] = u * H + a * C + $ * B + g * G, c[11] = i * H + t * C + w * B + z * G, c[12] = e * J + M * K + l * N + y * W, c[13] = r * J + f * K + h * N + p * W, c[14] = u * J + a * K + $ * N + g * W, c[15] = i * J + t * K + w * N + z * W, c;
}
var V0 = mn;
function D0(o, n, c) {
    return c = c || kn(), o !== c && (c[0] = o[0], c[1] = o[1], c[2] = o[2], c[3] = o[3], c[4] = o[4], c[5] = o[5], c[6] = o[6], c[7] = o[7], c[8] = o[8], c[9] = o[9], c[10] = o[10], c[11] = o[11]), c[12] = n[0], c[13] = n[1], c[14] = n[2], c[15] = 1, c;
}
function O0(o, n) {
    return n = n || E(), n[0] = o[12], n[1] = o[13], n[2] = o[14], n;
}
function j0(o, n, c) {
    c = c || E();
    let e = n * 4;
    return c[0] = o[e + 0], c[1] = o[e + 1], c[2] = o[e + 2], c;
}
function Q0(o, n, c, e) {
    e !== o && (e = $n(o, e));
    let r = c * 4;
    return e[r + 0] = n[0], e[r + 1] = n[1], e[r + 2] = n[2], e;
}
function F0(o, n) {
    n = n || E();
    let c = o[0], e = o[1], r = o[2], u = o[4], i = o[5], M = o[6], f = o[8], a = o[9], t = o[10];
    return n[0] = Math.sqrt(c * c + e * e + r * r), n[1] = Math.sqrt(u * u + i * i + M * M), n[2] = Math.sqrt(f * f + a * a + t * t), n;
}
function P0(o, n, c, e, r) {
    r = r || new S(16);
    let u = Math.tan(Math.PI * .5 - .5 * o);
    if (r[0] = u / n, r[1] = 0, r[2] = 0, r[3] = 0, r[4] = 0, r[5] = u, r[6] = 0, r[7] = 0, r[8] = 0, r[9] = 0, r[11] = -1, r[12] = 0, r[13] = 0, r[15] = 0, e === 1 / 0) r[10] = -1, r[14] = -c;
    else {
        let i = 1 / (c - e);
        r[10] = e * i, r[14] = e * c * i;
    }
    return r;
}
function E0(o, n, c, e, r, u, i) {
    return i = i || new S(16), i[0] = 2 / (n - o), i[1] = 0, i[2] = 0, i[3] = 0, i[4] = 0, i[5] = 2 / (e - c), i[6] = 0, i[7] = 0, i[8] = 0, i[9] = 0, i[10] = 1 / (r - u), i[11] = 0, i[12] = (n + o) / (o - n), i[13] = (e + c) / (c - e), i[14] = r / (r - u), i[15] = 1, i;
}
function X0(o, n, c, e, r, u, i) {
    i = i || new S(16);
    let M = n - o, f = e - c, a = r - u;
    return i[0] = 2 * r / M, i[1] = 0, i[2] = 0, i[3] = 0, i[4] = 0, i[5] = 2 * r / f, i[6] = 0, i[7] = 0, i[8] = (o + n) / M, i[9] = (e + c) / f, i[10] = u / a, i[11] = -1, i[12] = 0, i[13] = 0, i[14] = r * u / a, i[15] = 0, i;
}
var _, O, A;
function Y0(o, n, c, e) {
    return e = e || new S(16), _ = _ || E(), O = O || E(), A = A || E(), k(b(n, o, A), A), k(v(c, A, _), _), k(v(A, _, O), O), e[0] = _[0], e[1] = _[1], e[2] = _[2], e[3] = 0, e[4] = O[0], e[5] = O[1], e[6] = O[2], e[7] = 0, e[8] = A[0], e[9] = A[1], e[10] = A[2], e[11] = 0, e[12] = o[0], e[13] = o[1], e[14] = o[2], e[15] = 1, e;
}
function Z0(o, n, c, e) {
    return e = e || new S(16), _ = _ || E(), O = O || E(), A = A || E(), k(b(o, n, A), A), k(v(c, A, _), _), k(v(A, _, O), O), e[0] = _[0], e[1] = _[1], e[2] = _[2], e[3] = 0, e[4] = O[0], e[5] = O[1], e[6] = O[2], e[7] = 0, e[8] = A[0], e[9] = A[1], e[10] = A[2], e[11] = 0, e[12] = o[0], e[13] = o[1], e[14] = o[2], e[15] = 1, e;
}
function I0(o, n, c, e) {
    return e = e || new S(16), _ = _ || E(), O = O || E(), A = A || E(), k(b(o, n, A), A), k(v(c, A, _), _), k(v(A, _, O), O), e[0] = _[0], e[1] = O[0], e[2] = A[0], e[3] = 0, e[4] = _[1], e[5] = O[1], e[6] = A[1], e[7] = 0, e[8] = _[2], e[9] = O[2], e[10] = A[2], e[11] = 0, e[12] = -(_[0] * o[0] + _[1] * o[1] + _[2] * o[2]), e[13] = -(O[0] * o[0] + O[1] * o[1] + O[2] * o[2]), e[14] = -(A[0] * o[0] + A[1] * o[1] + A[2] * o[2]), e[15] = 1, e;
}
function L0(o, n) {
    return n = n || new S(16), n[0] = 1, n[1] = 0, n[2] = 0, n[3] = 0, n[4] = 0, n[5] = 1, n[6] = 0, n[7] = 0, n[8] = 0, n[9] = 0, n[10] = 1, n[11] = 0, n[12] = o[0], n[13] = o[1], n[14] = o[2], n[15] = 1, n;
}
function H0(o, n, c) {
    c = c || new S(16);
    let e = n[0], r = n[1], u = n[2], i = o[0], M = o[1], f = o[2], a = o[3], t = o[1 * 4 + 0], l = o[1 * 4 + 1], h = o[1 * 4 + 2], $ = o[1 * 4 + 3], w = o[2 * 4 + 0], y = o[2 * 4 + 1], p = o[2 * 4 + 2], g = o[2 * 4 + 3], z = o[3 * 4 + 0], j = o[3 * 4 + 1], Q = o[3 * 4 + 2], F = o[3 * 4 + 3];
    return o !== c && (c[0] = i, c[1] = M, c[2] = f, c[3] = a, c[4] = t, c[5] = l, c[6] = h, c[7] = $, c[8] = w, c[9] = y, c[10] = p, c[11] = g), c[12] = i * e + t * r + w * u + z, c[13] = M * e + l * r + y * u + j, c[14] = f * e + h * r + p * u + Q, c[15] = a * e + $ * r + g * u + F, c;
}
function C0(o, n) {
    n = n || new S(16);
    let c = Math.cos(o), e = Math.sin(o);
    return n[0] = 1, n[1] = 0, n[2] = 0, n[3] = 0, n[4] = 0, n[5] = c, n[6] = e, n[7] = 0, n[8] = 0, n[9] = -e, n[10] = c, n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, n;
}
function U0(o, n, c) {
    c = c || new S(16);
    let e = o[4], r = o[5], u = o[6], i = o[7], M = o[8], f = o[9], a = o[10], t = o[11], l = Math.cos(n), h = Math.sin(n);
    return c[4] = l * e + h * M, c[5] = l * r + h * f, c[6] = l * u + h * a, c[7] = l * i + h * t, c[8] = l * M - h * e, c[9] = l * f - h * r, c[10] = l * a - h * u, c[11] = l * t - h * i, o !== c && (c[0] = o[0], c[1] = o[1], c[2] = o[2], c[3] = o[3], c[12] = o[12], c[13] = o[13], c[14] = o[14], c[15] = o[15]), c;
}
function B0(o, n) {
    n = n || new S(16);
    let c = Math.cos(o), e = Math.sin(o);
    return n[0] = c, n[1] = 0, n[2] = -e, n[3] = 0, n[4] = 0, n[5] = 1, n[6] = 0, n[7] = 0, n[8] = e, n[9] = 0, n[10] = c, n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, n;
}
function G0(o, n, c) {
    c = c || new S(16);
    let e = o[0 * 4 + 0], r = o[0 * 4 + 1], u = o[0 * 4 + 2], i = o[0 * 4 + 3], M = o[2 * 4 + 0], f = o[2 * 4 + 1], a = o[2 * 4 + 2], t = o[2 * 4 + 3], l = Math.cos(n), h = Math.sin(n);
    return c[0] = l * e - h * M, c[1] = l * r - h * f, c[2] = l * u - h * a, c[3] = l * i - h * t, c[8] = l * M + h * e, c[9] = l * f + h * r, c[10] = l * a + h * u, c[11] = l * t + h * i, o !== c && (c[4] = o[4], c[5] = o[5], c[6] = o[6], c[7] = o[7], c[12] = o[12], c[13] = o[13], c[14] = o[14], c[15] = o[15]), c;
}
function J0(o, n) {
    n = n || new S(16);
    let c = Math.cos(o), e = Math.sin(o);
    return n[0] = c, n[1] = e, n[2] = 0, n[3] = 0, n[4] = -e, n[5] = c, n[6] = 0, n[7] = 0, n[8] = 0, n[9] = 0, n[10] = 1, n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, n;
}
function K0(o, n, c) {
    c = c || new S(16);
    let e = o[0 * 4 + 0], r = o[0 * 4 + 1], u = o[0 * 4 + 2], i = o[0 * 4 + 3], M = o[1 * 4 + 0], f = o[1 * 4 + 1], a = o[1 * 4 + 2], t = o[1 * 4 + 3], l = Math.cos(n), h = Math.sin(n);
    return c[0] = l * e + h * M, c[1] = l * r + h * f, c[2] = l * u + h * a, c[3] = l * i + h * t, c[4] = l * M - h * e, c[5] = l * f - h * r, c[6] = l * a - h * u, c[7] = l * t - h * i, o !== c && (c[8] = o[8], c[9] = o[9], c[10] = o[10], c[11] = o[11], c[12] = o[12], c[13] = o[13], c[14] = o[14], c[15] = o[15]), c;
}
function bn(o, n, c) {
    c = c || new S(16);
    let e = o[0], r = o[1], u = o[2], i = Math.sqrt(e * e + r * r + u * u);
    e /= i, r /= i, u /= i;
    let M = e * e, f = r * r, a = u * u, t = Math.cos(n), l = Math.sin(n), h = 1 - t;
    return c[0] = M + (1 - M) * t, c[1] = e * r * h + u * l, c[2] = e * u * h - r * l, c[3] = 0, c[4] = e * r * h - u * l, c[5] = f + (1 - f) * t, c[6] = r * u * h + e * l, c[7] = 0, c[8] = e * u * h + r * l, c[9] = r * u * h - e * l, c[10] = a + (1 - a) * t, c[11] = 0, c[12] = 0, c[13] = 0, c[14] = 0, c[15] = 1, c;
}
var N0 = bn;
function sn(o, n, c, e) {
    e = e || new S(16);
    let r = n[0], u = n[1], i = n[2], M = Math.sqrt(r * r + u * u + i * i);
    r /= M, u /= M, i /= M;
    let f = r * r, a = u * u, t = i * i, l = Math.cos(c), h = Math.sin(c), $ = 1 - l, w = f + (1 - f) * l, y = r * u * $ + i * h, p = r * i * $ - u * h, g = r * u * $ - i * h, z = a + (1 - a) * l, j = u * i * $ + r * h, Q = r * i * $ + u * h, F = u * i * $ - r * h, X = t + (1 - t) * l, Y = o[0], Z = o[1], I = o[2], L = o[3], H = o[4], C = o[5], B = o[6], G = o[7], J = o[8], K = o[9], N = o[10], W = o[11];
    return e[0] = w * Y + y * H + p * J, e[1] = w * Z + y * C + p * K, e[2] = w * I + y * B + p * N, e[3] = w * L + y * G + p * W, e[4] = g * Y + z * H + j * J, e[5] = g * Z + z * C + j * K, e[6] = g * I + z * B + j * N, e[7] = g * L + z * G + j * W, e[8] = Q * Y + F * H + X * J, e[9] = Q * Z + F * C + X * K, e[10] = Q * I + F * B + X * N, e[11] = Q * L + F * G + X * W, o !== e && (e[12] = o[12], e[13] = o[13], e[14] = o[14], e[15] = o[15]), e;
}
var W0 = sn;
function R0(o, n) {
    return n = n || new S(16), n[0] = o[0], n[1] = 0, n[2] = 0, n[3] = 0, n[4] = 0, n[5] = o[1], n[6] = 0, n[7] = 0, n[8] = 0, n[9] = 0, n[10] = o[2], n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, n;
}
function k0(o, n, c) {
    c = c || new S(16);
    let e = n[0], r = n[1], u = n[2];
    return c[0] = e * o[0 * 4 + 0], c[1] = e * o[0 * 4 + 1], c[2] = e * o[0 * 4 + 2], c[3] = e * o[0 * 4 + 3], c[4] = r * o[1 * 4 + 0], c[5] = r * o[1 * 4 + 1], c[6] = r * o[1 * 4 + 2], c[7] = r * o[1 * 4 + 3], c[8] = u * o[2 * 4 + 0], c[9] = u * o[2 * 4 + 1], c[10] = u * o[2 * 4 + 2], c[11] = u * o[2 * 4 + 3], o !== c && (c[12] = o[12], c[13] = o[13], c[14] = o[14], c[15] = o[15]), c;
}
function v0(o, n) {
    return n = n || new S(16), n[0] = o, n[1] = 0, n[2] = 0, n[3] = 0, n[4] = 0, n[5] = o, n[6] = 0, n[7] = 0, n[8] = 0, n[9] = 0, n[10] = o, n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, n;
}
function m0(o, n, c) {
    return c = c || new S(16), c[0] = n * o[0 * 4 + 0], c[1] = n * o[0 * 4 + 1], c[2] = n * o[0 * 4 + 2], c[3] = n * o[0 * 4 + 3], c[4] = n * o[1 * 4 + 0], c[5] = n * o[1 * 4 + 1], c[6] = n * o[1 * 4 + 2], c[7] = n * o[1 * 4 + 3], c[8] = n * o[2 * 4 + 0], c[9] = n * o[2 * 4 + 1], c[10] = n * o[2 * 4 + 2], c[11] = n * o[2 * 4 + 3], o !== c && (c[12] = o[12], c[13] = o[13], c[14] = o[14], c[15] = o[15]), c;
}
var ce = Object.freeze({
    __proto__: null,
    setDefaultType: Rn,
    create: p0,
    set: w0,
    fromMat3: y0,
    fromQuat: x0,
    negate: g0,
    copy: $n,
    clone: z0,
    equalsApproximately: q0,
    equals: S0,
    identity: kn,
    transpose: A0,
    inverse: vn,
    determinant: T0,
    invert: _0,
    multiply: mn,
    mul: V0,
    setTranslation: D0,
    getTranslation: O0,
    getAxis: j0,
    setAxis: Q0,
    getScaling: F0,
    perspective: P0,
    ortho: E0,
    frustum: X0,
    aim: Y0,
    cameraAim: Z0,
    lookAt: I0,
    translation: L0,
    translate: H0,
    rotationX: C0,
    rotateX: U0,
    rotationY: B0,
    rotateY: G0,
    rotationZ: J0,
    rotateZ: K0,
    axisRotation: bn,
    rotation: N0,
    axisRotate: sn,
    rotate: W0,
    scaling: R0,
    scale: k0,
    uniformScaling: v0,
    uniformScale: m0
}), V = Float32Array;
function dn(o) {
    let n = V;
    return V = o, n;
}
function n1(o, n, c, e) {
    let r = new V(4);
    return o !== void 0 && (r[0] = o, n !== void 0 && (r[1] = n, c !== void 0 && (r[2] = c, e !== void 0 && (r[3] = e)))), r;
}
var b0 = n1;
function s0(o, n, c, e, r) {
    return r = r || new V(4), r[0] = o, r[1] = n, r[2] = c, r[3] = e, r;
}
function o1(o, n, c) {
    c = c || new V(4);
    let e = n * .5, r = Math.sin(e);
    return c[0] = r * o[0], c[1] = r * o[1], c[2] = r * o[2], c[3] = Math.cos(e), c;
}
function d0(o, n) {
    n = n || E(4);
    let c = Math.acos(o[3]) * 2, e = Math.sin(c * .5);
    return e > x ? (n[0] = o[0] / e, n[1] = o[1] / e, n[2] = o[2] / e) : (n[0] = 1, n[1] = 0, n[2] = 0), {
        angle: c,
        axis: n
    };
}
function nc(o, n) {
    let c = i1(o, n);
    return Math.acos(2 * c * c - 1);
}
function c1(o, n, c) {
    c = c || new V(4);
    let e = o[0], r = o[1], u = o[2], i = o[3], M = n[0], f = n[1], a = n[2], t = n[3];
    return c[0] = e * t + i * M + r * a - u * f, c[1] = r * t + i * f + u * M - e * a, c[2] = u * t + i * a + e * f - r * M, c[3] = i * t - e * M - r * f - u * a, c;
}
var oc = c1;
function cc(o, n, c) {
    c = c || new V(4);
    let e = n * .5, r = o[0], u = o[1], i = o[2], M = o[3], f = Math.sin(e), a = Math.cos(e);
    return c[0] = r * a + M * f, c[1] = u * a + i * f, c[2] = i * a - u * f, c[3] = M * a - r * f, c;
}
function ec(o, n, c) {
    c = c || new V(4);
    let e = n * .5, r = o[0], u = o[1], i = o[2], M = o[3], f = Math.sin(e), a = Math.cos(e);
    return c[0] = r * a - i * f, c[1] = u * a + M * f, c[2] = i * a + r * f, c[3] = M * a - u * f, c;
}
function rc(o, n, c) {
    c = c || new V(4);
    let e = n * .5, r = o[0], u = o[1], i = o[2], M = o[3], f = Math.sin(e), a = Math.cos(e);
    return c[0] = r * a + u * f, c[1] = u * a - r * f, c[2] = i * a + M * f, c[3] = M * a - i * f, c;
}
function fn(o, n, c, e) {
    e = e || new V(4);
    let r = o[0], u = o[1], i = o[2], M = o[3], f = n[0], a = n[1], t = n[2], l = n[3], h = r * f + u * a + i * t + M * l;
    h < 0 && (h = -h, f = -f, a = -a, t = -t, l = -l);
    let $, w;
    if (1 - h > x) {
        let y = Math.acos(h), p = Math.sin(y);
        $ = Math.sin((1 - c) * y) / p, w = Math.sin(c * y) / p;
    } else $ = 1 - c, w = c;
    return e[0] = $ * r + w * f, e[1] = $ * u + w * a, e[2] = $ * i + w * t, e[3] = $ * M + w * l, e;
}
function uc(o, n) {
    n = n || new V(4);
    let c = o[0], e = o[1], r = o[2], u = o[3], i = c * c + e * e + r * r + u * u, M = i ? 1 / i : 0;
    return n[0] = -c * M, n[1] = -e * M, n[2] = -r * M, n[3] = u * M, n;
}
function ic(o, n) {
    return n = n || new V(4), n[0] = -o[0], n[1] = -o[1], n[2] = -o[2], n[3] = o[3], n;
}
function ac(o, n) {
    n = n || new V(4);
    let c = o[0] + o[5] + o[10];
    if (c > 0) {
        let e = Math.sqrt(c + 1);
        n[3] = .5 * e;
        let r = .5 / e;
        n[0] = (o[6] - o[9]) * r, n[1] = (o[8] - o[2]) * r, n[2] = (o[1] - o[4]) * r;
    } else {
        let e = 0;
        o[5] > o[0] && (e = 1), o[10] > o[e * 4 + e] && (e = 2);
        let r = (e + 1) % 3, u = (e + 2) % 3, i = Math.sqrt(o[e * 4 + e] - o[r * 4 + r] - o[u * 4 + u] + 1);
        n[e] = .5 * i;
        let M = .5 / i;
        n[3] = (o[r * 4 + u] - o[u * 4 + r]) * M, n[r] = (o[r * 4 + e] + o[e * 4 + r]) * M, n[u] = (o[u * 4 + e] + o[e * 4 + u]) * M;
    }
    return n;
}
function fc(o, n, c, e, r) {
    r = r || new V(4);
    let u = o * .5, i = n * .5, M = c * .5, f = Math.sin(u), a = Math.cos(u), t = Math.sin(i), l = Math.cos(i), h = Math.sin(M), $ = Math.cos(M);
    switch(e){
        case "xyz":
            r[0] = f * l * $ + a * t * h, r[1] = a * t * $ - f * l * h, r[2] = a * l * h + f * t * $, r[3] = a * l * $ - f * t * h;
            break;
        case "xzy":
            r[0] = f * l * $ - a * t * h, r[1] = a * t * $ - f * l * h, r[2] = a * l * h + f * t * $, r[3] = a * l * $ + f * t * h;
            break;
        case "yxz":
            r[0] = f * l * $ + a * t * h, r[1] = a * t * $ - f * l * h, r[2] = a * l * h - f * t * $, r[3] = a * l * $ + f * t * h;
            break;
        case "yzx":
            r[0] = f * l * $ + a * t * h, r[1] = a * t * $ + f * l * h, r[2] = a * l * h - f * t * $, r[3] = a * l * $ - f * t * h;
            break;
        case "zxy":
            r[0] = f * l * $ - a * t * h, r[1] = a * t * $ + f * l * h, r[2] = a * l * h + f * t * $, r[3] = a * l * $ - f * t * h;
            break;
        case "zyx":
            r[0] = f * l * $ - a * t * h, r[1] = a * t * $ + f * l * h, r[2] = a * l * h - f * t * $, r[3] = a * l * $ + f * t * h;
            break;
        default:
            throw new Error(`Unknown rotation order: ${e}`);
    }
    return r;
}
function e1(o, n) {
    return n = n || new V(4), n[0] = o[0], n[1] = o[1], n[2] = o[2], n[3] = o[3], n;
}
var lc = e1;
function tc(o, n, c) {
    return c = c || new V(4), c[0] = o[0] + n[0], c[1] = o[1] + n[1], c[2] = o[2] + n[2], c[3] = o[3] + n[3], c;
}
function r1(o, n, c) {
    return c = c || new V(4), c[0] = o[0] - n[0], c[1] = o[1] - n[1], c[2] = o[2] - n[2], c[3] = o[3] - n[3], c;
}
var Mc = r1;
function u1(o, n, c) {
    return c = c || new V(4), c[0] = o[0] * n, c[1] = o[1] * n, c[2] = o[2] * n, c[3] = o[3] * n, c;
}
var hc = u1;
function $c(o, n, c) {
    return c = c || new V(4), c[0] = o[0] / n, c[1] = o[1] / n, c[2] = o[2] / n, c[3] = o[3] / n, c;
}
function i1(o, n) {
    return o[0] * n[0] + o[1] * n[1] + o[2] * n[2] + o[3] * n[3];
}
function pc(o, n, c, e) {
    return e = e || new V(4), e[0] = o[0] + c * (n[0] - o[0]), e[1] = o[1] + c * (n[1] - o[1]), e[2] = o[2] + c * (n[2] - o[2]), e[3] = o[3] + c * (n[3] - o[3]), e;
}
function a1(o) {
    let n = o[0], c = o[1], e = o[2], r = o[3];
    return Math.sqrt(n * n + c * c + e * e + r * r);
}
var wc = a1;
function f1(o) {
    let n = o[0], c = o[1], e = o[2], r = o[3];
    return n * n + c * c + e * e + r * r;
}
var yc = f1;
function l1(o, n) {
    n = n || new V(4);
    let c = o[0], e = o[1], r = o[2], u = o[3], i = Math.sqrt(c * c + e * e + r * r + u * u);
    return i > 1e-5 ? (n[0] = c / i, n[1] = e / i, n[2] = r / i, n[3] = u / i) : (n[0] = 0, n[1] = 0, n[2] = 0, n[3] = 0), n;
}
function xc(o, n) {
    return Math.abs(o[0] - n[0]) < x && Math.abs(o[1] - n[1]) < x && Math.abs(o[2] - n[2]) < x && Math.abs(o[3] - n[3]) < x;
}
function gc(o, n) {
    return o[0] === n[0] && o[1] === n[1] && o[2] === n[2] && o[3] === n[3];
}
function zc(o) {
    return o = o || new V(4), o[0] = 0, o[1] = 0, o[2] = 0, o[3] = 1, o;
}
var R, ln, tn;
function qc(o, n, c) {
    c = c || new V(4), R = R || E(), ln = ln || E(1, 0, 0), tn = tn || E(0, 1, 0);
    let e = hn(o, n);
    return e < -.999999 ? (v(ln, o, R), Un(R) < 1e-6 && v(tn, o, R), k(R, R), o1(R, Math.PI, c), c) : e > .999999 ? (c[0] = 0, c[1] = 0, c[2] = 0, c[3] = 1, c) : (v(o, n, R), c[0] = R[0], c[1] = R[1], c[2] = R[2], c[3] = 1 + e, l1(c, c));
}
var un, an;
function Sc(o, n, c, e, r, u) {
    return u = u || new V(4), un = un || new V(4), an = an || new V(4), fn(o, e, r, un), fn(n, c, r, an), fn(un, an, 2 * r * (1 - r), u), u;
}
var ee = Object.freeze({
    __proto__: null,
    create: n1,
    setDefaultType: dn,
    fromValues: b0,
    set: s0,
    fromAxisAngle: o1,
    toAxisAngle: d0,
    angle: nc,
    multiply: c1,
    mul: oc,
    rotateX: cc,
    rotateY: ec,
    rotateZ: rc,
    slerp: fn,
    inverse: uc,
    conjugate: ic,
    fromMat: ac,
    fromEuler: fc,
    copy: e1,
    clone: lc,
    add: tc,
    subtract: r1,
    sub: Mc,
    mulScalar: u1,
    scale: hc,
    divScalar: $c,
    dot: i1,
    lerp: pc,
    length: a1,
    len: wc,
    lengthSq: f1,
    lenSq: yc,
    normalize: l1,
    equalsApproximately: xc,
    equals: gc,
    identity: zc,
    rotationTo: qc,
    sqlerp: Sc
}), D = Float32Array;
function t1(o) {
    let n = D;
    return D = o, n;
}
function M1(o, n, c, e) {
    let r = new D(4);
    return o !== void 0 && (r[0] = o, n !== void 0 && (r[1] = n, c !== void 0 && (r[2] = c, e !== void 0 && (r[3] = e)))), r;
}
var Ac = M1;
function Tc(o, n, c, e, r) {
    return r = r || new D(4), r[0] = o, r[1] = n, r[2] = c, r[3] = e, r;
}
function _c(o, n) {
    return n = n || new D(4), n[0] = Math.ceil(o[0]), n[1] = Math.ceil(o[1]), n[2] = Math.ceil(o[2]), n[3] = Math.ceil(o[3]), n;
}
function Vc(o, n) {
    return n = n || new D(4), n[0] = Math.floor(o[0]), n[1] = Math.floor(o[1]), n[2] = Math.floor(o[2]), n[3] = Math.floor(o[3]), n;
}
function Dc(o, n) {
    return n = n || new D(4), n[0] = Math.round(o[0]), n[1] = Math.round(o[1]), n[2] = Math.round(o[2]), n[3] = Math.round(o[3]), n;
}
function Oc(o, n = 0, c = 1, e) {
    return e = e || new D(4), e[0] = Math.min(c, Math.max(n, o[0])), e[1] = Math.min(c, Math.max(n, o[1])), e[2] = Math.min(c, Math.max(n, o[2])), e[3] = Math.min(c, Math.max(n, o[3])), e;
}
function jc(o, n, c) {
    return c = c || new D(4), c[0] = o[0] + n[0], c[1] = o[1] + n[1], c[2] = o[2] + n[2], c[3] = o[3] + n[3], c;
}
function Qc(o, n, c, e) {
    return e = e || new D(4), e[0] = o[0] + n[0] * c, e[1] = o[1] + n[1] * c, e[2] = o[2] + n[2] * c, e[3] = o[3] + n[3] * c, e;
}
function h1(o, n, c) {
    return c = c || new D(4), c[0] = o[0] - n[0], c[1] = o[1] - n[1], c[2] = o[2] - n[2], c[3] = o[3] - n[3], c;
}
var Fc = h1;
function Pc(o, n) {
    return Math.abs(o[0] - n[0]) < x && Math.abs(o[1] - n[1]) < x && Math.abs(o[2] - n[2]) < x && Math.abs(o[3] - n[3]) < x;
}
function Ec(o, n) {
    return o[0] === n[0] && o[1] === n[1] && o[2] === n[2] && o[3] === n[3];
}
function Xc(o, n, c, e) {
    return e = e || new D(4), e[0] = o[0] + c * (n[0] - o[0]), e[1] = o[1] + c * (n[1] - o[1]), e[2] = o[2] + c * (n[2] - o[2]), e[3] = o[3] + c * (n[3] - o[3]), e;
}
function Yc(o, n, c, e) {
    return e = e || new D(4), e[0] = o[0] + c[0] * (n[0] - o[0]), e[1] = o[1] + c[1] * (n[1] - o[1]), e[2] = o[2] + c[2] * (n[2] - o[2]), e[3] = o[3] + c[3] * (n[3] - o[3]), e;
}
function Zc(o, n, c) {
    return c = c || new D(4), c[0] = Math.max(o[0], n[0]), c[1] = Math.max(o[1], n[1]), c[2] = Math.max(o[2], n[2]), c[3] = Math.max(o[3], n[3]), c;
}
function Ic(o, n, c) {
    return c = c || new D(4), c[0] = Math.min(o[0], n[0]), c[1] = Math.min(o[1], n[1]), c[2] = Math.min(o[2], n[2]), c[3] = Math.min(o[3], n[3]), c;
}
function $1(o, n, c) {
    return c = c || new D(4), c[0] = o[0] * n, c[1] = o[1] * n, c[2] = o[2] * n, c[3] = o[3] * n, c;
}
var Lc = $1;
function Hc(o, n, c) {
    return c = c || new D(4), c[0] = o[0] / n, c[1] = o[1] / n, c[2] = o[2] / n, c[3] = o[3] / n, c;
}
function p1(o, n) {
    return n = n || new D(4), n[0] = 1 / o[0], n[1] = 1 / o[1], n[2] = 1 / o[2], n[3] = 1 / o[3], n;
}
var Cc = p1;
function Uc(o, n) {
    return o[0] * n[0] + o[1] * n[1] + o[2] * n[2] + o[3] * n[3];
}
function w1(o) {
    let n = o[0], c = o[1], e = o[2], r = o[3];
    return Math.sqrt(n * n + c * c + e * e + r * r);
}
var Bc = w1;
function y1(o) {
    let n = o[0], c = o[1], e = o[2], r = o[3];
    return n * n + c * c + e * e + r * r;
}
var Gc = y1;
function x1(o, n) {
    let c = o[0] - n[0], e = o[1] - n[1], r = o[2] - n[2], u = o[3] - n[3];
    return Math.sqrt(c * c + e * e + r * r + u * u);
}
var Jc = x1;
function g1(o, n) {
    let c = o[0] - n[0], e = o[1] - n[1], r = o[2] - n[2], u = o[3] - n[3];
    return c * c + e * e + r * r + u * u;
}
var Kc = g1;
function Nc(o, n) {
    n = n || new D(4);
    let c = o[0], e = o[1], r = o[2], u = o[3], i = Math.sqrt(c * c + e * e + r * r + u * u);
    return i > 1e-5 ? (n[0] = c / i, n[1] = e / i, n[2] = r / i, n[3] = u / i) : (n[0] = 0, n[1] = 0, n[2] = 0, n[3] = 0), n;
}
function Wc(o, n) {
    return n = n || new D(4), n[0] = -o[0], n[1] = -o[1], n[2] = -o[2], n[3] = -o[3], n;
}
function z1(o, n) {
    return n = n || new D(4), n[0] = o[0], n[1] = o[1], n[2] = o[2], n[3] = o[3], n;
}
var Rc = z1;
function q1(o, n, c) {
    return c = c || new D(4), c[0] = o[0] * n[0], c[1] = o[1] * n[1], c[2] = o[2] * n[2], c[3] = o[3] * n[3], c;
}
var kc = q1;
function S1(o, n, c) {
    return c = c || new D(4), c[0] = o[0] / n[0], c[1] = o[1] / n[1], c[2] = o[2] / n[2], c[3] = o[3] / n[3], c;
}
var vc = S1;
function mc(o) {
    return o = o || new D(4), o[0] = 0, o[1] = 0, o[2] = 0, o[3] = 0, o;
}
function bc(o, n, c) {
    c = c || new D(4);
    let e = o[0], r = o[1], u = o[2], i = o[3];
    return c[0] = n[0] * e + n[4] * r + n[8] * u + n[12] * i, c[1] = n[1] * e + n[5] * r + n[9] * u + n[13] * i, c[2] = n[2] * e + n[6] * r + n[10] * u + n[14] * i, c[3] = n[3] * e + n[7] * r + n[11] * u + n[15] * i, c;
}
Object.freeze({
    __proto__: null,
    create: M1,
    setDefaultType: t1,
    fromValues: Ac,
    set: Tc,
    ceil: _c,
    floor: Vc,
    round: Dc,
    clamp: Oc,
    add: jc,
    addScaled: Qc,
    subtract: h1,
    sub: Fc,
    equalsApproximately: Pc,
    equals: Ec,
    lerp: Xc,
    lerpV: Yc,
    max: Zc,
    min: Ic,
    mulScalar: $1,
    scale: Lc,
    divScalar: Hc,
    inverse: p1,
    invert: Cc,
    dot: Uc,
    length: w1,
    len: Bc,
    lengthSq: y1,
    lenSq: Gc,
    distance: x1,
    dist: Jc,
    distanceSq: g1,
    distSq: Kc,
    normalize: Nc,
    negate: Wc,
    copy: z1,
    clone: Rc,
    multiply: q1,
    mul: kc,
    divide: S1,
    div: vc,
    zero: mc,
    transformMat4: bc
});
var Block;
(function(Block) {
    Block[Block["AIR"] = 0] = "AIR";
    Block[Block["STONE"] = 1] = "STONE";
    Block[Block["GLASS"] = 2] = "GLASS";
})(Block || (Block = {}));
const textures = {
    [1]: 0,
    [2]: 1
};
function isOpaque(block) {
    return block === 1;
}
function getTexture(block) {
    return block !== null ? textures[block] ?? null : null;
}
class Uniform {
    #device;
    #buffer;
    #binding;
    constructor(device, binding, size){
        this.#device = device;
        this.#buffer = device.createBuffer({
            label: `uniform @binding(${binding})`,
            size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.#binding = binding;
    }
    get entry() {
        return {
            binding: this.#binding,
            resource: {
                buffer: this.#buffer
            }
        };
    }
    data(data, offset = 0) {
        this.#device.queue.writeBuffer(this.#buffer, offset, data);
    }
}
class Group {
    group;
    uniforms;
    constructor(device, pipeline, groupId, uniforms){
        this.group = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(groupId),
            entries: Object.values(uniforms).map((entry)=>entry instanceof Uniform ? entry.entry : entry)
        });
        this.uniforms = uniforms;
    }
}
var FaceDirection;
(function(FaceDirection) {
    FaceDirection[FaceDirection["BACK"] = 0] = "BACK";
    FaceDirection[FaceDirection["FRONT"] = 1] = "FRONT";
    FaceDirection[FaceDirection["LEFT"] = 2] = "LEFT";
    FaceDirection[FaceDirection["RIGHT"] = 3] = "RIGHT";
    FaceDirection[FaceDirection["BOTTOM"] = 4] = "BOTTOM";
    FaceDirection[FaceDirection["TOP"] = 5] = "TOP";
})(FaceDirection || (FaceDirection = {}));
function showFace(block, neighbor) {
    return block !== neighbor && !isOpaque(neighbor);
}
class Chunk {
    #data = new Uint8Array(32 * 32 * 32);
    position;
    constructor(position){
        this.position = position;
    }
    block(x, y, z, block) {
        if (x < 0 || y < 0 || z < 0 || x >= 32 || y >= 32 || z >= 32) {
            return null;
        }
        const index = (x * 32 + y) * 32 + z;
        if (block !== undefined) {
            this.#data[index] = block;
            return block;
        } else {
            return this.#data[index];
        }
    }
    mesh(device, pipeline) {
        const faces = [];
        for(let x = 0; x < 32; x++){
            for(let y = 0; y < 32; y++){
                for(let z = 0; z < 32; z++){
                    const block = this.block(x, y, z);
                    const texture = getTexture(block);
                    if (block === null || texture === null) {
                        continue;
                    }
                    if (showFace(block, this.block(x - 1, y, z))) {
                        faces.push(x, y, z, 2, texture, 0, 0, 0);
                    }
                    if (showFace(block, this.block(x + 1, y, z))) {
                        faces.push(x, y, z, 3, texture, 0, 0, 0);
                    }
                    if (showFace(block, this.block(x, y - 1, z))) {
                        faces.push(x, y, z, 4, texture, 0, 0, 0);
                    }
                    if (showFace(block, this.block(x, y + 1, z))) {
                        faces.push(x, y, z, 5, texture, 0, 0, 0);
                    }
                    if (showFace(block, this.block(x, y, z - 1))) {
                        faces.push(x, y, z, 0, texture, 0, 0, 0);
                    }
                    if (showFace(block, this.block(x, y, z + 1))) {
                        faces.push(x, y, z, 1, texture, 0, 0, 0);
                    }
                }
            }
        }
        const vertexData = new Uint8Array(faces);
        const vertices = device.createBuffer({
            label: `chunk (${this.position.join(', ')}) vertex buffer vertices`,
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(vertices, 0, vertexData);
        const chunkGroup = new Group(device, pipeline, 1, {
            transform: new Uniform(device, 0, 4 * 4 * 4)
        });
        chunkGroup.uniforms.transform.data(ce.translation(this.position.map((pos)=>pos * 32)));
        return (pass)=>{
            pass.setBindGroup(1, chunkGroup.group);
            pass.setVertexBuffer(0, vertices);
            pass.draw(6, faces.length / 8);
        };
    }
}
async function init(format) {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new TypeError('Failed to obtain WebGPU adapter.');
    }
    const device = await adapter.requestDevice();
    device.lost.then((info)=>{
        console.warn('WebGPU device lost. :(', info.message, info);
    });
    const module = device.createShaderModule({
        label: '😎 shaders 😎',
        code: await fetch('./shader.wgsl').then((r)=>r.text())
    });
    const { messages  } = await module.getCompilationInfo();
    if (messages.some((message)=>message.type === 'error')) {
        console.log(messages);
        throw new SyntaxError('Shader failed to compile.');
    }
    const pipeline = device.createRenderPipeline({
        label: '✨ pipeline ✨',
        layout: 'auto',
        vertex: {
            module,
            entryPoint: 'vertex_main',
            buffers: [
                {
                    arrayStride: 8,
                    stepMode: 'instance',
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: 'uint32x2'
                        }
                    ]
                }
            ]
        },
        fragment: {
            module,
            entryPoint: 'fragment_main',
            targets: [
                {
                    format
                }
            ]
        },
        primitive: {
            cullMode: 'back'
        },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus'
        }
    });
    function generateChunk(position) {
        const chunk = new Chunk(position);
        for(let y = 0; y < 32; y++){
            for(let x = 0; x < 32; x++){
                for(let z = 0; z < 32; z++){
                    if (Math.random() < (32 - y) / 32) {
                        chunk.block(x, y, z, (position[0] + position[2]) % 2 === 0 ? Block.STONE : Block.GLASS);
                    }
                }
            }
        }
        return chunk.mesh(device, pipeline);
    }
    const chunks = [];
    for(let x = -1; x <= 1; x++){
        for(let z = -1; z <= 1; z++){
            chunks.push(generateChunk([
                x,
                0,
                z
            ]));
        }
    }
    const source = await fetch('./textures.png').then((r)=>r.blob()).then((blob)=>createImageBitmap(blob, {
            colorSpaceConversion: 'none'
        }));
    const texture = device.createTexture({
        label: 'texture',
        format: 'rgba8unorm',
        size: [
            source.width,
            source.height
        ],
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    });
    device.queue.copyExternalImageToTexture({
        source,
        flipY: true
    }, {
        texture
    }, {
        width: source.width,
        height: source.height
    });
    const sampler = device.createSampler();
    const common = new Group(device, pipeline, 0, {
        perspective: new Uniform(device, 0, 4 * 4 * 4),
        camera: new Uniform(device, 1, 4 * 4 * 4),
        sampler: {
            binding: 2,
            resource: sampler
        },
        texture: {
            binding: 3,
            resource: texture.createView()
        },
        textureSize: new Uniform(device, 4, 4 * 2)
    });
    common.uniforms.textureSize.data(new Float32Array([
        source.width / 16,
        source.height / 16
    ]));
    let depthTexture = null;
    return {
        device,
        render: (canvasTexture, cameraTransform)=>{
            common.uniforms.perspective.data(new Float32Array(ce.perspective(Math.PI / 2, canvasTexture.width / canvasTexture.height, 0.1, 1000)));
            common.uniforms.camera.data(new Float32Array(cameraTransform));
            if (depthTexture?.width !== canvasTexture.width || depthTexture.height !== canvasTexture.height) {
                depthTexture?.destroy();
                depthTexture = device.createTexture({
                    size: [
                        canvasTexture.width,
                        canvasTexture.height
                    ],
                    format: 'depth24plus',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT
                });
            }
            const encoder = device.createCommandEncoder({
                label: 'Xx encoder xX '
            });
            const pass = encoder.beginRenderPass({
                label: 'Xx render pass xX',
                colorAttachments: [
                    {
                        view: canvasTexture.createView(),
                        clearValue: [
                            0.75,
                            0.85,
                            1,
                            1
                        ],
                        loadOp: 'clear',
                        storeOp: 'store'
                    }
                ],
                depthStencilAttachment: {
                    view: depthTexture.createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store'
                }
            });
            pass.setPipeline(pipeline);
            pass.setBindGroup(0, common.group);
            for (const chunk of chunks){
                chunk(pass);
            }
            pass.end();
            device.queue.submit([
                encoder.finish()
            ]);
        }
    };
}
function fail(error) {
    throw error;
}
const canvas = document.getElementById('canvas');
if (!(canvas instanceof HTMLCanvasElement)) {
    throw new TypeError('Failed to find the canvas element.');
}
const context = canvas.getContext('webgpu') ?? fail(new TypeError('Failed to get WebGPU canvas context.'));
if (!navigator.gpu) {
    throw new TypeError('Client does not support WebGPU. Sad!');
}
const format = navigator.gpu.getPreferredCanvasFormat();
const { device , render  } = await init(format);
context.configure({
    device,
    format
});
let aspectRatio = null;
new ResizeObserver(([{ contentBoxSize  }])=>{
    const [{ blockSize , inlineSize  }] = contentBoxSize;
    canvas.width = inlineSize;
    canvas.height = blockSize;
    aspectRatio = inlineSize / blockSize;
}).observe(canvas);
const keys = {};
document.addEventListener('keydown', (e)=>{
    if (e.target !== document && e.target !== document.body) {
        return;
    }
    keys[e.key.toLowerCase()] = true;
    if (document.pointerLockElement === canvas) {
        e.preventDefault();
    }
});
document.addEventListener('keyup', (e)=>{
    keys[e.key.toLowerCase()] = false;
});
canvas.addEventListener('click', ()=>{
    canvas.requestPointerLock();
});
canvas.addEventListener('mousemove', (e)=>{
    if (document.pointerLockElement !== canvas) {
        return;
    }
    player.yaw += e.movementX / 500;
    player.pitch += e.movementY / 500;
});
const MOVE_ACCEL = 50;
const FRICTION_COEFF = -5;
const player = {
    x: 0,
    xv: 0,
    y: 32 + 1.5,
    yv: 0,
    z: 16,
    zv: 0,
    yaw: 0,
    pitch: 0,
    roll: 0
};
function moveAxis(axis, acceleration, time, userMoving) {
    let endVel = player[`${axis}v`] + acceleration * time;
    if (!userMoving && Math.sign(player[`${axis}v`]) !== Math.sign(endVel)) {
        endVel = 0;
    }
    player[axis] += (player[`${axis}v`] + endVel) / 2 * time;
    player[`${axis}v`] = endVel;
}
let lastTime = Date.now();
function paint() {
    const now = Date.now();
    const elapsed = Math.min(now - lastTime, 100) / 1000;
    lastTime = now;
    const velocity = new Vector2(player.xv, player.zv);
    const acceleration = velocity.lengthSquared > 0 ? velocity.scale(FRICTION_COEFF) : new Vector2();
    const direction = new Vector2(0, 0);
    if (keys.a || keys.arrowleft) {
        direction.add({
            x: -1
        });
    }
    if (keys.d || keys.arrowright) {
        direction.add({
            x: 1
        });
    }
    if (keys.w || keys.arrowup) {
        direction.add({
            y: -1
        });
    }
    if (keys.s || keys.arrowdown) {
        direction.add({
            y: 1
        });
    }
    const moving = direction.lengthSquared > 0;
    if (moving) {
        acceleration.add(direction.unit().scale(50).rotate(player.yaw));
    }
    let yAccel = player.yv * FRICTION_COEFF;
    if (keys[' ']) {
        yAccel += MOVE_ACCEL;
    }
    if (keys.shift) {
        yAccel -= MOVE_ACCEL;
    }
    moveAxis('x', acceleration.x, elapsed, moving);
    moveAxis('z', acceleration.y, elapsed, moving);
    moveAxis('y', yAccel, elapsed, keys[' '] || keys.shift);
    if (aspectRatio) {
        render(context.getCurrentTexture(), ce.translate(ce.rotateY(ce.rotateX(ce.rotationZ(player.roll), player.pitch), player.yaw), [
            -player.x,
            -player.y,
            -player.z
        ]));
    }
    requestAnimationFrame(paint);
}
paint();
