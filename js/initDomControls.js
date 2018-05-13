/// <reference path="../typings/index.d.ts" />
/// <reference path="./initBullet.js" />
/// <reference path="./initEnemy.js" />


var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
//准心
var target = document.getElementById('shootTarget');
target.style.top = (window.innerHeight / 2 - 18) + "px";
target.style.left = (window.innerWidth / 2 - 18) + "px";
target.style.display = "none";

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

            instructions.style.display = '';//继承自父元素
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

        // 请求鼠标锁定，鼠标无限滚动
        element.requestPointerLock();

    }, false);

} else {

    instructions.innerHTML = '浏览器不支持鼠标无限滚动';

}

/**注册鼠标无限滚动状态下的用户交互
 * 
 * @param {THREE.Camera} camera 相机
 * @param {Body} cannonBody 人物body
 */
var PointerLockControls = function (camera, cannonBody) {

    var velocityFactor = 0.1;//移动速度
    var jumpVelocity = 20;//跳跃起跳速度
    var scope = this;//保存作用域

    var pitchObject = new THREE.Object3D();//俯仰对象
    pitchObject.add(camera);
    var yawObject = new THREE.Object3D();//偏航对象
    yawObject.position.y = 2;   //初始化高度
    yawObject.add(pitchObject);

    //跳跃状态
    var canJump = false;//是否处于可跳跃状态
    var contactNormal = new CANNON.Vec3(); //人物受力方向，从人物body指向外为正
    var upAxis = new CANNON.Vec3(0, 1, 0);
    cannonBody.addEventListener("collide", function (e) {
        var contact = e.contact;
        console.log(contact);

        if (contact.bi.id == cannonBody.id) // 人物主动碰撞，受力方向与碰撞法线相反
            contact.ni.negate(contactNormal);//翻转法线
        else
            contactNormal.copy(contact.ni); // 人物被动碰撞，受力方向与碰撞法线相同

        var threshold = 0.5;
        if (contactNormal.dot(upAxis) > threshold)//判断y轴受力情况，设置一个阈值，表示人物在此点可以跳跃
            canJump = true;
    });

    //鼠标和键盘事件
    var PI_2 = Math.PI / 2;
    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var onMouseMove = function (event) {

        if (scope.enabled === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));//俯仰角允许的范围是 [-pi/2,pi/2]
    };
    var onKeyDown = function (event) {
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
                    cannonBody.velocity.y = jumpVelocity;
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

    this.enabled = false;//鼠标移动控制是否可用

    this.getObject = function () {//获取表示人物观察方向的对象
        return yawObject;
    };

    var deltaVelocity = new THREE.Vector3();//速度的改变值
    var euler = new THREE.Euler();//欧拉角
    this.update = function (delta) {//更新人物速度

        if (scope.enabled === false) return;

        //delta *= 0.1;//加速运动
        delta = 1;

        deltaVelocity.set(0, 0, 0);
        if (moveForward) {
            deltaVelocity.z = -velocityFactor * delta;
        }
        if (moveBackward) {
            deltaVelocity.z = velocityFactor * delta;
        }

        if (moveLeft) {
            deltaVelocity.x = -velocityFactor * delta;
        }
        if (moveRight) {
            deltaVelocity.x = velocityFactor * delta;
        }

        //将人物坐标系中的速度增量变换到世界坐标系
        euler.x = pitchObject.rotation.x;
        euler.y = yawObject.rotation.y;
        euler.order = "XYZ";
        deltaVelocity.applyEuler(euler);//运动方向对准

        cannonBody.velocity.x += deltaVelocity.x;
        cannonBody.velocity.z += deltaVelocity.z;

        yawObject.position.copy(cannonBody.position);
    };
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    target.style.top = (window.innerHeight / 2 - 18) + "px";
    target.style.left = (window.innerWidth / 2 - 18) + "px";
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
