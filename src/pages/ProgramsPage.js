import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { historyPush, withModulesManager, withHistory, withTooltip, formatMessage } from "@openimis/fe-core";
import ProgramSearcher from "../components/ProgramSearcher";
import { RIGHT_USER_ADD } from "../constants";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class ProgramsPage extends Component {
  onDoubleClick = (u, newTab = false) => {
    historyPush(this.props.modulesManager, this.props.history, "admin.programOverview", [u.id], newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "admin.programNew");
  };

  render() {
    const { classes, rights, intl } = this.props;
    return (
      <div className={classes.page}>
        <ProgramSearcher cacheFiltersKey="programsPageFiltersCache" onDoubleClick={this.onDoubleClick} />
        {rights.includes(RIGHT_USER_ADD) &&
          withTooltip(
            <div className={classes.fab}>
              <Fab color="primary" onClick={this.onAdd}>
                <AddIcon />
              </Fab>
            </div>,
            formatMessage(intl, "admin.program", "addNewProgram.tooltip"),
          )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
});

export default injectIntl(
  withModulesManager(withHistory(connect(mapStateToProps)(withTheme(withStyles(styles)(ProgramsPage))))),
);
