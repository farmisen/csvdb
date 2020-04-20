const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const csvtojson = require('csvtojson');
const isEqual = require('lodash.isequal');

class RowNotFoundError extends Error {}
class DuplicateRowError extends Error {}

/**
 * Creates a db connection to a csv file.
 * In case the file does not exist, it will be created when first needed.
 * @async
 * @function connect
 * @param {string} path The path to the csv file.
 * @example
 * const db = await connect('./db.csv');
 */
const connect = async (path) => {
  const init = async (path) => {
    try {
      await fs.promises.access(path);
      const res = await csvtojson().fromFile(path);
      return res;
    } catch (error) {
      return [];
    }
  };

  let _rows = await init(path);

  const findIndex = (row) => _rows.findIndex((r) => isEqual(r, row));

  const save = async () => {
    const csvWriter = new ObjectsToCsv(_rows);
    await csvWriter.toDisk(path);
  };

  /**
   * Returns a copy of all the rows
   *
   * @function rows
   * @returns {Object[]} - A copy of all the rows
   * @example:
   * db.rows();
   */
  const rows = () => [..._rows];

  /**
   * Finds the rows that fulfill a predicate
   *
   * @param {function} predicate - The predicate used to find the row
   * @returns {Object[]} - A copy of all the found rows
   * @example:
   * db.find(({bar}=>bar==='zed');
   */
  const find = (predicate) => {
    return [..._rows.filter(predicate)];
  };

  /**
   * Creates a new row
   * @async
   * @function create
   * @param {object} row - The row data
   * @throws {DuplicateRowError} if trying to create a duplicate row
   * @example
   * db.create({foo: '1', bar: 'zed'})
   */
  const create = async (row) => {
    if (find((r) => isEqual(r, row)).length !== 0) {
      throw new DuplicateRowError();
    }
    _rows = [..._rows, row];
    await save();
  };

  /**
   * Updates an existing row
   * @async
   * @function update
   * @param {object} row - The current row data
   * @param {object} newRow - The updated row data
   * @throws {RowNotFoundError} if trying to update a row that does not exist
   * @example
   * db.update({foo: '1', bar: 'zed'}, {foo: '1', bar: 'baz'})
   */
  const update = async (row, newRow) => {
    const index = findIndex(row);
    if (index == -1) {
      throw new RowNotFoundError();
    }
    _rows = [..._rows.slice(0, index), newRow, ..._rows.slice(index + 1)];
    await save();
  };

  /**
   * Updates the first row that fulfills a predicate or create a new one
   * @async
   * @function update
   * @param {function} predicate - The predicate used to find the row
   * @param {object} newRow - The new/updated row data
   * @example
   * db.createOrUpdate(({bar}=>bar==='zed', {foo: '1', bar: 'baz'});
   */
  const createOrUpdate = async (predicate, newRow) => {
    try {
      const [currentRow] = find(predicate);
      await update(currentRow, newRow);
    } catch (error) {
      if (error instanceof RowNotFoundError) {
        await create(newRow);
      } else {
        throw error;
      }
    }
  };

  /**
   * Checks if a row exists
   * @function exists
   * @param {object} row - The row data
   * @returns {boolean} - true if the row exists, false otherwise
   * @example
   * db.exists({foo: '1', bar: 'baz'});
   */
  const exists = (row) => findIndex(row) !== -1;

  return {
    rows,
    find,
    exists,
    create,
    update,
    createOrUpdate,
  };
};

exports.RowNotFoundError = RowNotFoundError;
exports.DuplicateRowError = DuplicateRowError;
exports.connect = connect;
