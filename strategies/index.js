/*
 * @Author: Bennent_G
 * @Date: 2025-02-19 18:38:54
 * @LastEditTime: 2025-02-19 18:48:06
 * @Description: 
 */
import ElementPlusStrategy from './ElementPlusStrategy.js';
import LibraryAStrategy from './LibraryAStrategy.js';
import LibraryBStrategy from './LibraryBStrategy.js';
import LibraryCStrategy from './LibraryCStrategy.js';
import NativeStrategy from './NativeStrategy.js';


export function getStrategy(uiLibrary) {
    switch (uiLibrary) {
        case 'elementplus':
            return new ElementPlusStrategy();
        case 'a':
            return new LibraryAStrategy();
        case 'b':
            return new LibraryBStrategy();
        case 'c':
            return new LibraryCStrategy();
        default:
            return new NativeStrategy();
    }
}
