/// <reference path="../typings/index.d.ts" />

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
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
        physicsMaterial,
        0.0, // 摩擦系数:设置没有效果
        0.3 // 补偿
    );
    physicsContactMaterial.friction = 0.6;
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
    sphereBody.position.set(-20, 1, 20);
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