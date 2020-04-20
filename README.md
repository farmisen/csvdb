# csvdb

## Intro

A database module that uses a single csv file as data store. This has been hacked in a few hours
out of boredom and you should definitively not use it.  

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [connect](#connect)
    -   [Parameters](#parameters)
    -   [Examples](#examples)
-   [rows](#rows)
    -   [Examples](#examples-1)
-   [find](#find)
    -   [Parameters](#parameters-1)
    -   [Examples](#examples-2)
-   [create](#create)
    -   [Parameters](#parameters-2)
    -   [Examples](#examples-3)
-   [update](#update)
    -   [Parameters](#parameters-3)
    -   [Examples](#examples-4)
-   [update](#update-1)
    -   [Parameters](#parameters-4)
    -   [Examples](#examples-5)
-   [exists](#exists)
    -   [Parameters](#parameters-5)
    -   [Examples](#examples-6)

### connect

Creates a db connection to a csv file.
In case the file does not exist, it will be created when first needed.

#### Parameters

-   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The path to the csv file.

#### Examples

```javascript
const db = await connect('./db.csv');
```

### rows

Returns a copy of all the rows

#### Examples

```javascript
:
db.rows();
```

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** A copy of all the rows

### find

Finds the rows that fulfill a predicate

#### Parameters

-   `predicate` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** The predicate used to find the row

#### Examples

```javascript
:
db.find(({bar}=>bar==='zed');
```

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** A copy of all the found rows

### create

Creates a new row

#### Parameters

-   `row` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The row data

#### Examples

```javascript
db.create({foo: '1', bar: 'zed'})
```

-   Throws **DuplicateRowError** if trying to create a duplicate row

### update

Updates an existing row

#### Parameters

-   `row` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The current row data
-   `newRow` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The updated row data

#### Examples

```javascript
db.update({foo: '1', bar: 'zed'}, {foo: '1', bar: 'baz'})
```

-   Throws **RowNotFoundError** if trying to update a row that does not exist

### update

Updates the first row that fulfills a predicate or create a new one

#### Parameters

-   `predicate` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** The predicate used to find the row
-   `newRow` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The new/updated row data

#### Examples

```javascript
db.createOrUpdate(({bar}=>bar==='zed', {foo: '1', bar: 'baz'});
```

### exists

Checks if a row exists

#### Parameters

-   `row` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The row data

#### Examples

```javascript
db.exists({foo: '1', bar: 'baz'});
```

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true if the row exists, false otherwise
