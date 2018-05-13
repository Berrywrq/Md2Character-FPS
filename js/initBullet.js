/// <reference path="./initThree.js" />

var ballShape = new CANNON.Sphere(0.01);
var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 8, 8);
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
            material = new THREE.MeshPhongMaterial({
                color: randomColor
            });

            var ballMesh = new THREE.Mesh(ballGeometry, material);
            ballMesh.castShadow = false;
            ballMesh.receiveShadow = false;
            scene.add(ballMesh);

            world.add(ballBody);
            balls.push(ballBody);
            ballMeshes.push(ballMesh);
            getShootDir(shootDirection);
            ballBody.velocity.set(shootDirection.x * shootVelo,
                shootDirection.y * shootVelo,
                shootDirection.z * shootVelo);

            //将子弹移出人物球体
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