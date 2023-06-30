// get and setup canvas
var canvas = document.getElementById("canvas");
canvas.addEventListener('mousedown', function (e) {
    var pos = getCursorPosition(canvas, e)
    pos = pxToGrid(pos[0], pos[1], scale)
    toggleWall(pos[0], pos[1])
})
var ctx = canvas.getContext("2d");

var agent_start = {
    x: 5,
    y: 5
}
var agent_goal = {
    x: 19,
    y: 19
}

const size = 500;
const grid_count = 20;
const scale = size / grid_count;

// configurable
var fps = 60;
var ticks = 50;
var generations = 10;
var agents_per_gen = 300;
var survived_per_gen = 10;
var mutation_chance = 0.3;

var curr_tick = 0;
var running = false;
var curr_gen = 0;


agents = []
survived = []

function initValues() {
    fps = Number(document.getElementById("fpsValue").innerText);
    ticks = Number(document.getElementById("tickValue").innerText);
    generations = Number(document.getElementById("generationsValue").innerText);
    agents_per_gen = Number(document.getElementById("agentsValue").innerText);
    survived_per_gen = Number(document.getElementById("keptValue").innerText);
    mutation_chance = Number(document.getElementById("mutationValue").innerText);
}

function startSimulation() {
    initValues();
    running = true;
    curr_gen = 0;
    curr_tick = 0;
    agents = []
    for (let i = 0; i < agents_per_gen; i++)
        agents.push(new Agent(agent_start.x, agent_start.y, getRandomGenome()))
    button = document.getElementById("start")
    button.disabled = true;
    stopButton = document.getElementById("stop")
    stopButton.disabled = false;
    window.requestAnimationFrame(loopHandler);
}

function stopSimulation() {
    running = false;
    button = document.getElementById("start")
    button.disabled = false;
    stopButton = document.getElementById("stop")
    stopButton.disabled = true;
}

const grid = []
for (let i = 0; i < grid_count; i++) {
    let temp = []
    for (let i = 0; i < grid_count; i++) {
        temp.push(0)
    }
    grid.push(temp)
}

function clear() {
    var style = ctx.fillStyle
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 500, 500)
    ctx.fillStyle = style
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < grid_count; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * scale);
        ctx.lineTo(size, i * scale);
        ctx.stroke();
    }
    for (let i = 0; i < grid_count; i++) {
        ctx.beginPath();
        ctx.moveTo(i * scale, 0);
        ctx.lineTo(i * scale, size);
        ctx.stroke();
    }
}

function drawWalls() {
    var style = ctx.fillStyle
    ctx.fillStyle = 'black';
    for (let r = 0; r < grid_count; r++) {
        for (let c = 0; c < grid_count; c++) {
            if (grid[r][c] == 1) {
                ctx.fillRect(r * scale, c * scale, scale, scale)
            }
        }
    }
    ctx.fillStyle = style
}

function toggleWall(x, y) {
    if (grid[x][y] == 0 && (x != agent_start.x || y != agent_start.y) && (x != agent_goal.x || y != agent_goal.y))
        grid[x][y] = 1
    else
        grid[x][y] = 0
}

function drawAgentStart() {
    startx = document.getElementById("startx");
    starty = document.getElementById("starty");
    agent_start.x = clamp(startx.value, 0, grid_count - 1);
    agent_start.y = clamp(starty.value, 0, grid_count - 1)
    var style = ctx.fillStyle
    ctx.fillStyle = 'skyblue';
    ctx.fillRect(agent_start.x * scale, agent_start.y * scale, scale, scale);
    ctx.fillStyle = style
}

function drawAgentEnd() {
    goalx = document.getElementById("goalx");
    goaly = document.getElementById("goaly");
    agent_goal.x = clamp(goalx.value, 0, grid_count - 1)
    agent_goal.y = clamp(goaly.value, 0, grid_count - 1)
    var style = ctx.fillStyle
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fillRect(agent_goal.x * scale, agent_goal.y * scale, scale, scale);
    ctx.fillStyle = style
}

function drawAgents() {
    var style = ctx.fillStyle
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    for (let a of agents) {
        ctx.fillRect(a.x * scale, a.y * scale, scale, scale)
    }
    ctx.fillStyle = style
}

function moveAgents() {
    for (let a of agents) {
        a.runTick(curr_tick, grid)
    }
}

function agentUpdates() {
    drawAgents();
    moveAgents();
}

function handleGenerationEnd() {
    curr_gen += 1
    if (curr_gen >= generations) {
        document.getElementById("gen").innerHTML = curr_gen
        running = false
        document.getElementById("start").disabled = false
        return;
    }
    running = false;
    for (let a of agents) {
        a.evalReward(agent_goal);
    }
    agents.sort((a, b) => a.reward - b.reward)
    survived = agents.slice(0, survived_per_gen)
    makeNewGeneration(survived)
    curr_tick = 0
    running = true
    document.getElementById("gen").innerHTML = curr_gen + 1
    window.requestAnimationFrame(loopHandler);
}

function makeNewGeneration(s) {
    newGen = []
    for (let a of s) newGen.push(a)
    let children = reproduce(s, agents_per_gen - survived_per_gen)
    newGen = newGen.concat(children)
    survived = []
    agents = newGen
    for (let a of agents) {
        a.x = agent_start.x
        a.y = agent_start.y
    }
}

function reproduce(s, new_agents) {
    ret = []
    for (let i = 0; i < new_agents; i++) {
        const shuffled = s.sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, 2);
        let split_index = num = Math.floor(Math.random() * selected[0].genome.length);
        new_agent = selected[0].genome.slice(0, split_index)
            .concat(selected[1].genome.slice(split_index, selected[1].genome.length))
        ret.push(new Agent(agent_start.x, agent_start.y, new_agent))
    }
    for (let a of ret) {
        mutate(a, mutation_chance)
    }
    return ret
}

function gameLoop() {
    clear();
    drawGrid();
    drawWalls();
    drawAgentEnd();
    agentUpdates();
    setTimeout(() => {
        if (curr_tick < ticks) {
            curr_tick++;
            window.requestAnimationFrame(loopHandler);
        } else
            handleGenerationEnd();
    }, 1000 / fps);
}

function preGameLoop() {
    clear();
    drawGrid();
    drawWalls();
    drawAgentStart();
    drawAgentEnd();
    drawAgents();
    setTimeout(() => {
        window.requestAnimationFrame(loopHandler);
    }, 1000 / fps);
}

function loopHandler() {
    if (running) gameLoop();
    else preGameLoop();
}

window.requestAnimationFrame(loopHandler);