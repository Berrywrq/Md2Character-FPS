/// <reference path="./initThree.js" />

var enemyCount = 10;//敌人数目
var currEnemyCount = 0;
var ratamahattaShape = new CANNON.Box(new CANNON.Vec3(0.2, 0.5, 0.2));
function Ratamahatta(x, y, z) {
    this.ratamahatta = new THREEx.MD2CharacterRatmahatta();
    this.ratamahattaBody = new CANNON.Body({ mass: 1000 });//敌人模型
    this.x = x;this.y = y;this.z = z;
    this.init = function () {
        this.ratamahatta.character.scale = 0.02;
        var obj = this; //保存对象引用
        this.ratamahatta.character.onLoadComplete = function () {

            obj.ratamahatta.character.root.position.set(obj.x, obj.y, obj.z);
            scene.add(obj.ratamahatta.character.root);

            obj.ratamahattaBody.addShape(ratamahattaShape);
            world.addBody(obj.ratamahattaBody);
            obj.ratamahattaBody.position.set(obj.x, obj.y, obj.z);
            //注册子弹碰撞事件
            obj.ratamahattaBody.addEventListener("collide", function (e) {
                if (e.body.shapes[0].id == ballShape.id) {
                    //被子弹射中，启动死亡动画
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
    //查找合适的位置生产敌人
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