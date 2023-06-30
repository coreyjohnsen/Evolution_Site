// get and setup canvas2
var canvas2 = document.getElementById("canvas2");
canvas2.addEventListener('mousedown', function (e) {
    var pos = getCursorPosition(canvas2, e)
    pos = pxToGrid(pos[0], pos[1], scale)
    toggleZoneWall(pos[0], pos[1])
})
var zone_ctx = canvas2.getContext("2d");

var survive_space = {
    x1: 14,
    y1: 0,
    w: 7,
    h: 20
}

// configurable
var zone_fps = 30;
var zone_ticks = 100;
var zone_generations = 150;
var agents_per_zone_gen = 50;
var survived_per_zone_gen = 5;
var zone_mutation_chance = 0.1;

var zone_curr_tick = 0;
var zone_running = false;
var zone_curr_gen = 0;


zone_agents = []
survived_zone = []

function initZoneValues() {
    zone_fps = Number(document.getElementById("fpsValue_zone").innerText);
    zone_ticks = Number(document.getElementById("tickValue_zone").innerText);
    zone_generations = Number(document.getElementById("generationsValue_zone").innerText);
    agents_per_zone_gen = Number(document.getElementById("agentsValue_zone").innerText);
    survived_per_zone_gen = Number(document.getElementById("keptValue_zone").innerText);
    zone_mutation_chance = Number(document.getElementById("mutationValue_zone").innerText);
}

function startZoneSimulation() {
    initZoneValues();
    zone_running = true;
    zone_curr_gen = 0;
    zone_curr_tick = 0;
    zone_agents = get_random_agents(agents_per_zone_gen);
    button = document.getElementById("start2")
    button.disabled = true;
    stopButton = document.getElementById("stop2")
    stopButton.disabled = false;
    window.requestAnimationFrame(zoneLoopHandler);
}

function stopZoneSimulation() {
    zone_running = false;
    button = document.getElementById("start2")
    button.disabled = false;
    stopButton = document.getElementById("stop2")
    stopButton.disabled = true;
}

const zoned_grid = []
for (let i = 0; i < grid_count; i++) {
    let temp = []
    for (let i = 0; i < grid_count; i++) {
        temp.push(0)
    }
    zoned_grid.push(temp)
}

function zoneSimClear() {
    var style = zone_ctx.fillStyle
    zone_ctx.fillStyle = 'white';
    zone_ctx.fillRect(0, 0, 500, 500)
    zone_ctx.fillStyle = style
}

function drawZoneGrid() {
    zone_ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < grid_count; i++) {
        zone_ctx.beginPath();
        zone_ctx.moveTo(0, i * scale);
        zone_ctx.lineTo(size, i * scale);
        zone_ctx.stroke();
    }
    for (let i = 0; i < grid_count; i++) {
        zone_ctx.beginPath();
        zone_ctx.moveTo(i * scale, 0);
        zone_ctx.lineTo(i * scale, size);
        zone_ctx.stroke();
    }
}

function drawZoneWalls() {
    var style = zone_ctx.fillStyle
    zone_ctx.fillStyle = 'black';
    for (let r = 0; r < grid_count; r++) {
        for (let c = 0; c < grid_count; c++) {
            if (zoned_grid[r][c] == 1) {
                zone_ctx.fillRect(r * scale, c * scale, scale, scale)
            }
        }
    }
    zone_ctx.fillStyle = style
}

function toggleZoneWall(x, y) {
    if (zoned_grid[x][y] == 0)
        zoned_grid[x][y] = 1
    else
        zoned_grid[x][y] = 0
}

function drawSurvivalZone() {
    zonex = document.getElementById("zonex");
    zoney = document.getElementById("zoney");
    zonewidth = document.getElementById("zonewidth");
    zoneheight = document.getElementById("zoneheight");
    survive_space.x1 = clamp(zonex.value, 0, grid_count - 1)
    survive_space.y1 = clamp(zoney.value, 0, grid_count - 1)
    survive_space.w = clamp(zonewidth.value, 0, grid_count - 1 - survive_space.x1)
    survive_space.h = clamp(zoneheight.value, 0, grid_count - 1 - survive_space.y1)
    var style = zone_ctx.fillStyle
    zone_ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    zone_ctx.fillRect(survive_space.x1 * scale, survive_space.y1 * scale, scale * survive_space.w, scale * survive_space.h);
    zone_ctx.fillStyle = style
}

function drawZoneAgents() {
    var style = zone_ctx.fillStyle
    zone_ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    for (let a of zone_agents) {
        zone_ctx.fillRect(a.x * scale, a.y * scale, scale, scale)
    }
    zone_ctx.fillStyle = style
}

function moveZoneAgents() {
    for (let a of zone_agents) {
        a.runTick(zone_curr_tick, zoned_grid)
    }
}

function zoneAgentUpdates() {
    drawZoneAgents();
    moveZoneAgents();
}

function handleZoneGenerationEnd() {
    zone_curr_gen += 1
    zone_running = false;
    if (zone_curr_gen >= zone_generations) {
        document.getElementById("zone_gen").innerHTML = zone_curr_gen
        document.getElementById("start2").disabled = false
        return;
    }
    for (let a of zone_agents) {
        a.evalZonedReward(survive_space);
    }
    survived_zone = zone_agents.filter(a => a.reward > 0)
    if (survived_zone.length <= 1) {
        zone_agents = get_random_agents(agents_per_zone_gen);
    } else {
        makeNewZoneGen(survived_zone)
    }
    zone_curr_tick = 0
    zone_running = true
    document.getElementById("zone_gen").innerHTML = zone_curr_gen + 1
    window.requestAnimationFrame(zoneLoopHandler);
}

function makeNewZoneGen(s) {
    newGen = []
    for (let a of s) newGen.push(a)
    let children = reproduceZoneGen(s, agents_per_zone_gen - newGen.length)
    newGen = newGen.concat(children)
    survived_zone = []
    zone_agents = newGen
    for (let a of zone_agents) {
        a.x = Math.floor(Math.random() * grid_count)
        a.y = Math.floor(Math.random() * grid_count)
    }
}

function reproduceZoneGen(s, new_agents) {
    ret = []
    for (let i = 0; i < new_agents; i++) {
        const shuffled = s.sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, 2);
        let split_index = num = Math.floor(Math.random() * selected[0].genome.length);
        new_agent = selected[0].genome.slice(0, split_index)
            .concat(selected[1].genome.slice(split_index, selected[1].genome.length))
        ret.push(new Agent(Math.floor(Math.random() * grid_count), Math.floor(Math.random() * grid_count), new_agent))
    }
    for (let a of ret) {
        mutate(a, zone_mutation_chance)
    }
    return ret
}

function zoneGameLoop() {
    zoneSimClear();
    drawZoneGrid();
    drawZoneWalls();
    drawSurvivalZone();
    zoneAgentUpdates();
    setTimeout(() => {
        if (zone_curr_tick < zone_ticks) {
            zone_curr_tick++;
            window.requestAnimationFrame(zoneLoopHandler);
        } else
            handleZoneGenerationEnd();
    }, 1000 / zone_fps);
}

function zonePreGameLoop() {
    zoneSimClear();
    drawZoneGrid();
    drawZoneWalls();
    drawAgentStart();
    drawSurvivalZone();
    drawZoneAgents();
    setTimeout(() => {
        window.requestAnimationFrame(zoneLoopHandler);
    }, 1000 / zone_fps);
}

function zoneLoopHandler() {
    if (zone_running) zoneGameLoop();
    else zonePreGameLoop();
}

window.requestAnimationFrame(zoneLoopHandler);