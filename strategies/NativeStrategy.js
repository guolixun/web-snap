import Strategy from './Strategy.js';

class NativeStrategy extends Strategy {
    getName(element) {
        return element.id || element.name;
    }
}

export default NativeStrategy;