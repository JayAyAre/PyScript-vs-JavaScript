self.onmessage = function(e) {
    const { chunk, operation } = e.data;
    let result;

    switch(operation) {
        case 'sum':
            result = chunk.reduce((acc, val) => acc + val, 0);
            break;
        case 'sumSquares':
            result = chunk.reduce((acc, val) => acc + (val * val), 0);
            break;
    }

    self.postMessage(result);
};