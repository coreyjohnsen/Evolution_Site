var nn = new NNSimulation("nnCanvas", [0, 0], [19, 19], 500, 20, 30, 50, 100, 100, 5, 0.08, [12, 32, 16, 4]);

nn.canvas.addEventListener("mousedown", function (e) {
    var pos = getCursorPosition(nn.canvas, e)
    pos = pxToGrid(pos[0], pos[1], nn.scale)
    nn.toggleWall(pos[0], pos[1])
});

const nn_updateFps = (fps) => nn.fps = Number(fps);
const nn_updateTicks = (ticks) => nn.ticks = Number(ticks);
const nn_updateGenerations = (generations) => nn.generations = Number(generations);
const nn_updateAgentsPerGen = (agentsPerGen) => nn.agentsPerGen = Number(agentsPerGen);
const nn_updateSurvivedPerGen = (survivedPerGen) => nn.survivedPerGen = Number(survivedPerGen);
const nn_updateMutationChance = (mutationChance) => nn.mutationChance = Number(mutationChance);
const nn_updateStartX = (startX) => nn.start.x = Number(startX);
const nn_updateStartY = (startY) => nn.start.y = Number(startY);
const nn_updateEndX = (endX) => nn.end.x = Number(endX);
const nn_updateEndY = (endY) => nn.end.y = Number(endY);
const nn_updateHidden = (hidden) => {
    var hidden = hidden.split(',');
    hidden = hidden.map(s => Number(s) <= 0 ? '1' : s).map(s => Number(s.trim()));
    var layers = [12];
    layers = layers.concat(hidden);
    layers = layers.concat(4);
    nn.genomeLayers = layers;
}

nn.startId = "nn_start"
nn.stopId = "nn_stop"
nn.genId = "nn_gen"

var nn_start = () => nn.startSimulation();
var nn_stop = () => nn.stopSimulation();

window.requestAnimationFrame(() => nn.loopHandler());