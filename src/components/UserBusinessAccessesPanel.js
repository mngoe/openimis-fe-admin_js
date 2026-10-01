import React from "react";

import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  IconButton,
  Button,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";

import {
  BusinessObjectPicker,
  businessObjectReferenceKey,
  combine,
  getBusinessObjectModels,
  ProgressOrError,
  SelectInput,
  useBusinessObjects,
  useTranslations,
  useUbaLinkTypes,
  withModulesManager,
} from "@openimis/fe-core";

const styles = (theme) => ({
  item: theme.paper.item,
  paper: theme.paper.paper,
  title: theme.paper.title,
  header: theme.table.header,
  headerTitle: theme.table.title,
  actionCell: {
    width: 60,
  },
  footer: {
    marginInline: 16,
    marginBlock: 12,
  },
  hint: {
    opacity: 0.8,
  },
});

/**
 * The business accesses (UBA) of a user: "this user acts under that credential on that
 * business object". It replaces the claim administrator and enrolment officer sections:
 * a claim admin is a user linked to a health facility under the CLAIM_ADMIN credential,
 * an enrolment officer a user linked to villages under ENROLMENT, and the backend
 * derives both dedicated records from these links.
 *
 * A credential (`linkType`) is a code from the backend registry, queried here, not a
 * role: attaching a health facility no longer pulls the standard claim admin role onto
 * the user. Rights keep coming from the roles, the UBA-flagged ones only applying where
 * the user holds a link.
 *
 * The panel edits `edited.businessAccesses`, sent as the whole set: the links left out
 * are closed by the backend. A row already saved is shown read only, since only its
 * business object id comes back from the API - removing and adding it again is the way
 * to change it.
 *
 * Which picker selects an object of a given type, and how such an object is read back
 * from the identifier a stored link carries, is not known here: both come from the
 * business object registry of the core module (`helpers/business-objects.js`), so a
 * module registering a credential on its own model only has to register that model for
 * this panel to offer it. The objects of the saved links are named by one batched query.
 */
const UserBusinessAccessesPanel = (props) => {
  const { edited, onEditedChanged, readOnly, classes, modulesManager } = props;
  const { formatMessage } = useTranslations("admin.UserBusinessAccessesPanel", modulesManager);

  // the credentials come from the backend registry, labelled by the translation of their
  // code when the deployment carries one: nothing here names a credential
  const { linkTypes, isLoading, error, labelOf } = useUbaLinkTypes();
  const businessAccesses = edited?.businessAccesses ?? [];

  const update = (rows) => onEditedChanged({ ...edited, businessAccesses: rows });
  const updateRow = (index, changes) =>
    update(businessAccesses.map((row, idx) => (idx === index ? { ...row, ...changes } : row)));
  const addRow = () => update([...businessAccesses, {}]);
  const removeRow = (index) => update(businessAccesses.filter((_, idx) => idx !== index));

  const findLinkType = (code) => linkTypes.find((linkType) => linkType.code === code);

  /**
   * The models a credential may be used on, none declared in the backend registry
   * meaning any: the business object types the frontend can pick then.
   */
  const modelsOf = (code) => {
    const models = findLinkType(code)?.models;
    return models?.length ? models : getBusinessObjectModels();
  };

  /** The type of the object a row points at, implied by its credential when unique. */
  const modelOf = (row) => row.businessObjectModel ?? (modelsOf(row.linkType).length === 1 ? modelsOf(row.linkType)[0] : null);

  // a saved row carries the label the backend registry gave it, kept as the fallback of
  // the translated one
  const linkTypeLabel = (row) => labelOf(row.linkType, row.linkTypeLabel);

  const onLinkTypeChanged = (index, code) => {
    const models = modelsOf(code);
    // a credential usable on a single model needs no further question
    updateRow(index, {
      linkType: code,
      businessObjectModel: models.length === 1 ? models[0] : null,
      object: null,
      objectId: null,
    });
  };

  const onObjectPicked = (index, object, objectId) => updateRow(index, { object, objectId });

  // a saved link only carries the identifier of its object: name them all in one query,
  // through the projection their type registered, rather than showing raw identifiers
  const { objects: savedObjects } = useBusinessObjects(
    businessAccesses
      .filter((row) => !!row.id && !row.object)
      .map((row) => ({ model: row.businessObjectModel, objectId: row.objectId })),
  );

  const objectOf = (row) =>
    row.object ?? savedObjects[businessObjectReferenceKey(row.businessObjectModel, row.objectId)] ?? null;

  const renderLinkTypeCell = (row, index) => (
    <SelectInput
      module="admin"
      strLabel=""
      withLabel={false}
      required
      readOnly={readOnly}
      options={linkTypes.map((linkType) => ({ value: linkType.code, label: linkType.label }))}
      value={row.linkType ?? null}
      onChange={(code) => onLinkTypeChanged(index, code)}
    />
  );

  /**
   * A credential usable on several types still has to say which one, so the choice sits
   * in the object cell itself rather than in a column of its own.
   */
  const renderModelChoice = (row, index) => {
    const models = modelsOf(row.linkType);
    if (!row.linkType || models.length <= 1) return null;
    return (
      <SelectInput
        module="admin"
        strLabel=""
        withLabel={false}
        required
        readOnly={readOnly}
        options={models.map((model) => ({ value: model, label: model }))}
        value={row.businessObjectModel ?? null}
        onChange={(model) => updateRow(index, { businessObjectModel: model, object: null, objectId: null })}
      />
    );
  };

  const renderObjectCell = (row, index) => {
    const model = modelOf(row);
    if (!model) return renderModelChoice(row, index);
    return (
      <>
        {renderModelChoice(row, index)}
        <BusinessObjectPicker
          model={model}
          value={objectOf(row)}
          objectId={row.objectId ?? null}
          // a saved link is named, not re-picked: removing and adding the row is the way
          // to change it, which is also what the backend does with the set it receives
          readOnly={readOnly || !!row.id}
          required
          district={edited?.districts}
          onChange={(object, objectId) => onObjectPicked(index, object, objectId)}
        />
      </>
    );
  };

  return (
    <Paper className={classes.paper}>
      <Grid item xs={12} className={classes.title}>
        <Typography variant="h6">{formatMessage("title")}</Typography>
        <Typography variant="caption" className={classes.hint}>
          {formatMessage("hint")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TableContainer>
          <Table size="small">
            <TableHead className={classes.header}>
              <TableRow className={classes.headerTitle}>
                <TableCell>{formatMessage("table.linkType")}</TableCell>
                <TableCell>{formatMessage("table.businessObject")}</TableCell>
                <TableCell className={classes.actionCell} />
              </TableRow>
            </TableHead>
            <TableBody>
              <ProgressOrError progress={isLoading} error={error} />
              {businessAccesses.map((row, index) =>
                row.id ? (
                  <TableRow key={row.id}>
                    <TableCell>{linkTypeLabel(row)}</TableCell>
                    <TableCell>{renderObjectCell(row, index)}</TableCell>
                    <TableCell className={classes.actionCell}>
                      <IconButton disabled={readOnly} onClick={() => removeRow(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ) : (
                  // eslint-disable-next-line react/no-array-index-key
                  <TableRow key={`new-business-access-${index}`}>
                    <TableCell>{renderLinkTypeCell(row, index)}</TableCell>
                    <TableCell>{renderObjectCell(row, index)}</TableCell>
                    <TableCell className={classes.actionCell}>
                      <IconButton disabled={readOnly} onClick={() => removeRow(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
            <TableFooter>
              <Button
                disabled={readOnly || isLoading || !linkTypes.length}
                variant="contained"
                onClick={addRow}
                startIcon={<AddIcon />}
                className={classes.footer}
              >
                {formatMessage("table.newRow")}
              </Button>
            </TableFooter>
          </Table>
        </TableContainer>
      </Grid>
    </Paper>
  );
};

const enhance = combine(withModulesManager, withTheme, withStyles(styles));

export default enhance(UserBusinessAccessesPanel);
