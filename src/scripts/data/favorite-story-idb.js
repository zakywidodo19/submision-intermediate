import { openDB } from 'idb';
import CONFIG from '../config';

const DATABASE_NAME = 'ceritakita-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'favorites';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
  },
});

const FavoriteStoryIdb = {
  async getStory(id) {
    if (!id) return;
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async putStory(story) {
    // eslint-disable-next-line no-prototype-builtins
    if (!story.hasOwnProperty('id')) return;
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default FavoriteStoryIdb;
