/// <reference path="../typings/index.d.ts" />
/// <reference path="./libs/threex/threex.md2character.js" />
/// <reference path="./libs/threex/threex.md2characterratmahatta.js" />

var clock = new THREE.Clock();

//--------------------初始化物理引擎-----------------------
var sphereShape, sphereBody, world, physicsMaterial, walls = [],
    balls = [],
    ballMeshes = [],
    boxes = [],
    boxMeshes = [];

function initCannon() {
    // 创建游戏世界
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if (split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    //设置重力
    world.gravity.set(0, -100, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // 创建一个光滑的材质
    physicsMaterial = new CANNON.Material("physicsMaterial");
    // physicsMaterial.friction=1.0;
    // physicsMaterial.restitution=0.3;
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
        physicsMaterial,
        0.0, // 摩擦系数:设置没有效果
        0.3 // 补偿
    );
    // physicsContactMaterial.friction=1.0;
    // 添加到世界中
    world.addContactMaterial(physicsContactMaterial);

    // 创建一个球体(人物)
    var mass = 5,
        radius = 0.5;
    sphereShape = new CANNON.Sphere(radius);
    sphereBody = new CANNON.Body({
        mass: mass,
        material: physicsMaterial
    });
    sphereBody.addShape(sphereShape);
    sphereBody.position.set(-8, 6, 8);
    sphereBody.linearDamping = 0.9;
    world.add(sphereBody);

    // 创建游戏支撑平台
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({
        mass: 0,
        material: physicsMaterial
    });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.add(groundBody);
}
//---------------------------------------------------



//-------------------------three.js初始化---------------------
var camera, scene, renderer;
var geometry, material, mesh;
var controls, time = Date.now();
var boxCenterPoints = []; //已加入场景的中心圆点位置

//检测位置是否合理
function checkBoxCollide(x, z, boxCenterPoints) {
    var pTemp;
    //计算这个点到所有点的距离是否<=2
    for (var k = 0; k < boxCenterPoints.length; k++) {
        pTemp = boxCenterPoints[k];
        if (Math.pow(Math.pow(x - pTemp.X, 2) + Math.pow(z - pTemp.Z, 2), 0.5) <= 3) {
            return false;
        }
    }
    return true;
}
function init() {

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 0, 500);

    var ambient = new THREE.AmbientLight(0x111111);
    scene.add(ambient);

    light = new THREE.SpotLight(0xffffff);
    light.position.set(10, 30, 20);
    light.target.position.set(0, 0, 0);
    if (true) {
        light.castShadow = true;

        light.shadow.camera.near = 20;
        light.shadow.camera.far = 50; //camera.far;
        light.shadow.camera.fov = 40;

        light.shadowMapBias = 0.1;
        light.shadowMapDarkness = 0.7;
        light.shadow.mapSize.width = 2 * 512;
        light.shadow.mapSize.height = 2 * 512;

        //light.shadowCameraVisible = true;
    }
    scene.add(light);



    controls = new PointerLockControls(camera, sphereBody);
    scene.add(controls.getObject());

    // 地板
    geometry = new THREE.PlaneGeometry(300, 300, 50, 50);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    material = new THREE.MeshLambertMaterial({
        color: 0xeeee00
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 1);

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    // 添加盒子
    var halfExtents = new CANNON.Vec3(1, 1, 1);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    for (var i = 0; i < 100; i++) {
        var x = (Math.random() - 0.5) * 30;
        //var y = 1 + (Math.random() - 0.5) * 1;
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
            material2 = new THREE.MeshLambertMaterial({
                color: randomColor
            });
            var boxMesh = new THREE.Mesh(boxGeometry, material2);
            world.add(boxBody);
            scene.add(boxMesh);
            boxBody.position.set(x, y, z);
            boxMesh.position.set(x, y, z);
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            boxes.push(boxBody);
            boxMeshes.push(boxMesh);

            boxCenterPoints.push({ X: x, Z: z });
        }

    }
    cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

var dt = 1 / 500;   //游戏world的step值
var tempQuaternion = new THREE.Quaternion();
function disappear(o) {
    return function () {
        scene.remove(o.ratamahatta.character.root);
    }
};
function animate() {
    requestAnimationFrame(animate);
    if (controls.enabled) {
        world.step(dt);

        // 更新球体位置
        for (var i = 0; i < balls.length; i++) {
            ballMeshes[i].position.copy(balls[i].position);
            ballMeshes[i].quaternion.copy(balls[i].quaternion);
        }

        // 更新盒子位置
        for (i = 0; i < boxes.length; i++) {
            boxMeshes[i].position.copy(boxes[i].position);
            boxMeshes[i].quaternion.copy(boxes[i].quaternion);
        }

        //更新敌人
        var ratamahattaObj;
        var needPopObjs = [];
        var delta = clock.getDelta();
        for (i = 0; i < ratamahattas.length; i++) {
            ratamahattaObj = ratamahattas[i];
            if (ratamahattaObj.ratamahatta.character.activeClipName != "crdeath") {
                ratamahattaObj.ratamahatta.character.update(delta);
                ratamahattaObj.ratamahatta.character.root.position.copy(ratamahattaObj.ratamahattaBody.position);
                ratamahattaObj.ratamahatta.character.root.quaternion.copy(ratamahattaObj.ratamahattaBody.quaternion);
            }
            else {
                //敌人已死
                if (ratamahattaObj.ratamahatta.character.meshBody.activeAction.time < 0.25) {
                    ratamahattaObj.ratamahatta.character.update(delta);
                }
                else {
                    world.removeBody(ratamahattaObj.ratamahattaBody);
                    //一定时间后消失
                    setTimeout(disappear(ratamahattaObj), 1000);
                    needPopObjs.push(ratamahattaObj);
                    currEnemyCount++;
                    $("#killed").text(currEnemyCount);
                }
            }
        }

        for (i = 0; i < needPopObjs.length; i++) {
            _.remove(ratamahattas, function (n) {
                return n.ratamahatta.character.root.uuid === needPopObjs[i].ratamahatta.character.root.uuid;
            });
        }
    }

    controls.update(Date.now() - time);
    //cannonDebugRenderer.update();
    renderer.render(scene, camera);
    time = Date.now();

}
//-----------------------------------------------------------



//--------------------初始化dom与游戏交互--------------------
var blocker = document.getElementById('blocker');
var target = document.getElementById('shootTarget');
target.style.top = (window.innerHeight / 2 - 18) + "px";
target.style.left = (window.innerWidth / 2 - 18) + "px";
target.style.display = "none";
var instructions = document.getElementById('instructions');

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if (havePointerLock) {

    var element = document.body;

    var pointerlockchange = function (event) {

        if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

            controls.enabled = true;

            blocker.style.display = 'none';
            target.style.display = 'block';
        } else {

            controls.enabled = false;

            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';

            instructions.style.display = '';
            target.style.display = 'none';
        }

    }

    var pointerlockerror = function (event) {
        instructions.style.display = '';
    }

    // 注册键盘鼠标事件
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

    document.addEventListener('pointerlockerror', pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

    instructions.addEventListener('click', function (event) {
        instructions.style.display = 'none';

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

        if (/Firefox/i.test(navigator.userAgent)) {

            var fullscreenchange = function (event) {

                if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

                    document.removeEventListener('fullscreenchange', fullscreenchange);
                    document.removeEventListener('mozfullscreenchange', fullscreenchange);

                    element.requestPointerLock();
                }

            }

            document.addEventListener('fullscreenchange', fullscreenchange, false);
            document.addEventListener('mozfullscreenchange', fullscreenchange, false);

            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

            element.requestFullscreen();

        } else {

            element.requestPointerLock();

        }

    }, false);

} else {

    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

var PointerLockControls = function (camera, cannonBody) {

    var eyeYPos = 2; // eyes are 2 meters above the ground
    var velocityFactor = 0.1;//移动速度
    var jumpVelocity = 20;//跳跃起跳速度
    var scope = this;

    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    var yawObject = new THREE.Object3D();
    yawObject.position.y = 2;
    yawObject.add(pitchObject);

    var quat = new THREE.Quaternion();

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;

    var canJump = false;


    var contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
    var upAxis = new CANNON.Vec3(0, 1, 0);
    cannonBody.addEventListener("collide", function (e) {
        var contact = e.contact;

        // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
        // We do not yet know which one is which! Let's check.
        if (contact.bi.id == cannonBody.id) // bi is the player body, flip the contact normal
            contact.ni.negate(contactNormal);
        else
            contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is

        // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
        if (contactNormal.dot(upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
            canJump = true;
    });

    var velocity = cannonBody.velocity;

    var PI_2 = Math.PI / 2;

    var onMouseMove = function (event) {

        if (scope.enabled === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    };

    var onKeyDown = function (event) {
        //cannonBody.velocity=velocity;
        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                if (canJump === true) {
                    velocity.y = jumpVelocity;
                }
                canJump = false;
                break;
            case 16: //shift
                velocityFactor = 0.4;
        }

    };

    var onKeyUp = function (event) {

        function checkAndSetStatic() {
            if (canJump === true) {//在地面
                cannonBody.velocity.x = 0;
                cannonBody.velocity.z = 0;
                console.log("static")
            }
        }
        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                checkAndSetStatic();
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                checkAndSetStatic();
                break;
            case 40: // down
            case 83: // a
                moveBackward = false;
                checkAndSetStatic();

                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                checkAndSetStatic();
                break;
            case 16: //shift
                velocityFactor = 0.1;
        }
    };

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    this.enabled = false;

    this.getObject = function () {
        return yawObject;
    };

    this.getDirection = function (targetVec) {
        targetVec.set(0, 0, -1);
        quat.multiplyVector3(targetVec);
    }

    // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
    var inputVelocity = new THREE.Vector3();
    var euler = new THREE.Euler();
    this.update = function (delta) {

        if (scope.enabled === false) return;

        //delta *= 0.1;//加速运动
        delta = 1;

        inputVelocity.set(0, 0, 0);

        if (moveForward) {
            inputVelocity.z = -velocityFactor * delta;
        }
        if (moveBackward) {
            inputVelocity.z = velocityFactor * delta;
        }

        if (moveLeft) {
            inputVelocity.x = -velocityFactor * delta;
        }
        if (moveRight) {
            inputVelocity.x = velocityFactor * delta;
        }

        // Convert velocity to world coordinates
        euler.x = pitchObject.rotation.x;
        euler.y = yawObject.rotation.y;
        euler.order = "XYZ";
        quat.setFromEuler(euler);
        inputVelocity.applyQuaternion(quat);
        //quat.multiplyVector3(inputVelocity);

        // Add to the object
        velocity.x += inputVelocity.x;
        velocity.z += inputVelocity.z;

        yawObject.position.copy(cannonBody.position);
    };
};
//-----------------------------------------------------



//-------------------初始化子弹-------------------------

var ballShape = new CANNON.Sphere(0.01);
var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 8, 8);
// var halfExtents = new CANNON.Vec3(1, 1, 1);
// var ballShape = new CANNON.Box(halfExtents);
// var ballGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
var shootDirection = new THREE.Vector3();
var shootVelo = 300;//子弹速度
var projector = new THREE.Projector();

//获取射击方向
function getShootDir(targetVec) {
    var vector = targetVec;
    targetVec.set(0, 0, 1);
    vector.unproject(camera);
    var ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize());
    targetVec.copy(ray.direction);
}

var shooting = false;
var shootTimeSpan = 100;//ms为单位
var shootInterval;
//射击事件监听
window.addEventListener("mousedown", function (e) {
    shooting = true;
    console.log("mousedown");
    shootInterval = setInterval(function () {
        if (controls.enabled == true) {
            var x = sphereBody.position.x;
            var y = sphereBody.position.y;
            var z = sphereBody.position.z;
            var ballBody = new CANNON.Body({
                mass: 0.1   //子弹质量
            });
            ballBody.addShape(ballShape);
            var randomColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
            material2 = new THREE.MeshPhongMaterial({
                color: randomColor
            });
            var ballMesh = new THREE.Mesh(ballGeometry, material2);
            world.add(ballBody);
            scene.add(ballMesh);
            ballMesh.castShadow = true;
            ballMesh.receiveShadow = true;
            balls.push(ballBody);
            ballMeshes.push(ballMesh);
            getShootDir(shootDirection);
            ballBody.velocity.set(shootDirection.x * shootVelo,
                shootDirection.y * shootVelo,
                shootDirection.z * shootVelo);

            // Move the ball outside the player sphere
            x += shootDirection.x * (sphereShape.radius * 1.02 + ballShape.radius);
            y += shootDirection.y * (sphereShape.radius * 1.02 + ballShape.radius);
            z += shootDirection.z * (sphereShape.radius * 1.02 + ballShape.radius);
            ballBody.position.set(x, y, z);
            ballMesh.position.set(x, y, z);
        }
    }, shootTimeSpan);
});

window.addEventListener("mouseup", function (e) {
    if (shooting) {
        shooting = false;
        clearInterval(shootInterval);
    }
    console.log("mouseup");
});

//-------------------------------------------------------


//------------------------生成敌人---------------------------
var enemyCount = 10;
var currEnemyCount = 0;
var ratamahattaShape = new CANNON.Box(new CANNON.Vec3(0.2, 0.5, 0.2));
function Ratamahatta(x, y, z) {
    this.ratamahatta = new THREEx.MD2CharacterRatmahatta();
    this.ratamahattaBody = new CANNON.Body({ mass: 1000 });
    this.x = x;
    this.y = y;
    this.z = z;
    this.init = function () {
        this.ratamahatta.character.scale = 0.02;
        this.ratamahatta.character.onLoadComplete = function (obj) {
            obj.ratamahatta.character.root.position.set(obj.x, obj.y, obj.z);
            scene.add(obj.ratamahatta.character.root);
            return function () {
                // var verts = [], faces = [], temp;
                // for (var i = 0; i < ratamahatta.character.meshBody.geometry.vertices.length; i++) {
                //     temp = ratamahatta.character.meshBody.geometry.vertices[i];
                //     verts.push(new CANNON.Vec3(-temp.z * 0.02, temp.y * 0.02, temp.x * 0.02));
                // }
                // for (var i = 0; i < ratamahatta.character.meshBody.geometry.faces.length; i++) {
                //     temp = ratamahatta.character.meshBody.geometry.faces[i];
                //     faces.push([temp.a, temp.b, temp.c]);
                // }
                // ratamahattaShape = new CANNON.ConvexPolyhedron(verts, faces);
                obj.ratamahattaBody.addShape(ratamahattaShape);
                world.addBody(obj.ratamahattaBody);
                obj.ratamahattaBody.position.set(obj.x, obj.y, obj.z);
                obj.ratamahattaBody.addEventListener("collide", function (e) {
                    if (e.body.shapes[0].id == ballShape.id) {
                        obj.ratamahatta.setAnimationName("crdeath");

                        //world.removeBody(e.body);
                    }
                });
                obj.ratamahatta.setAnimationName("run");
                obj.ratamahatta.setWeaponName("w_shotgun");
                console.log("ratamahattaBody was added");
            };
        }(this);
    };
};
var ratamahattas = [];
function createRatamahatta() {
    var x, y, z;
    do {
        x = (Math.random() - 0.5) * 30;
        //var y = 1 + (Math.random() - 0.5) * 1;
        y = 0.48;
        z = (Math.random() - 0.5) * 30;
        //检测碰撞
    }
    while (!checkBoxCollide(x, z, boxCenterPoints));
    var obj = new Ratamahatta(x, y, z);
    obj.init();
    return obj;
}
function initEnemy() {
    for (var j = 0; j < enemyCount; j++) {
        ratamahattas.push(createRatamahatta());
    }
    $("#total").text(enemyCount);
}
//----------------------------------------------------------

initCannon();
init();
animate();
initEnemy();
console.log("complete");
