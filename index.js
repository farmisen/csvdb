const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const csvtojson = require('csvtojson');
const isEqual = require('lodash.isequal');

class RowNotFoundError extends Error {}
class DuplicateRowError extends Error {}

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

  const rows = () => [..._rows];

  const findIndex = (row) => _rows.findIndex((r) => isEqual(r, row));

  const find = (predicate) => {
    return [..._rows.filter(predicate)];
  };

  const create = async (row) => {
    if (find((r) => isEqual(r, row)).length !== 0) {
      throw new DuplicateRowError();
    }
    _rows = [..._rows, row];
    await save();
  };

  const update = async (row, newRow) => {
    const index = findIndex(row);
    if (index == -1) {
      throw new RowNotFoundError();
    }
    _rows = [..._rows.slice(0, index), newRow, ..._rows.slice(index + 1)];
    await save();
  };

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

  const save = async () => {
    const csvWriter = new ObjectsToCsv(_rows);
    await csvWriter.toDisk(path);
  };

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
