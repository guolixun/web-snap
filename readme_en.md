以下是<mcfile name="web-snap_zh.md" path="d:\works\packages\web-snap\web-snap_zh.md"></mcfile>文件内容的中文转译成英文版本，保持原有格式不变：

```markdown:d:\works\packages\web-snap\web-snap_en.md
# WebSnap

WebSnap is a JavaScript library for managing form element history based on IndexedDB. It provides a simple yet powerful way to store and retrieve historical values of form elements, supporting paginated queries and filtering features.

## Features

- 📝 Multi-user data isolation
- 🔒 Automatic binding of form element change events
- 🎯 Automatic binding of element click events (real DOM HTML tags with ID attributes, except for a tags and their nested elements)
- 🔄 Support for multiple UI frameworks (default support for Element Plus)
- 📊 Flexible data query interface
- 🎯 Pagination and filtering support
- 💾 Persistent storage based on IndexedDB

## Installation

You can directly import it after downloading.

## Basic Usage
### Initialization

```javascript
import WebSnap from "@/utils/web-snap/index";

WebSnap.init({
  user: "user1",
  maxHistoryLength: 10,
  uiLibrary: "elementplus",
});
```

### Configuration Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| user | string | null | User identifier (required) |
| maxHistoryLength | number | null | Maximum history entries per element |
| uiLibrary | string | 'elementplus' | UI framework type |

## API Reference
### Add History Entry
```javascript
import WebSnap from "@/utils/web-snap/index";
// Add element history
await webSnap.addElementHistory(
  '#/route/path',    // Route path
  'inputName',       // Element identifier
  'inputValue',      // Element value
  'type'            // Element type form(default) | click | browser
);
```

### Query History
Get Element History
```javascript
// Get history of specified element
const history = await webSnap.getElementHistory('route/path@inputName');
```

Get All History
```javascript
// Get all history
const allHistory = await webSnap.getAllHistory();

// Example return data structure:
{
  "user123@#/route/path1": [
    {
      element: "input1",
      value: "value1",
      timestamp: 1623456789
    },
    {
      element: "input2",
      value: "value2",
      timestamp: 1623456790
    }
  ],
  "user123@#/route/path2": [
    {
      element: "input3",
      value: "value3",
      timestamp: 1623456791
    }
  ]
}
```

Get Store Keys
```javascript
// Get all store keys
const keys = await webSnap.getStoreKeys();

// Get keys list with detailed information
const keysInfo = await webSnap.getStoreKeysInfo();

// Get keys grouped by user
const groupedKeys = await webSnap.getStoreKeysGroupedByUser();

// Get keys for specific user
const userKeys = await webSnap.getUserStoreKeys('user123');
```

### Paginated Queries
Pagination Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| page | number | 1 | Current page number |
| pageSize | number | 10 | Records per page |
| sortBy | string | 'timestamp' | Sort field |
| sortOrder | string | 'desc' | Sort direction ('asc'/'desc') |

Basic Paginated Query
```javascript
const result = await webSnap.getFilteredPaginatedRecords(
  'user123@#/route/path',
  {},  // No filters
  {
    page: 1,
    pageSize: 10,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  }
);
```

Paginated Query with Filters
```javascript
const result = await webSnap.getFilteredPaginatedRecords(
  'user123@#/route/path',
  {
    element: 'input1',           // Exact match
    timestamp: { min: 1623456789 }, // Range filter
    value: ['value1', 'value2']     // Array match
  },
  {
    page: 1,
    pageSize: 10
  }
);
```

Pagination Result Structure
```javascript
interface PaginatedResult {
  records: Array<any>;     // Current page records
  total: number;           // Total record count
  currentPage: number;     // Current page number
  totalPages: number;      // Total pages
  pageSize: number;        // Items per page
}
```

Delete History
```javascript
// Delete history of specified element
await webSnap.deleteElementHistory('route/path@inputName');

// Clear all history
await webSnap.clearAllHistory();
```

## Error Handling
All methods include error handling, it's recommended to use try-catch for exception handling:

```javascript
try {
  await webSnap.addElementHistory(route, name, value);
} catch (error) {
  console.error('Operation failed:', error);
}
```

## Browser Support
Requires modern browsers with IndexedDB support.

## License
MIT

## Contributing
Issues and pull requests are welcome!

## Special Notes

Taking ElementPlus as an example

- 📝 The extension only tracks elements with ID attributes
- 🔒 Basic form elements (except el-select) only need to set ID, no additional configuration required

```javascript
// Special case: manual addition required, otherwise tracking won't work
<el-select id="test6" @change="onChange1">
  <el-option label="track" value="1" />
</el-select>

const onChange = (value) => {
  recorder.addElementHistory('#/', 'test6', value || '' )
}
```