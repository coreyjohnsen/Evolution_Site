class Layer {

    constructor(input, output) {
        this.input = new Array(input);
        this.output = new Array(output);
        this.biases = new Array(output);
        this.weights = [];
        for (let i = 0; i < output; i++) {
            this.weights.push(new Array(input));
        }

        Layer.randomize(this);
    }

    static randomize(layer) {
        for (let i = 0; i < layer.output.length; i++) {
            for (let j = 0; j < layer.input.length; j++) {
                layer.weights[i][j] = Math.random()*2 - 1;
            }
        }
        for (let i = 0; i < layer.output.length; i++) {
            layer.biases[i] = Math.random()*2 - 1;
        }
    }

    forward(input) {
        if (input.length !== this.input.length) throw new Error('Invalid input size');
        this.input = JSON.parse(JSON.stringify(input));

        for(let i = 0; i < this.output.length; i++) {
            var output = 0;
            for(let j = 0; j < this.input.length; j++) {
                output += this.weights[i][j] * this.input[j];
            }
            output += this.biases[i];
            this.output[i] = output > 0 ? 1 : 0;
        }
        return this.output;
    }
}

class Network {

    constructor(layers) {
        this.input = new Array(layers[0]);
        this.output = new Array(layers[layers.length-1]);
        this.layers = new Array(layers.length-1);
        this.layersArr = layers;
        for (let i = 0; i < layers.length-1; i++) {
            this.layers[i] = new Layer(layers[i], layers[i+1]);
        }
    }

    cloneFromNetwork(network) {
        this.input = new Array(network.layersArr[0]);
        this.output = new Array(network.layersArr[network.layersArr.length - 1]);
        this.layers = new Array(network.layers.length);
        this.layersArr = network.layersArr;

        for (let i = 0; i < network.layers.length; i++) {
            const layer = network.layers[i];
            const copiedLayer = new Layer(layer.input.length, layer.output.length);

            // Copy weights
            copiedLayer.weights = layer.weights.map(row => [...row]);

            // Copy biases
            copiedLayer.biases = [...layer.biases];

            this.layers[i] = copiedLayer;
        }
    }

    forward(input) {
        if (input.length!== this.layers[0].input.length) 
            throw new Error('Invalid input size. Expected ' + this.layers[0].input.length + ' but got ' + input.length);
        this.input = JSON.parse(JSON.stringify(input));
        var nextInput = this.input;
        for (let i = 0; i < this.layers.length; i++) {
            nextInput = this.layers[i].forward(nextInput);
        }
        this.output = nextInput;
        return this.output;
    }

    static reproduce(network1, network2) {
        var child = new Network(network1.layersArr);
        for (let i = 0; i < network1.layers.length; i++) {
            var weights = new Array(network1.layers[i].weights.length);
            for (let j = 0; j < weights.length; j++) weights[j] = new Array(network1.layers[i].weights[j].length);

            for (let j = 0; j < network1.layers[i].weights.length; j++) {
                for (let k = 0; k < network1.layers[i].weights[j].length; k++) {
                    weights[j][k] = Math.random() > 0.5 ? network1.layers[i].weights[j][k] : network2.layers[i].weights[j][k];
                }
            }
            child.layers[i].weights = weights;

            var biases = []
            for (let j = 0; j < network1.layers[i].biases.length; j++) {
                biases.push(Math.random() > 0.5? network1.layers[i].biases[j] : network2.layers[i].biases[j]);
            }
            child.layers[i].biases = biases;
        }
        return child;
    }

    mutate(chance) {
        for (let i = 0; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].weights.length; j++) {
                for (let k = 0; k < this.layers[i].weights[j].length; k++) {
                    this.layers[i].weights[j][k] = Math.random() < chance ? 
                        clamp(this.layers[i].weights[j][k] + (Math.random() - 0.5), -1, 1) : 
                        this.layers[i].weights[j][k];
                }
            }
            for (let j = 0; j < this.layers[i].biases.length; j++) {
                this.layers[i].biases[j] = Math.random() < chance ? clamp(this.layers[i].biases[j] + (Math.random() - 0.5), -1, 1) : this.layers[i].biases[j];
            }
        }
    }
}