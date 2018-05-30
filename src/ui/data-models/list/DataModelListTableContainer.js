import { connect } from 'react-redux';
import { gotoRoute } from '@entando/router';

import { fetchDataModelListPaged } from 'state/data-models/actions';
import { getCurrentPage, getTotalItems, getPageSize } from 'state/pagination/selectors';
import DataModelListTable from 'ui/data-models/list/DataModelListTable';
import { getListDataModels } from 'state/data-models/selectors';
import { getLoading } from 'state/loading/selectors';
import { ROUTE_DATA_MODEL_EDIT } from 'app-init/router';


export const mapStateToProps = state => (
  {
    dataModels: getListDataModels(state),
    page: getCurrentPage(state),
    totalItems: getTotalItems(state),
    pageSize: getPageSize(state),
    loading: getLoading(state).dataModel,
  }
);

export const mapDispatchToProps = dispatch => ({
  onWillMount: (page) => {
    dispatch(fetchDataModelListPaged(page));
  },
  onClickEdit: (dataModelId) => {
    gotoRoute(ROUTE_DATA_MODEL_EDIT, { dataModelId });
  },
});

const DataModelListTableContainer =
 connect(mapStateToProps, mapDispatchToProps)(DataModelListTable);
export default DataModelListTableContainer;
