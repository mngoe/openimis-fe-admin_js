import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Grid } from "@material-ui/core";
import { withModulesManager, ControlledField, TextInput } from "@openimis/fe-core";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: "0 0 10px 0",
    width: "100%",
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
});

class ProgramFilter extends Component {

  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-admin", "debounceTime", 800),
  );

  filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  onChangeShowHistory = () => {
    const filters = [
      {
        id: "showHistory",
        value: !this.state.showHistory,
        filter: `showHistory: ${!this.state.showHistory}`,
      },
    ];
    this.props.onChangeFilters(filters);
    this.setState((state) => ({
      showHistory: !state.showHistory,
    }));
  };

  render() {
    const { classes, onChangeFilters } = this.props;
    return (
      <section className={classes.form}>
        <Grid container>
          <ControlledField
            module="admin"
            id="programFilter.programName"
            field={
              <Grid item xs={3} className={classes.item}>
                <TextInput
                  module="program"
                  label="admin.program.name"
                  name="name"
                  value={this.filterValue("nameProgram")}
                  onChange={(v) =>
                    this.debouncedOnChangeFilter([
                      {
                        id: "nameProgram",
                        value: v,
                        filter: `nameProgram_Icontains: "${v}"`,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
        </Grid>
      </section>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(ProgramFilter))));
