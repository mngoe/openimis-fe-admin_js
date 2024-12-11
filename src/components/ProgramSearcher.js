import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { IconButton, Tooltip } from "@material-ui/core";
import { Tab as TabIcon, Delete as DeleteIcon } from "@material-ui/icons";
import {
  withModulesManager,
  formatMessageWithValues,
  formatMessage,
  Searcher,
  ConfirmDialog,
} from "@openimis/fe-core";
import ProgramFilter from "./ProgramFilter";

import { fetchProgramsSummaries, deleteProgram } from "../actions";
import { RIGHT_PROGRAM_DELETE } from "../constants";

const PROGRAM_SEARCHER_CONTRIBUTION_KEY = "program.ProgramSearcher";

const getHeaders = () => [
  "admin.program.name",
  "admin.program.validity",
  "",
];

const getSorts = () => [
  ["nameProgram", true],
  ["validityDate", false],
];

const getAligns = () => {
  const aligns = getHeaders().map(() => null);
  aligns.splice(-1, 1, "right");
  return aligns;
};

class ProgramSearcher extends Component {
  state = {
    deleteUser: null,
    params: {},
  };

  fetch = (params) => {
    this.setState({ params });
    this.props.fetchProgramsSummaries(this.props.modulesManager, params);
  };

  filtersToQueryParams = (state) => {
    const prms = Object.keys(state.filters)
      .filter((contrib) => !!state.filters[contrib].filter)
      .map((contrib) => state.filters[contrib].filter);
    prms.push(`first: ${state.pageSize}`);
    if (state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
    }
    if (state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
    }
    if (state.orderBy) {
      prms.push(`orderBy: ["${state.orderBy}"]`);
    }
    return prms;
  };

  deleteProgram = (isConfirmed) => {
    if (!isConfirmed) {
      this.setState({ deleteUser: null });
    } else {
      const user = this.state.deleteUser;
      this.setState({ deleteUser: null }, async () => {
        await this.props.deleteUser(
          this.props.modulesManager,
          user,
          formatMessage(this.props.intl, "admin.program", "deleteDialog.title"),
        );
        this.fetch(this.state.params);
      });
    }
  };

  itemFormatters = () => {
    const formatters = [
      (u) => u.nameProgram,
      (u) => u.validityDate,
      (u) => (
        <>
          <Tooltip title={formatMessage(this.props.intl, "admin.program", "openNewTab")}>
            <IconButton onClick={() => this.props.onDoubleClick(u, true)}>
              <TabIcon />
            </IconButton>
          </Tooltip>
          {this.props.rights.includes(RIGHT_PROGRAM_DELETE) && u.validityTo ? null : (
            <Tooltip title={formatMessage(this.props.intl, "admin.program", "deleteUser.tooltip")}>
              <IconButton onClick={() => this.setState({ deleteUser: u })}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      ),
    ];

    return formatters;
  };

  render() {
    const { intl, programs, programsPageInfo, fetchingPrograms, fetchedPrograms, errorPrograms, cacheFiltersKey, onDoubleClick } =
      this.props;
    return (
      <>
        {this.state.deleteUser && (
          <ConfirmDialog
            confirm={{
              title: formatMessage(intl, "admin.program", "deleteDialog.title"),
              message: formatMessage(intl, "admin.program", "deleteDialog.message"),
            }}
            onConfirm={this.deleteProgram}
          />
        )}
        <Searcher
          module="program"
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={ProgramFilter}
          items={programs}
          itemsPageInfo={programsPageInfo}
          fetchingItems={fetchingPrograms}
          fetchedItems={fetchedPrograms}
          errorItems={errorPrograms}
          contributionKey={PROGRAM_SEARCHER_CONTRIBUTION_KEY}
          tableTitle={formatMessageWithValues(intl, "admin.program", "programSummaries", {
            count: programsPageInfo.totalCount,
          })}
          fetch={this.fetch}
          rowIdentifier={(r) => r.uuid}
          filtersToQueryParams={this.filtersToQueryParams}
          headers={getHeaders}
          aligns={getAligns}
          itemFormatters={this.itemFormatters}
          sorts={getSorts}
          rowDisabled={(_, i) => i.validityTo || i.clientMutationId}
          rowLocked={(_, i) => i.clientMutationId}
          onDoubleClick={onDoubleClick}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.i_user?.rights ?? [],
  programs: state.admin.programsSummaries.items,
  programsPageInfo: state.admin.programsSummaries.pageInfo,
  fetchingPrograms: state.admin.programsSummaries.isFetching,
  fetchedPrograms: state.admin.programsSummaries.fetched,
  errorPrograms: state.admin.programsSummaries.error,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchProgramsSummaries, deleteProgram }, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(ProgramSearcher)));
