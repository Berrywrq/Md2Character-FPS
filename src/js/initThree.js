/// <reference path="./initCannon.js" />

var camera, scene, renderer;
var geometry, material, mesh;
var controls, time = Date.now();
var boxCenterPoints = []; //已加入场景的中心圆点位置

var clock = new THREE.Clock();

//检测盒子位置是否合理
function checkBoxCollide(x, z, boxCenterPoints) {
    var pTemp;
    //计算这个点到所有点的距离是否<=2
    for (var k = 0; k < boxCenterPoints.length; k++) {
        pTemp = boxCenterPoints[k];
        if (Math.pow(Math.pow(x - pTemp.X, 2) + Math.pow(z - pTemp.Z, 2), 0.5) <= 3.6) {
            return false;
        }
    }
    return true;
}

function initThree() {

    camera = new THREE.PerspectiveCamera(70
        , window.innerWidth / window.innerHeight, 0.1, 1000);

    scene = new THREE.Scene();

    //设置光照
    var ambient = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambient);

    light = new THREE.SpotLight(0xffffff);
    light.position.set(10, 30, 20);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    scene.add(light);

    //设置鼠标无限滚动的控制方式
    controls = new PointerLockControls(camera, sphereBody);
    scene.add(controls.getObject());//将相机包装器加入场景

    //地板
    geometry = new THREE.PlaneGeometry(300, 300, 50, 50);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    material = new THREE.MeshLambertMaterial({
        color: 0xeeee00
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    //渲染器
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    // 添加盒子
    var halfExtents = new CANNON.Vec3(1, 1, 1);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    for (var i = 0; i < 100; i++) {
        var x = (Math.random() - 0.5) * 30;
        var y = 1;
        var z = (Math.random() - 0.5) * 30;
        //检测碰撞
        if (checkBoxCollide(x, z, boxCenterPoints)) {

            var boxBody = new CANNON.Body({
                mass: 1000,
                material: physicsMaterial
            });
            boxBody.addShape(boxShape);

            var randomColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
            material = new THREE.MeshLambertMaterial({
                color: randomColor
            });
            var boxMesh = new THREE.Mesh(boxGeometry, material);
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            scene.add(boxMesh);
            boxMeshes.push(boxMesh);

            world.add(boxBody);
            boxes.push(boxBody);

            boxBody.position.set(x, y, z);
            boxMesh.position.set(x, y, z);

            boxCenterPoints.push({ X: x, Z: z });
        }

    }
    cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
}
