/// <reference path="../typings/index.d.ts" />
/// <reference path="./initDomControls.js" />

var dt = 1 / 500;   //游戏world的step值
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
                world.removeBody(ratamahattaObj.ratamahattaBody);
                if (ratamahattaObj.ratamahatta.character.meshBody.activeAction.time < 0.25) {
                    ratamahattaObj.ratamahatta.character.update(delta);
                }
                else {  //死亡动画已完成
                    //一定时间后消失
                    var o = ratamahattaObj;
                    setTimeout(function () {
                        scene.remove(o.ratamahatta.character.root);
                    }, 1000);
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