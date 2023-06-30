class Agent {
    constructor(x, y, genome) {
        this.x = x;
        this.y = y;
        this.genome = genome;
    }

    runTick(tick, grid) {
        this.move(this.genome[tick], grid);
    }

    move(dir, grid) {
        switch (dir) {
            case 'u':
                if (this.y > 0 && grid[this.x][this.y - 1] != 1)
                    this.y -= 1;
                break;
            case 'd':
                if (this.y < grid_count - 1 && grid[this.x][this.y + 1] != 1)
                    this.y += 1;
                break;
            case 'r':
                if (this.x < grid_count - 1 && grid[this.x + 1][this.y] != 1)
                    this.x += 1;
                break;
            case 'l':
                if (this.x > 0 && grid[this.x - 1][this.y] != 1)
                    this.x -= 1;
                break;
        }
    }

    evalReward(agent_goal) {
        this.reward = Math.abs(agent_goal.x - this.x) + Math.abs(agent_goal.y - this.y)
    }

    evalZonedReward(zone) {
        this.reward = (this.x >= zone.x1 && this.x <= zone.x1 + zone.w && this.y >= zone.y1 && this.y <= zone.y1 + zone.h) ? 1 : 0;
    }
}