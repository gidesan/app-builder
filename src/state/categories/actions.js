import { initialize } from 'redux-form';
import { addToast, addErrors, TOAST_ERROR } from '@entando/messages';

import {
  getCategoryTree, getCategory, postCategory,
  putCategory, deleteCategory, getReferences,
} from 'api/categories';

import { setPage } from 'state/pagination/actions';
import { toggleLoading } from 'state/loading/actions';
import { history, ROUTE_CATEGORY_LIST, ROUTE_CATEGORY_ADD } from 'app-init/router';
import { getStatusMap, getReferenceKeyList, getSelectedRefs, getCategoriesMap } from 'state/categories/selectors';

import {
  SET_CATEGORIES, TOGGLE_CATEGORY_EXPANDED, SET_CATEGORY_LOADING,
  SET_CATEGORY_LOADED, SET_SELECTED_CATEGORY, REMOVE_CATEGORY,
  SET_REFERENCES,
} from 'state/categories/types';
import { ROOT_CODE } from 'state/categories/const';

export const setCategories = categories => ({
  type: SET_CATEGORIES,
  payload: {
    categories,
  },
});

export const toggleCategoryExpanded = (categoryCode, expanded) => ({
  type: TOGGLE_CATEGORY_EXPANDED,
  payload: {
    categoryCode,
    expanded,
  },
});

export const setCategoryLoading = categoryCode => ({
  type: SET_CATEGORY_LOADING,
  payload: {
    categoryCode,
  },
});

export const setCategoryLoaded = categoryCode => ({
  type: SET_CATEGORY_LOADED,
  payload: {
    categoryCode,
  },
});

export const setSelectedCategory = category => ({
  type: SET_SELECTED_CATEGORY,
  payload: {
    category,
  },
});

export const removeCategory = categoryCode => ({
  type: REMOVE_CATEGORY,
  payload: {
    categoryCode,
  },
});

export const setReferences = references => ({
  type: SET_REFERENCES,
  payload: {
    references,
  },
});

export const wrapApiCall = apiFunc => (...args) => async (dispatch) => {
  const response = await apiFunc(...args);
  const json = await response.json();
  if (response.ok) {
    return json;
  }
  dispatch(addErrors(json.errors.map(e => e.message)));
  json.errors.forEach(err => dispatch(addToast(err.message, TOAST_ERROR)));
  throw json;
};

export const fetchCategoryNode = wrapApiCall(getCategory);
export const fetchCategoryChildren = wrapApiCall(getCategoryTree);

export const fetchCategoryTree = (categoryCode = ROOT_CODE) => async (dispatch, getState) => {
  let categoryTree;
  try {
    if (categoryCode === ROOT_CODE) {
      dispatch(toggleLoading('categories'));
      const responses = await Promise.all([
        fetchCategoryNode(categoryCode)(dispatch),
        fetchCategoryChildren(categoryCode)(dispatch),
      ]);
      dispatch(setCategoryLoaded(categoryCode));
      const categoryStatus = getStatusMap(getState())[categoryCode];
      const toExpand = (!categoryStatus || !categoryStatus.expanded);
      if (toExpand) {
        dispatch(toggleCategoryExpanded(categoryCode, true));
      }
      dispatch(toggleLoading('categories'));
      categoryTree = [responses[0].payload].concat(responses[1].payload);
    } else {
      const response = await fetchCategoryChildren(categoryCode)(dispatch);
      categoryTree = response.payload;
    }
    dispatch(setCategories(categoryTree));
  } catch (e) {
    // do nothing
  }
};

export const handleExpandCategory = (categoryCode = ROOT_CODE) => (dispatch, getState) =>
  new Promise((resolve) => {
    const categoryStatus = getStatusMap(getState())[categoryCode];
    const toExpand = (!categoryStatus || !categoryStatus.expanded);
    const toLoad = (toExpand && (!categoryStatus || !categoryStatus.loaded));
    if (toLoad) {
      dispatch(setCategoryLoading(categoryCode));
      dispatch(fetchCategoryTree(categoryCode)).then(() => {
        dispatch(toggleCategoryExpanded(categoryCode, true));
        dispatch(setCategoryLoaded(categoryCode));
      });
    } else {
      dispatch(toggleCategoryExpanded(categoryCode, toExpand));
    }
    resolve();
  });

export const fetchCategory = categoryCode => dispatch =>
  dispatch(fetchCategoryNode(categoryCode)).then((data) => {
    dispatch(initialize('category', data.payload));
  });

export const sendPostCategory = categoryData => (dispatch, getState) => {
  try {
    const { parentCode } = categoryData;
    return dispatch(wrapApiCall(postCategory)(categoryData)).then((data) => {
      dispatch(setCategories([data.payload]));
      const { parentCode: grandParentCode } = getCategoriesMap(getState())[parentCode];
      dispatch(fetchCategoryTree(grandParentCode));
      history.push(ROUTE_CATEGORY_LIST);
    });
  } catch (e) {
    return Promise.resolve();
  }
};

export const sendPutCategory = categoryData => (dispatch) => {
  try {
    return dispatch(wrapApiCall(putCategory)(categoryData)).then((data) => {
      dispatch(setCategories([data.payload]));
      history.push(ROUTE_CATEGORY_LIST);
    });
  } catch (e) {
    return Promise.resolve();
  }
};

export const sendDeleteCategory = categoryCode => (dispatch) => {
  try {
    return dispatch(wrapApiCall(deleteCategory)(categoryCode)).then(() => {
      dispatch(removeCategory(categoryCode));
    });
  } catch (e) {
    return Promise.resolve();
  }
};

export const fetchReferences = (categoryCode, referenceKey, page) => (dispatch) => {
  try {
    return dispatch(wrapApiCall(getReferences)(categoryCode, referenceKey, page)).then((data) => {
      dispatch(setReferences({
        [referenceKey]: data.payload,
      }));
      dispatch(setPage(data.metaData, referenceKey));
    });
  } catch (e) {
    return Promise.resolve();
  }
};

export const fetchCategoryDetail = categoryCode => (dispatch, getState) => {
  try {
    dispatch(toggleLoading('categoryDetail'));
    return dispatch(wrapApiCall(getCategory)(categoryCode)).then((data) => {
      dispatch(setSelectedCategory(data.payload));
      const references = getReferenceKeyList(getState());
      references.forEach((referenceKey) => {
        if (getSelectedRefs(getState())[referenceKey]) {
          dispatch(fetchReferences(categoryCode, referenceKey));
        } else {
          setReferences({
            [referenceKey]: [],
          });
        }
      });
      dispatch(toggleLoading('categoryDetail'));
    });
  } catch (e) {
    dispatch(toggleLoading('categoryDetail'));
    return Promise.resolve();
  }
};

export const initCategoryForm = categoryData => (dispatch) => {
  dispatch(initialize('category', categoryData));
  history.push(ROUTE_CATEGORY_ADD);
};
