import React from 'react';
import { Grid, Row, Col, Button, Breadcrumb } from 'patternfly-react';
import { FormattedMessage } from 'react-intl';
import { BreadcrumbItem } from 'frontend-common-components';

import InternalPage from 'ui/internal-page/InternalPage';
import PageTitle from 'ui/internal-page/PageTitle';
import DataTypeListTableContainer from 'ui/data-types/list/DataTypeListTableContainer';

const ListDataTypePage = () => (
  <InternalPage className="ListDataTypePage">
    <Grid fluid>
      <Row>
        <Col xs={12}>
          <Breadcrumb>
            <BreadcrumbItem>
              <FormattedMessage id="menu.data" />
            </BreadcrumbItem>
            <BreadcrumbItem active>
              <FormattedMessage id="menu.dataType" />
            </BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <PageTitle
            titleId="dataType.list.title"
            helpId="dataType.help"
          />
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          {/* <Link route={}> */}
          <Button
            type="button"
            className="pull-right ListDataTypePage__add"
            bsStyle="primary"
          >
            <FormattedMessage
              id="app.add"
            />
          </Button>
          {/* </Link> */}
        </Col>
      </Row>
      <Row>
        <DataTypeListTableContainer />
      </Row>
      {/* Entity references placeholder */}
    </Grid>
  </InternalPage>
);

export default ListDataTypePage;
