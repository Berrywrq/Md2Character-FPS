/// <reference path="./initThree.js" />

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
        var obj = this; //保存对象引用
        this.ratamahatta.character.onLoadComplete = function () {

            obj.ratamahatta.character.root.position.set(obj.x, obj.y, obj.z);
            scene.add(obj.ratamahatta.character.root);

            obj.ratamahattaBody.addShape(ratamahattaShape);
            world.addBody(obj.ratamahattaBody);
            obj.ratamahattaBody.position.set(obj.x, obj.y, obj.z);
            obj.ratamahattaBody.addEventListener("collide", function (e) {
                if (e.body.shapes[0].id == ballShape.id) {
                    obj.ratamahatta.setAnimationName("crdeath");
                }
            });

            //初始动画
            obj.ratamahatta.setAnimationName("stand");
            obj.ratamahatta.setWeaponName("w_shotgun");
        };
    };
};

var ratamahattas = [];
function createRatamahatta() {
    var x, y, z;
    do {
        x = (Math.random() - 0.5) * 30;
        y = 0.48;
        z = (Math.random() - 0.5) * 30;
    }
    while (!checkBoxCollide(x, z, boxCenterPoints));//检测碰撞
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