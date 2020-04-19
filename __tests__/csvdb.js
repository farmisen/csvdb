const fs = require('fs');
const { connect, RowNotFoundError, DuplicateRowError } = require('../index');

jest.mock('fs');

const MOCK_FILE_INFO = {
  'db.csv': 'console.log("file1 contents");',
  '/path/to/file2.txt': 'file2 contents',
};

const mockCSVFile = (data) => {
  require('fs').__setMockFiles({ 'db.csv': data });
};

const expectCSCFileUpdateWith = (data) => {
  expect(fs.writeFile).toHaveBeenCalledWith('db.csv', data, expect.anything(), expect.anything());
};

describe('csvdb', () => {
  describe('rows', () => {
    it('returns all the rows', async () => {
      mockCSVFile('id,foo\n1,bar\n2,baz\n3,zed\n');
      const db = await connect('db.csv');
      expect(db.rows()).toEqual([
        { id: '1', foo: 'bar' },
        { id: '2', foo: 'baz' },
        { id: '3', foo: 'zed' },
      ]);
    });

    it('returns an empty array when the csv file does not exist', async () => {
      mockCSVFile('');
      const db = await connect('db.csv');
      expect(db.rows()).toEqual([]);
    });
  });

  describe('create', () => {
    it('updates the cvs file when it succeed', async () => {
      mockCSVFile('');
      const db = await connect('db.csv');
      await db.create({ id: '1', foo: 'bar' });
      expectCSCFileUpdateWith('id,foo\n1,bar\n');
    });

    it('adds a row when the data set is empty', async () => {
      mockCSVFile('');
      const db = await connect('db.csv');
      await db.create({ foo: 1, bar: 'zed' });
      expect(db.rows()).toEqual([{ foo: 1, bar: 'zed' }]);
    });

    it('adds row when the data set is not empty', async () => {
      mockCSVFile('id,foo\n1,bar\n');
      const db = await connect('db.csv');
      await db.create({ id: '2', foo: 'zed' });
      expect(db.rows()).toEqual([
        { id: '1', foo: 'bar' },
        { id: '2', foo: 'zed' },
      ]);
    });

    it('throws when creating a duplicated row', async () => {
      mockCSVFile('id,foo\n1,bar\n');
      const db = await connect('db.csv');
      await expect(db.create({ id: '1', foo: 'bar' })).rejects.toThrow(DuplicateRowError);
    });
  });

  describe('find', () => {
    it('returns the rows matching the predicate', async () => {
      mockCSVFile('id,foo\n1,bar\n2,baz\n3,zed\n');
      const db = await connect('db.csv');
      expect(db.find(({ foo }) => foo.startsWith('ba'))).toEqual([
        { id: '1', foo: 'bar' },
        { id: '2', foo: 'baz' },
      ]);
    });

    it('returns an empty array if no rows are matching the predicate', async () => {
      mockCSVFile('id,foo\n1,bar\n2,baz\n3,zed\n');
      const db = await connect('db.csv');
      expect(db.find(({ foo }) => foo === 1)).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates the cvs file when it succeed', async () => {
      mockCSVFile('id,foo\n1,bar\n2,baz\n3,zed\n');
      const db = await connect('db.csv');
      await db.update({ id: '1', foo: 'bar' }, { id: '1', foo: 'zed' });
      expectCSCFileUpdateWith('id,foo\n1,zed\n2,baz\n3,zed\n');
    });

    it('updates the row when it exists', async () => {
      mockCSVFile('id,foo\n1,bar\n2,baz\n3,zed\n');
      const db = await connect('db.csv');
      await db.update({ id: '2', foo: 'baz' }, { id: '2', foo: 'zed' });
      expect(db.rows()).toEqual([
        { id: '1', foo: 'bar' },
        { id: '2', foo: 'zed' },
        { id: '3', foo: 'zed' },
      ]);
    });

    it('throws a RowNotFoundError when the row does not exist', async () => {
      mockCSVFile('id,foo\n1,bar\n2,baz\n3,zed\n');
      const db = await connect('db.csv');
      await expect(db.update({ id: '6', foo: 'win' }, { id: '6', foo: 'sux' })).rejects.toThrow(
        RowNotFoundError
      );
    });
  });

  describe('createOrUpdate ', () => {
    it('updates the cvs file when it succeed', async () => {
      mockCSVFile('');
      const db = await connect('db.csv');
      await db.createOrUpdate((r) => false, { id: '1', foo: 'zed' });
      expectCSCFileUpdateWith('id,foo\n1,zed\n');
    });

    it('creates the row when it does not exist', async () => {
      mockCSVFile('id,foo\n1,bar\n2,baz\n');
      const db = await connect('db.csv');
      await db.createOrUpdate(
        (r) => {
          r.id === 3;
        },
        { id: '3', foo: 'zed' }
      );
      expectCSCFileUpdateWith('id,foo\n1,bar\n2,baz\n3,zed\n');
    });

    it('updates the row when it exists', async () => {
      mockCSVFile('id,foo\n1,bar\n2,baz\n3,zed');

      const db = await connect('db.csv');
      await db.createOrUpdate(({ id }) => id === '3', { id: '3', foo: 'arg' });
      expectCSCFileUpdateWith('id,foo\n1,bar\n2,baz\n3,arg\n');
    });
  });

  describe('exists', () => {
    it('returns true if the row exists', async () => {
      mockCSVFile('id,foo\n1,bar\n2,baz\n3,zed');
      const db = await connect('db.csv');
      expect(db.exists({ id: '2', foo: 'baz' })).toBeTruthy();
    });

    it('returns false if the row exists', async () => {
      mockCSVFile('id,foo\n1,bar\n2,baz\n3,zed');
      const db = await connect('db.csv');
      expect(db.exists({ id: 5, foo: 'fab' })).toBeFalsy();
    });
  });
});
