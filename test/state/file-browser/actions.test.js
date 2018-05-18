import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { isFSA } from 'flux-standard-action';
import { setFileList, setPathInfo, fetchFileList, wrapApiCall } from 'state/file-browser/actions';
import { mockApi } from 'test/testUtils';
import { getFileBrowser } from 'api/fileBrowser';
import { SET_FILE_LIST, SET_PATH_INFO } from 'state/file-browser/types';
import { ADD_ERRORS } from 'state/errors/types';
import { TOGGLE_LOADING } from 'state/loading/types';
import { FILE_BROWSER } from 'test/mocks/fileBrowser';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('state/file-browser/actions', () => {
  let action;

  describe('setFileList', () => {
    beforeEach(() => {
      action = setFileList(FILE_BROWSER);
    });

    it('is FSA compliant', () => {
      expect(isFSA(action)).toBe(true);
    });

    it('is of type SET_APIS', () => {
      expect(action).toHaveProperty('type', SET_FILE_LIST);
    });

    it('defines payload property', () => {
      expect(action).toHaveProperty('payload');
      expect(action).toHaveProperty('payload.fileList', FILE_BROWSER);
    });
  });

  describe('setPathInfo', () => {
    const meta = {
      protectedFolder: false,
      prevPath: 'folder',
      currentPath: 'folder/subfolder1',
    };

    beforeEach(() => {
      action = setPathInfo(meta);
    });

    it('is FSA compliant', () => {
      expect(isFSA(action)).toBe(true);
    });

    it('is of type SET_PATH_INFO', () => {
      expect(action).toHaveProperty('type', SET_PATH_INFO);
    });

    it('defines payload property', () => {
      expect(action).toHaveProperty('payload');
      expect(action).toHaveProperty('payload.pathInfo', meta);
    });
  });


  describe('thunks', () => {
    let store;
    beforeEach(() => {
      jest.clearAllMocks();
      store = mockStore({});
    });

    describe('fetchFileList', () => {
      it('fetchFileList calls setFileList without parameters', (done) => {
        store.dispatch(fetchFileList()).then(() => {
          const actions = store.getActions();
          expect(getFileBrowser).toHaveBeenCalledWith('?');
          expect(actions).toHaveLength(4);
          expect(actions[0]).toHaveProperty('type', TOGGLE_LOADING);
          expect(actions[1]).toHaveProperty('type', SET_FILE_LIST);
          expect(actions[2]).toHaveProperty('type', SET_PATH_INFO);
          expect(actions[3]).toHaveProperty('type', TOGGLE_LOADING);
          done();
        }).catch(done.fail);
      });

      it('fetchFileList calls setFileList with protectedFolder true', (done) => {
        store.dispatch(fetchFileList(true)).then(() => {
          const actions = store.getActions();
          expect(getFileBrowser).toHaveBeenCalledWith('?protectedFolder=true');
          expect(actions).toHaveLength(4);
          expect(actions[0]).toHaveProperty('type', TOGGLE_LOADING);
          expect(actions[1]).toHaveProperty('type', SET_FILE_LIST);
          expect(actions[2]).toHaveProperty('type', SET_PATH_INFO);
          expect(actions[3]).toHaveProperty('type', TOGGLE_LOADING);
          done();
        }).catch(done.fail);
      });

      it('fetchFileList calls setFileList with protectedFolder true and path not empty', (done) => {
        store.dispatch(fetchFileList(true, 'path')).then(() => {
          const actions = store.getActions();
          expect(getFileBrowser).toHaveBeenCalledWith('?protectedFolder=true&currentPath=path');
          expect(actions).toHaveLength(4);
          expect(actions[0]).toHaveProperty('type', TOGGLE_LOADING);
          expect(actions[1]).toHaveProperty('type', SET_FILE_LIST);
          expect(actions[2]).toHaveProperty('type', SET_PATH_INFO);
          expect(actions[3]).toHaveProperty('type', TOGGLE_LOADING);
          done();
        }).catch(done.fail);
      });

      it('fetchFileList calls setFileList with path not empty', (done) => {
        store.dispatch(fetchFileList(null, 'path')).then(() => {
          const actions = store.getActions();
          expect(getFileBrowser).toHaveBeenCalledWith('?currentPath=path');
          expect(actions).toHaveLength(4);
          expect(actions[0]).toHaveProperty('type', TOGGLE_LOADING);
          expect(actions[1]).toHaveProperty('type', SET_FILE_LIST);
          expect(actions[2]).toHaveProperty('type', SET_PATH_INFO);
          expect(actions[3]).toHaveProperty('type', TOGGLE_LOADING);
          done();
        }).catch(done.fail);
      });
    });


    describe('wrapApiCall()', () => {
      it('when wrapApiCall succeeds should call api function, the returns a json', (done) => {
        const genericApi = jest.fn().mockImplementation(mockApi({ payload: FILE_BROWSER }));
        store.dispatch(wrapApiCall(genericApi)(FILE_BROWSER)).then(() => {
          expect(genericApi).toHaveBeenCalledWith(FILE_BROWSER);
          done();
        }).catch(done.fail);
      });

      it('when wrapApiCall fails should dispatch addErros function', async () => {
        const genericApi = jest.fn().mockImplementation(mockApi({ errors: true }));
        return store.dispatch(wrapApiCall(genericApi)(FILE_BROWSER)).catch((e) => {
          const actions = store.getActions();
          expect(actions).toHaveLength(1);
          expect(actions[0]).toHaveProperty('type', ADD_ERRORS);
          expect(e).toHaveProperty('errors');
          e.errors.forEach((error, index) => {
            expect(error.message).toEqual(actions[0].payload.errors[index]);
          });
        });
      });

      it('when api does not return json, wrapApiCall throws a TypeError', async () => {
        const genericApi = jest.fn().mockReturnValue('error_result, error_result');
        return store.dispatch(wrapApiCall(genericApi)(FILE_BROWSER)).catch((e) => {
          expect(e instanceof TypeError).toBe(true);
        });
      });
    });
  });
});