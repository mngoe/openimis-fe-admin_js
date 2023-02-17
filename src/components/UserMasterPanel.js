import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Grid, Divider, Typography } from "@material-ui/core";
import { withModulesManager, useTranslations, TextInput, PublishedComponent, combine } from "@openimis/fe-core";
import { CLAIM_ADMIN_USER_TYPE, ENROLMENT_OFFICER_USER_TYPE } from "../constants";

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
  sectionHeader: {
    ...theme.paper.item,
    paddingBottom: 0,
  },
  sectionTitle: theme.typography.title,
});

const UserMasterPanel = (props) => {
  const {intl, classes, edited, readOnly, onEditedChanged, modulesManager, obligatoryUserFields, obligatoryEOFields } =
    props;
  const { formatMessage } = useTranslations("admin", modulesManager);

  return (
    <Grid container direction="row">
      <Grid item xs={4} className={classes.item}>
        <TextInput
          module="admin"
          required
          label="user.username"
          readOnly={Boolean(edited.id) || readOnly}
          value={edited?.username ?? ""}
          onChange={(username) => onEditedChanged({ ...edited, username })}
        />
      </Grid>
      <Grid item xs={4} className={classes.item}>
        <TextInput
          module="admin"
          label="user.givenNames"
          required
          readOnly={readOnly}
          value={edited?.otherNames ?? ""}
          onChange={(otherNames) => onEditedChanged({ ...edited, otherNames })}
        />
      </Grid>
      <Grid item xs={4} className={classes.item}>
        <TextInput
          module="admin"
          label="user.lastName"
          required
          readOnly={readOnly}
          value={edited?.lastName ?? ""}
          onChange={(lastName) => onEditedChanged({ ...edited, lastName })}
        />
      </Grid>
      {!(
        obligatoryUserFields?.email == "H" ||
        (edited.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && obligatoryEOFields?.email == "H")
      ) && (
          <Grid item xs={4} className={classes.item}>
            <TextInput
              module="admin"
              type="email"
              label="user.email"
              required={
                obligatoryUserFields?.email == "M" ||
                (edited.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && obligatoryEOFields?.email == "M")
              }
              readOnly={readOnly}
              value={edited?.email ?? ""}
              onChange={(email) => onEditedChanged({ ...edited, email })}
            />
          </Grid>
        )}
      {!(
        obligatoryUserFields?.phone == "H" ||
        (edited.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && obligatoryEOFields?.phone == "H")
      ) && (
          <Grid item xs={4} className={classes.item}>
            <TextInput
              module="admin"
              type="phone"
              label="user.phone"
              required={
                obligatoryUserFields?.phone == "M" ||
                (edited.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && obligatoryEOFields?.phone == "M")
              }
              readOnly={readOnly}
              value={edited?.phoneNumber ?? ""}
              onChange={(phoneNumber) => onEditedChanged({ ...edited, phoneNumber })}
            />
          </Grid>
        )}
      <Grid item xs={4} className={classes.item}>
        <PublishedComponent
          pubRef="location.HealthFacilityPicker"
          value={edited?.healthFacility}
          district={edited.districts}
          module="admin"
          readOnly={readOnly}
          required={
            edited.userTypes.includes(
              CLAIM_ADMIN_USER_TYPE,
            ) /* This field is also present in the claim administrator panel */
          }
          onChange={(healthFacility) => onEditedChanged({ ...edited, healthFacility })}
        />
      </Grid>
      <Grid item xs={6} className={classes.item}>
        <PublishedComponent
          pubRef="admin.UserRolesPicker"
          required
          value={edited?.roles ?? []}
          module="admin"
          readOnly={readOnly}
          onChange={(roles) => onEditedChanged({ ...edited, roles })}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="location.LocationPicker"
          locationLevel={0}
          value={edited.region}
          onChange={(region) => onEditedChanged({ ...edited, region })}
          readOnly={readOnly}
          required
          multiple
          withLabel
          label={formatMessage("user.regions")}
        />
      </Grid>
      <Grid item xs={4} className={classes.item}>
        <PublishedComponent
          pubRef="location.LocationPicker"
          locationLevel={1}
          value={edited.districts}
          onChange={(districts) => onEditedChanged({ ...edited, districts })}
          readOnly={readOnly}
          required
          multiple
          withLabel
          label={formatMessage("user.districts")}
        />
      </Grid>
      <Grid item xs={4} className={classes.item}>
        <PublishedComponent
          pubRef="program.ProgramPicker"
          name="program"
          label={formatMessage("user.programPicker.label")}
          placeholder={formatMessage("user.programPicker.placeholder")}
          value={edited?.programs?? []}
          required={true}
          multiple={true}
          readOnly={readOnly}
          onChange={(programs) => onEditedChanged({ ...edited, programs})}
        />
      </Grid>
      <Grid item xs={12} className={classes.sectionHeader}>
        <Typography className={classes.sectionTitle}>{formatMessage("UserMasterPanel.loginDetailsTitle")}</Typography>
        <Divider variant="fullWidth" />
      </Grid>
      <Grid item xs={4} className={classes.item}>
        <PublishedComponent
          pubRef="core.LanguagePicker"
          module="admin"
          label="user.language"
          readOnly={readOnly}
          required
          withNull
          nullLabel={formatMessage("UserMasterPanel.language.null")}
          value={edited?.language}
          onChange={(language) => onEditedChanged({ ...edited, language })}
        />
      </Grid>
      <Grid item xs={4} className={classes.item}>
        <TextInput
          module="admin"
          type="password"
          label="user.newPassword"
          readOnly={readOnly}
          value=""
          onChange={(password) => onEditedChanged({ ...edited, password })}
        />
      </Grid>
      <Grid item xs={4} className={classes.item}>
        <TextInput
          module="admin"
          type="password"
          label="user.confirmNewPassword"
          required={edited.password}
          readOnly={readOnly}
          value=""
          onChange={(confirmPassword) => onEditedChanged({ ...edited, confirmPassword })}
        />
      </Grid>
    </Grid>
  );
};

const enhance = combine( withModulesManager, withTheme, withStyles(styles));

export default enhance(UserMasterPanel);
