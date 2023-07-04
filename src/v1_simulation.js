var v1 = new GridSimulation("v1Canvas", [0, 0], [19, 19], 500, 20, 30, 50, 100, 100, 5, 0.08);

v1.canvas.addEventListener("mousedown", function (e) {
    var pos = getCursorPosition(v1.canvas, e)
    pos = pxToGrid(pos[0], pos[1], v1.scale)
    v1.toggleWall(pos[0], pos[1])
});

const v1_updateFps = (fps) => v1.fps = Number(fps);
const v1_updateTicks = (ticks) => v1.ticks = Number(ticks);
const v1_updateGenerations = (generations) => v1.generations = Number(generations);
const v1_updateAgentsPerGen = (agentsPerGen) => v1.agentsPerGen = Number(agentsPerGen);
const v1_updateSurvivedPerGen = (survivedPerGen) => v1.survivedPerGen = Number(survivedPerGen);
const v1_updateMutationChance = (mutationChance) => v1.mutationChance = Number(mutationChance);
const v1_updateStartX = (startX) => v1.start.x = Number(startX);
const v1_updateStartY = (startY) => v1.start.y = Number(startY);
const v1_updateEndX = (endX) => v1.end.x = Number(endX);
const v1_updateEndY = (endY) => v1.end.y = Number(endY);

v1.startId = "v1_start"
v1.stopId = "v1_stop"
v1.genId = "v1_gen"

var v1_start = () => v1.startSimulation();
var v1_stop = () => v1.stopSimulation();

window.requestAnimationFrame(() => v1.loopHandler());