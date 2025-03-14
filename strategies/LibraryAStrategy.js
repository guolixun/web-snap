import Strategy from './Strategy.js';

class LibraryAStrategy extends Strategy {
    getName(element) {
        if (element.type === 'radio') {
            return this.getRadioGroupNameA(element);
        }
        return element.id || element.name;
    }

    getRadioGroupNameA(element) {
        // 实现 Library A 的逻辑
        return element.id || element.name;
    }
}

export default LibraryAStrategy;