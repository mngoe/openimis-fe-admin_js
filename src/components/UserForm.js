import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import ReplayIcon from "@material-ui/icons/Replay";
import {
  Helmet,
  formatMessageWithValues,
  withModulesManager,
  withHistory,
  historyPush,
  Form,
  ProgressOrError,
  journalize,
  coreConfirm,
  parseData,
} from "@openimis/fe-core";
import { CLAIM_ADMIN_USER_TYPE, ENROLMENT_OFFICER_USER_TYPE, INTERACTIVE_USER_TYPE, RIGHT_USERS } from "../constants";
import EnrolmentOfficerFormPanel from "./EnrolmentOfficerFormPanel";
import ClaimAdministratorFormPanel from "./ClaimAdministratorFormPanel";
import { fetchUser, createUser, fetchUserMutation, fetchRegionDistricts, clearRegionDistricts, fetchObligatoryUserFields, fetchObligatoryEnrolmentOfficerFields } from "../actions";
import UserMasterPanel from "./UserMasterPanel";

const styles = (theme) => ({
  lockedPage: theme.page.locked,
});

const USER_OVERVIEW_MUTATIONS_KEY = "user.UserOverview.mutations";

const setupState = (props) => ({
  isLocked: false,
  user: !props.userId
    ? {
        userTypes: [INTERACTIVE_USER_TYPE],
      }
    : props.user,
});



class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = setupState(props);
  }

  componentDidMount() {
    if (this.props.userId) {
      this.props.fetchUser(this.props.modulesManager, this.props.userId);
    }
    if (!this.state.obligatory_user_fields) {
      this.props.fetchObligatoryUserFields();
    }
    if (!this.state.obligatory_eo_fields) {
      this.props.fetchObligatoryEnrolmentOfficerFields();
    }
  }


  componentDidUpdate(prevProps) {
    if (prevProps.region_districts != this.props.region_districts) {
      if (!!this.props.region_districts) {
        const combined = [
            ...(!!this.state.user.districts? this.state.user.districts : []) ,
            ...this.props.region_districts
        ]
        const no_duplicates = [
            ...new Map(
              combined.map(x => [x.uuid, x])
            ).values()
        ]
        this.state.user.districts = no_duplicates
        this.state.user.region = []
        this.setState((state, props) => ({
          user: {
            ...state.user
          },
        }));
      }
    }

    if (!prevProps.fetchedUser && this.props.fetchedUser) {
      this.setState(setupState(this.props));
    } else if (prevProps.userId && !this.props.userId) {
      this.setState(setupState(this.props));
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state, props) => ({
        user: {
          ...state.user,
          clientMutationId: props.mutation.clientMutationId,
        },
      }));
    } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
      this.state.confirmedAction();
    }
  }

  reload = () => {
    const { clientMutationId } = this.props.mutation;
    if (clientMutationId) {
      this.props.fetchUserMutation(this.props.modulesManager, clientMutationId).then((res) => {
        const mutationLogs = parseData(res.payload.data.mutationLogs);
        if (
          mutationLogs &&
          mutationLogs[0] &&
          mutationLogs[0].users &&
          mutationLogs[0].users[0] &&
          mutationLogs[0].users[0].coreUser
        ) {
          const { id } = parseData(res.payload.data.mutationLogs)[0].users[0].coreUser;
          if (id) {
            historyPush(this.props.modulesManager, this.props.history, "admin.userOverview", [id]);
          }
        }
      });
    }
  };

  canSave = () => {
    const { user } = this.state;

    if (!user) return false;
    if (
      !(
        user.lastName &&
        user.otherNames &&
        user.username &&
        user.roles?.length &&
        user.districts?.length > 0 &&
        user.language &&
        user.programs?.length > 0
      )
    )
      return false;
    if (user.password && user.password !== user.confirmPassword) return false;
    // if (user.userTypes?.includes(CLAIM_ADMIN_USER_TYPE) && !user.healthFacility) return false;
    if (user.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && !user.officerVillages) return false;

    if (
      (this.props.obligatory_user_fields?.email == 'M' || (user.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && this.props.obligatory_eo_fields?.email == 'M'))
      && !user.email) return false;
    if (
      (this.props.obligatory_user_fields?.phone == 'M' || (user.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && this.props.obligatory_eo_fields?.phone == 'M'))
      && !user.phoneNumber) return false;

    return true;
  };

  save = (user) => {
    this.setState({ isLocked: true });
    this.props.save(user);
  };

  onEditedChanged = (user) => {
    if (!!user.region){
      user.region.forEach((region) => {
        this.props.fetchRegionDistricts(region)
      });
    } else {
      this.props.clearRegionDistricts()
    }
    this.setState({ user });
  };

  onActionToConfirm = (title, message, confirmedAction) => {
    this.setState({ confirmedAction }, this.props.coreConfirm(title, message));
  };

  render() {
    const {
      modulesManager,
      classes,
      state,
      rights,
      userId,
      fetchingUser,
      errorUser,
      readOnly = false,
      add,
      save,
      back,
      region_districts,
      obligatory_user_fields,
      obligatory_eo_fields
    } = this.props;
    const { user } = this.state;

    if (!rights.includes(RIGHT_USERS)) return null;

    const isInMutation =
      user?.clientMutationId ||
      modulesManager.getContribs(USER_OVERVIEW_MUTATIONS_KEY).some((mutation) => mutation(state));

    const actions = [
      !userId && {
        doIt: this.reload,
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly && !isInMutation,
      },
    ].filter(Boolean);
    return (
      <div className={isInMutation ? classes.lockedPage : null}>
        <Helmet title={formatMessageWithValues(this.props.intl, "admin.user", "UserOverview.title", { label: "" })} />
        <ProgressOrError progress={fetchingUser} error={errorUser} />
        {(!userId || user?.id === userId) && (
          <Form
            module="user"
            title={userId ? "admin.user.UserOverview.title" : "admin.user.UserOverview.newTitle"}
            edited_id={userId}
            edited={user}
            back={back}
            add={add}
            readOnly={readOnly || isInMutation || user?.validityTo}
            actions={actions}
            HeadPanel={UserMasterPanel}
            Panels={[EnrolmentOfficerFormPanel, ClaimAdministratorFormPanel]}
            user={user}
            onEditedChanged={this.onEditedChanged}
            canSave={this.canSave}
            save={save ? this.save : null}
            onActionToConfirm={this.onActionToConfirm}
            obligatory_user_fields={obligatory_user_fields}
            obligatory_eo_fields={obligatory_eo_fields}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  fetchingUser: state.admin.fetchingUser,
  errorUser: state.admin.errorUser,
  fetchedUser: state.admin.fetchedUser,
  submittingMutation: state.admin.submittingMutation,
  mutation: state.admin.mutation,
  user: state.admin.user,
  region_districts: state.admin.reg_dst,
  confirmed: state.core.confirmed,
  obligatory_user_fields: state.admin.obligatory_user_fields,
  obligatory_eo_fields: state.admin.obligatory_eo_fields
});


const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchUser,
      createUser,
      fetchUserMutation,
      fetchRegionDistricts,
      clearRegionDistricts,
      fetchObligatoryUserFields,
      fetchObligatoryEnrolmentOfficerFields,
      journalize,
      coreConfirm,
    },
    dispatch,
  );

export default withHistory(
  withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(UserForm))))),
);
