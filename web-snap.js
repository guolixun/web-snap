/*
 * @Author: Bennent_G
 * @Date: 2025-02-21 09:27:09
 * @LastEditTime: 2025-03-14 10:16:01
 * @Description: 
 */
import { getStrategy } from './strategies/index.js';

/**
 * WebSnap - A form history management library
 * @class
 */
class webSnap {
	/**
	 * @typedef {Object} WebSnapConfig
	 * @property {string} [user] - User identifier
	 * @property {number} [maxHistoryLength] - Maximum history entries per element
	 * @property {string} [uiLibrary='elementplus'] - UI library name
	 */

	/**
	 * Creates a new WebSnap instance
	 * @param {WebSnapConfig} config - Configuration options
	 * @throws {TypeError} When instantiated without 'new' keyword
	 */
	constructor(config = {}) {
		this._config = {
			user: config.user || null,
			maxHistoryLength: config.maxHistoryLength || null,
			uiLibrary: config.uiLibrary || 'elementplus',
			routeMode: config.routeMode || 'hash',
		};

		this._dbName = 'WebSnapDB';
		this._storeName = 'HistoryStore';
		this._strategy = getStrategy(this._config.uiLibrary);
		this._db = null;

		if (this._config.user) {
			this._init();
		}
	}

	/**
	 * Initialize the WebSnap instance
	 * @private
	 */
	async _init() {
		try {
			await this._initDB();
			this._bindEvents();
		} catch (error) {
			console.error('WebSnap initialization failed:', error);
		}
	}

	/**
	 * Initialize IndexedDB database
	 * @private
	 * @returns {Promise<void>}
	 */
	async _initDB() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this._dbName, 1);

			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				if (!db.objectStoreNames.contains(this._storeName)) {
					db.createObjectStore(this._storeName, { keyPath: 'key' });
				}
			};

			request.onsuccess = (event) => {
				this._db = event.target.result;
				resolve();
			};

			request.onerror = (event) => reject(event.target.error);
		});
	}

	/**
	 * Bind form element event listeners
	 * @private
	 */
	_bindEvents() {
		document.querySelectorAll('input, textarea, select')
			.forEach(element => {
				element.addEventListener('change', (event) => this._handleChange(event));
			});

		// 增加动态节点的change事件监听
		this._bindObserveEvents();


		// 增加对整个页面点击事件的监听
		document.addEventListener('click', this._handleClick.bind(this));


		// 增加对浏览器操作的事件监听
		// window.addEventListener('popstate', this._handleBrowserNavigation.bind(this));
		// window.addEventListener('beforeunload', this._handleBeforeUnload.bind(this));
	}

	/**
	 * Bind observe events for elements
	 * @private
	 * @returns {void}
	 */
	_bindObserveEvents() {
		// 使用MutationObserver监听DOM变化
		const observer = new MutationObserver((mutationsList) => {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					this._registerChangeEvents();
				}
			}
		});
		// 开始观察document.body，监听子节点的变化
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
		// 立即执行一次事件注册
		this._registerChangeEvents();
	}

	/**
	 * 注册表单元素的change事件
	 * @private
	 */
	_registerChangeEvents() {
		document.querySelectorAll('input, textarea, select')
			.forEach(element => {
				// 避免重复注册事件
				if (!element._webSnapChangeRegistered) {
					element.addEventListener('change', (event) => this._handleChange(event));
					element._webSnapChangeRegistered = true;
				}
			});
	}

	/**
	 * Handle form element change event
	 * @private
	 * @param {Event} event - Change event
	 */
	_handleChange(event) {
		const element = event.target;
		// console.log("🚀 ~ webSnap ~ _handleChange ~ element:", element)
		const name = this._strategy.getID(element);
		const value = this._strategy.getValue(element);
		const route = this._getRoute();
		if (name) {
			this.addElementHistory(route, name, value);
		}
	}

	/**
	 * Handle element click event
	 * @private
	 * @param {Event} event - Change event
	 * @param {string} route - Route path
	 */
	_handleClick(event) {
		const name = this._strategy.getClickID(event);

		if (name) {
			const route = this._getRoute();
			this.addElementHistory(route, name, true, 'click');
		}
	}

	/**
	 * Handle browser navigation events (popstate)
	 * @private
	 * @param {Event} event - Popstate event
	 * 无法准确判断,故舍弃
	 */
	_handleBrowserNavigation(event) {
		const route = this._getRoute();

		let navigationType = 'refresh';

		if (event.state && event.state.timestamp) {
			if (window.history.state && window.history.state.timestamp) {
				// Check if the current state timestamp is greater than the previous state timestamp
				if (event.state.timestamp > window.history.state.timestamp) {
					navigationType = 'forward';
				} else {
					navigationType = 'backward';
				}
			} else {
				navigationType = 'forward'; // Assume forward if no previous state
			}
		}

		// this.addElementHistory(route, 'browser', navigationType, 'browser');
	}

	/**
	 * Handle before unload event (refresh, close)
	 * @private
	 * @param {Event} event - Before unload event
	 */
	_handleBeforeUnload(event) {
		const route = this._getRoute();

		this.addElementHistory(route, 'browser', 'refresh', 'browser');
	}

	/**
	 * Get IndexedDB object store
	 * @private
	 * @param {IDBTransactionMode} mode - Transaction mode
	 * @returns {IDBObjectStore}
	 */
	_getStore(mode) {
		const transaction = this._db.transaction([this._storeName], mode);
		return transaction.objectStore(this._storeName);
	}

	/**
	 * Get the current route path
	 * @private
	 * @returns {string} The current route path
	 */
	_getRoute() {
		const route = this._config.routeMode === 'hash' ? window.location.hash : window.location.pathname;
		// 过滤路由中的参数
		return route.replace(/\?.*$/, '');
	}

	/**
	 * Convert IndexedDB request to Promise
	 * @private
	 * @param {IDBRequest} request - IndexedDB request
	 * @returns {Promise}
	 */
	_promisifyRequest(request) {
		return new Promise((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * Add element history entry
	 * @public
	 * @param {string} routerPath - Route path
	 * @param {string} elementName - Element identifier
	 * @param {string|Array} elementValue - Element value
	 * @param {string} type - Element type: from|click|browser, default:form
	 * @returns {Promise<void>}
	 */
	async addElementHistory(routerPath, elementName, elementValue, type = 'form') {
		// console.log("🚀 ~ webSnap ~ addElementHistory ~ routerPath:", routerPath)

		const store = this._getStore('readwrite');
		const key = `${this._config.user}@${routerPath}`;
		const value = Array.isArray(elementValue) ? elementValue.join(';') : elementValue;

		try {
			// 获取当前路由的历史记录
			const historyEntry = await this._promisifyRequest(store.get(key)) || {
				key,
				records: [] // 新的数据结构使用 records 数组存储所有记录
			};

			// 检查是否需要限制历史记录长度
			if (this._config.maxHistoryLength) {
				// 获取当前元素的记录数量
				const elementRecords = historyEntry.records.filter(
					record => record.element === elementName
				);

				if (elementRecords.length >= this._config.maxHistoryLength) {
					throw new Error(
						`Maximum history length (${this._config.maxHistoryLength}) reached for element: ${elementName}`
					);
				}
			}

			// 创建新的记录
			const newRecord = {
				element: elementName,
				value,
				timestamp: Date.now(),
				type: type
			};

			// 添加新记录
			historyEntry.records.push(newRecord);	

			// 更新存储
			await this._promisifyRequest(store.put(historyEntry));
			return newRecord;
		} catch (error) {
			console.error('Failed to add element history:', error);
		}
	}

	/**
	 * Get element history
	 * @public
	 * @param {string} param - Route and element identifier (format: "route@element")
	 * @returns {Promise<Array>} Element history
	 */
	async getElementHistory(param) {
		const [route, name] = param.split('@');
		const key = `${this._config.user}@${route}`;

		try {
			const store = this._getStore('readonly');
			const result = await this._promisifyRequest(store.get(key));
			if (!result || !result.records) {
				return [];
			}

			// 过滤出指定元素的记录
			return result.records
				.filter(record => record.elementName === elementName);
			// .sort((a, b) => b.timestamp - a.timestamp); // 按时间戳降序排序
		} catch (error) {
			console.error('Failed to get element history:', error);
			return [];
		}
	}

	/**
	 * Get all store keys (user@route combinations)
	 * @public
	 * @returns {Promise<Array<string>>} Array of store keys
	 */
	async getStoreKeys() {
		try {
			const store = this._getStore('readonly');
			return new Promise((resolve, reject) => {
				const keys = [];
				const request = store.openCursor();

				request.onsuccess = (event) => {
					const cursor = event.target.result;
					if (cursor) {
						keys.push({ name: cursor.key });
						cursor.continue();
					} else {
						resolve(keys);
					}
				};

				request.onerror = (event) => {
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Failed to get store keys:', error);
			throw error;
		}
	}

	/**
	 * Get store keys with additional information
	 * @public
	 * @returns {Promise<Array<Object>>} Array of key information objects
	 */
	async getStoreKeysInfo() {
		try {
			const keys = await this.getStoreKeys();
			return keys.map(key => {
				const [user, route] = key.name.split('@');
				return {
					user,
					route
				};
			});
		} catch (error) {
			console.error('Failed to get store keys info:', error);
			throw error;
		}
	}

	/**
	 * Get store keys grouped by user
	 * @public
	 * @returns {Promise<Object>} Object with users as keys and their routes as values
	 */
	async getStoreKeysGroupedByUser() {
		try {
			const keys = await this.getStoreKeysInfo();
			return keys.reduce((grouped, keyInfo) => {
				if (!grouped[keyInfo.user]) {
					grouped[keyInfo.user] = [];
				}
				grouped[keyInfo.user].push({
					route: keyInfo.route,
					fullPath: keyInfo.fullPath
				});
				return grouped;
			}, {});
		} catch (error) {
			console.error('Failed to get grouped store keys:', error);
			throw error;
		}
	}

	/**
	 * Get store keys for specific user
	 * @public
	 * @param {string} user - User identifier
	 * @returns {Promise<Array<string>>} Array of route paths for the user
	 */
	async getUserStoreKeys(user) {
		try {
			const keys = await this.getStoreKeysInfo();
			return keys
				.filter(keyInfo => keyInfo.user === user)
				.map(keyInfo => keyInfo.route);
		} catch (error) {
			console.error(`Failed to get store keys for user ${user}:`, error);
			throw error;
		}
	}

	/**
	 * @typedef {Object} PaginationOptions
	 * @property {number} page - Current page number (starting from 1)
	 * @property {number} pageSize - Number of items per page
	 * @property {string} [sortBy='timestamp'] - Sort field
	 * @property {string} [sortOrder='desc'] - Sort order ('asc' or 'desc')
	 */

	/**
	 * @typedef {Object} PaginatedResult
	 * @property {Array} records - Records for current page
	 * @property {number} total - Total number of records
	 * @property {number} currentPage - Current page number
	 * @property {number} totalPages - Total number of pages
	 * @property {number} pageSize - Number of items per page
	 */

	/**
	 * Get paginated records for a specific key
	 * @public
	 * @param {string} key - The store key (user@route)
	 * @param {PaginationOptions} options - Pagination options
	 * @returns {Promise<PaginatedResult>} Paginated records
	 */
	async getPaginatedRecords(key, options = {}) {
		const defaultOptions = {
			page: 1,
			pageSize: 10,
			sortBy: 'timestamp',
			sortOrder: 'desc'
		};

		// Merge default options with provided options
		const finalOptions = { ...defaultOptions, ...options };

		try {
			const store = this._getStore('readonly');
			const result = await this._promisifyRequest(store.get(key));

			if (!result || !result.records) {
				return {
					records: [],
					total: 0,
					currentPage: finalOptions.page,
					totalPages: 0,
					pageSize: finalOptions.pageSize
				};
			}

			// Sort records
			const sortedRecords = [...result.records].sort((a, b) => {
				const aValue = a[finalOptions.sortBy];
				const bValue = b[finalOptions.sortBy];

				if (finalOptions.sortOrder === 'asc') {
					return aValue > bValue ? 1 : -1;
				}
				return aValue < bValue ? 1 : -1;
			});

			// Calculate pagination
			const total = sortedRecords.length;
			const totalPages = Math.ceil(total / finalOptions.pageSize);
			const start = (finalOptions.page - 1) * finalOptions.pageSize;
			const end = start + finalOptions.pageSize;
			const paginatedRecords = sortedRecords.slice(start, end);

			return {
				records: paginatedRecords,
				total,
				currentPage: finalOptions.page,
				totalPages,
				pageSize: finalOptions.pageSize
			};
		} catch (error) {
			console.error('Failed to get paginated records:', error);
			throw error;
		}
	}

	/**
	 * Get filtered and paginated records for a specific key
	 * @public
	 * @param {string} key - The store key (user@route)
	 * @param {Object} filters - Filter conditions
	 * @param {PaginationOptions} options - Pagination options
	 * @returns {Promise<PaginatedResult>} Filtered and paginated records
	 */
	async getFilteredPaginatedRecords(key, filters = {}, options = {}) {
		try {
			const store = this._getStore('readonly');
			const result = await this._promisifyRequest(store.get(key));

			if (!result || !result.records) {
				return {
					records: [],
					total: 0,
					currentPage: options.page || 1,
					totalPages: 0,
					pageSize: options.pageSize || 10
				};
			}

			// Check if filters object is empty
			const hasFilters = Object.keys(filters).length > 0;

			let recordsToProcess = result.records;

			// Apply filters if they exist
			if (hasFilters) {
				recordsToProcess = result.records.filter(record => {
					return Object.entries(filters).every(([key, value]) => {
						if (value === '' || value === undefined || value === null) return true;

						if (Array.isArray(value)) {
							return value.includes(record[key]);
						}
						if (typeof value === 'object') {
							const { min, max } = value;
							if (min !== undefined && record[key] < min) return false;
							if (max !== undefined && record[key] > max) return false;
							return true;
						}
						return record[key] === value;
					});
				});
			}

			// Apply pagination
			return this._paginateRecords(recordsToProcess, options);
		} catch (error) {
			console.error('Failed to get filtered paginated records:', error);
			throw error;
		}
	}

	/**
	 * Helper method to paginate records
	 * @private
	 * @param {Array} records - Records to paginate
	 * @param {PaginationOptions} options - Pagination options
	 * @returns {PaginatedResult} Paginated records
	 */
	_paginateRecords(records, options = {}) {
		const {
			page = 1,
			pageSize = 10,
			sortBy = 'timestamp',
			sortOrder = 'desc'
		} = options;

		// Sort records
		const sortedRecords = [...records].sort((a, b) => {
			const aValue = a[sortBy];
			const bValue = b[sortBy];
			return sortOrder === 'asc' ?
				(aValue > bValue ? 1 : -1) :
				(aValue < bValue ? 1 : -1);
		});

		// Calculate pagination
		const total = sortedRecords.length;
		const totalPages = Math.ceil(total / pageSize);
		const start = (page - 1) * pageSize;
		const end = start + pageSize;
		const paginatedRecords = sortedRecords.slice(start, end);

		return {
			records: paginatedRecords,
			total,
			currentPage: page,
			totalPages,
			pageSize
		};
	}

	/**
	 * Get all history with new data structure
	 * @public
	 * @returns {Promise<Object>} All history records
	 */
	async getAllHistory() {
		try {
			const store = this._getStore('readonly');
			const allRecords = await this._promisifyRequest(store.getAll());

			// 转换为所需的数据结构
			return allRecords.reduce((acc, entry) => {
				acc[entry.key] = entry.records;
				return acc;
			}, {});
		} catch (error) {
			console.error('Failed to get all history:', error);
			return {};
		}
	}

	/**
	 * Delete element history with new data structure
	 * @public
	 * @param {string} param - Route and element identifier (format: "route@element")
	 * @returns {Promise<void>}
	 */
	async deleteElementHistory(param) {
		const [route, elementName] = param.split('@');
		const key = `${this._config.user}@${route}`;

		try {
			const store = this._getStore('readwrite');
			const historyEntry = await this._promisifyRequest(store.get(key));

			if (historyEntry && historyEntry.records) {
				// 过滤掉指定元素的记录
				historyEntry.records = historyEntry.records.filter(
					record => record.element !== elementName
				);

				// 如果还有记录，更新存储；如果没有记录，删除该条目
				if (historyEntry.records.length > 0) {
					await this._promisifyRequest(store.put(historyEntry));
				} else {
					await this._promisifyRequest(store.delete(key));
				}
			}
		} catch (error) {
			console.error('Failed to delete element history:', error);
			throw error;
		}
	}

	/**
	 * Clear all history
	 * @public
	 * @returns {Promise<void>}
	 */
	async clearAllHistory() {
		try {
			const store = this._getStore('readwrite');
			await this._promisifyRequest(store.clear());
		} catch (error) {
			console.error('Failed to clear history:', error);
		}
	}
}
export default webSnap;