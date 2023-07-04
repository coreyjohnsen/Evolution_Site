class GridSimulation {
    constructor(canvas, start, end, size, gridCount, fps, ticks, generations, agentsPerGen, survivedPerGen, mutationChance) {
        this.canvas = document.getElementById(canvas);
        this.ctx = this.canvas.getContext('2d');
        this.start = {
            x: start[0],
            y: start[1]
        };
        this.end = {
            x: end[0],
            y: end[1]
        };
        this.size = size;
        this.gridCount = gridCount;
        this.scale = size / gridCount;
        this.fps = fps;
        this.ticks = ticks;
        this.generations = generations;
        this.agentsPerGen = agentsPerGen;
        this.survivedPerGen = survivedPerGen;
        this.mutationChance = mutationChance;

        this.curr_tick = 0;
        this.running = false;
        this.curr_gen = 0;
        this.agents = [];
        this.survived = [];

        this.grid = [];
        for (let i = 0; i < this.gridCount; i++) {
            let row = []
            for (let i = 0; i < this.gridCount; i++) {
                row.push(0)
            }
            this.grid.push(row)
        }
    }

    clear() {
        var style = this.ctx.fillStyle
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, 500, 500)
        this.ctx.fillStyle = style
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < this.gridCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.scale);
            this.ctx.lineTo(this.size, i * this.scale);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.gridCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.scale, 0);
            this.ctx.lineTo(i * this.scale, this.size);
            this.ctx.stroke();
        }
    }

    drawWalls() {
        var style = this.ctx.fillStyle
        this.ctx.fillStyle = 'black';
        for (let r = 0; r < this.gridCount; r++) {
            for (let c = 0; c < this.gridCount; c++) {
                if (this.grid[r][c] == 1) {
                    this.ctx.fillRect(r * this.scale, c * this.scale, this.scale, this.scale)
                }
            }
        }
        this.ctx.fillStyle = style
    }

    drawAgentStart() {
        var style = this.ctx.fillStyle
        this.ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        this.ctx.fillRect(this.start.x * this.scale, this.start.y * this.scale, this.scale, this.scale);
        this.ctx.fillStyle = style
    }

    drawAgentEnd() {
        var style = this.ctx.fillStyle
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        this.ctx.fillRect(this.end.x * this.scale, this.end.y * this.scale, this.scale, this.scale);
        this.ctx.fillStyle = style
    }

    toggleWall(x, y) {
        if (this.grid[x][y] == 0 && (x != this.start.x || y != this.start.y) && (x != this.end.x || y != this.end.y))
            this.grid[x][y] = 1
        else
            this.grid[x][y] = 0
    }

    drawAgents() {
        var style = this.ctx.fillStyle
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        for (let a of this.agents) {
            this.ctx.fillRect(a.x * this.scale, a.y * this.scale, this.scale, this.scale)
        }
        this.ctx.fillStyle = style
    }

    moveAgents() {
        for (let a of this.agents) {
            a.runTick(this.curr_tick, this.grid, this.gridCount)
        }
    }

    static makeNewAgents(agentsPerGen, start, ticks){
        var newAgents = [];
        for (var i = 0; i < agentsPerGen; i++) {
            newAgents.push(new Agent(start.x, start.y, getRandomGenome(ticks)));
        }
        return newAgents;
    }

    startSimulation() {
        this.running = true;
        this.curr_gen = 0;
        this.curr_tick = 0;
        this.agents = GridSimulation.makeNewAgents(this.agentsPerGen, this.start, this.ticks);
        if (this.startId) {
            let button = document.getElementById(this.startId)
            button.disabled = true;
        }
        if (this.stopId) {
            let button = document.getElementById(this.stopId)
            button.disabled = false;
        }
        if (this.genId) {
            let gen = document.getElementById(this.genId)
            gen.innerHTML = this.curr_gen + 1
        }
    }
    
    stopSimulation() {
        this.running = false;
        if (this.startId) {
            let button = document.getElementById(this.startId)
            button.disabled = false;
        }
        if (this.stopId) {
            let button = document.getElementById(this.stopId)
            button.disabled = true;
        }
    }

    handleGenerationEnd() {
        this.curr_gen += 1
        if (this.curr_gen >= this.generations) {
            if (this.genId) {
                let gen = document.getElementById(this.genId)
                gen.innerHTML = this.curr_gen
            }
            if (this.startId) {
                let button = document.getElementById(this.startId)
                button.disabled = false;
            }
            this.running = false
            return;
        }
        for (let a of this.agents) {
            a.evalReward(this.end);
        }
        this.agents.sort((a, b) => a.reward - b.reward)
        this.survived = this.agents.slice(0, this.survivedPerGen)
        this.agents = Agent.makeNewGeneration(
            this.survived, this.start, this.agentsPerGen, this.survivedPerGen, this.mutationChance
        )
        this.curr_tick = 0
        if (this.genId) {
            let gen = document.getElementById(this.genId)
            gen.innerHTML = this.curr_gen + 1
        }
    }

    gameLoop() {
        this.clear();
        this.drawGrid();
        this.drawWalls();
        this.drawAgentStart();
        this.drawAgentEnd();
        this.drawAgents();
        this.moveAgents();
        setTimeout(() => {
            if (this.curr_tick < this.ticks) {
                this.curr_tick++;
                window.requestAnimationFrame(() => this.loopHandler());
            } else {
                this.handleGenerationEnd();
                window.requestAnimationFrame(() => this.loopHandler());
            }
        }, 1000 / this.fps);
    }
    
    preGameLoop() {
        this.clear();
        this.drawGrid();
        this.drawWalls();
        this.drawAgentStart();
        this.drawAgentEnd();
        this.drawAgents();
        setTimeout(() => {
            window.requestAnimationFrame(() => this.loopHandler());
        }, 1000 / this.fps);
    }
    
    loopHandler() {
        if (this.running) this.gameLoop();
        else this.preGameLoop();
    }
}

class NNSimulation extends GridSimulation {
    constructor(canvas, start, end, size, gridCount, fps, ticks, generations, agentsPerGen, survivedPerGen, mutationChance, genomeLayers) {
        super(canvas, start, end, size, gridCount, fps, ticks, generations, agentsPerGen, survivedPerGen, mutationChance);
        this.genomeLayers = genomeLayers;
    }

    moveAgents() {
        for (let a of this.agents) {
            a.runNNTick(this.grid, this.end)
        }
    }

    static makeNewAgents(agentsPerGen, start, genomeLayers){
        var newAgents = [];
        for (var i = 0; i < agentsPerGen; i++) {
            newAgents.push(new NNAgent(start.x, start.y, new Network(genomeLayers)));
        }
        return newAgents;
    }

    startSimulation() {
        this.running = true;
        this.curr_gen = 0;
        this.curr_tick = 0;
        this.agents = NNSimulation.makeNewAgents(this.agentsPerGen, this.start, this.genomeLayers);
        if (this.startId) {
            let button = document.getElementById(this.startId)
            button.disabled = true;
        }
        if (this.stopId) {
            let button = document.getElementById(this.stopId)
            button.disabled = false;
        }
        if (this.genId) {
            let gen = document.getElementById(this.genId)
            gen.innerHTML = this.curr_gen + 1
        }
    }

    handleGenerationEnd() {
        this.curr_gen += 1
        if (this.curr_gen >= this.generations) {
            if (this.genId) {
                let gen = document.getElementById(this.genId)
                gen.innerHTML = this.curr_gen
            }
            if (this.startId) {
                let button = document.getElementById(this.startId)
                button.disabled = false;
            }
            this.running = false
            return;
        }
        for (let a of this.agents) {
            a.evalReward(this.end);
        }
        this.agents.sort((a, b) => a.reward - b.reward)
        this.survived = this.agents.slice(0, this.survivedPerGen)
        this.agents = NNAgent.makeNewGeneration(
            this.survived, this.start, this.agentsPerGen, this.survivedPerGen, this.mutationChance
        )
        this.curr_tick = 0
        if (this.genId) {
            let gen = document.getElementById(this.genId)
            gen.innerHTML = this.curr_gen + 1
        }
    }
}