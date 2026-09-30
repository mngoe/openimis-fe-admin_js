import { decodeId, parseData, getUserBusinessAccesses } from "@openimis/fe-core";
import { fetchSubstitutionEnrolmentOfficers } from "./actions";
import { INTERACTIVE_USER_TYPE } from "./constants";

/**
 * The business accesses (UBA links) of a user, as the form edits them:
 * `{ id, linkType, linkTypeLabel, businessObjectModel, objectId }`. A saved row keeps its
 * `id`, a row added in the form has none and carries the picked `object` as well.
 *
 * Closing a link only deactivates it, and the query returns those rows as well, so the
 * inactive ones are dropped here: they must not come back in the set the form sends.
 */
export const mapBusinessAccessesToStore = (u) =>
  parseData(u.businessAccesses)
    .filter((businessAccess) => businessAccess.active !== false)
    .map((businessAccess) => ({
      id: businessAccess.id,
      uuid: businessAccess.uuid,
      linkType: businessAccess.linkType,
      linkTypeLabel: businessAccess.linkTypeLabel,
      businessObjectModel: businessAccess.businessObjectModel,
      objectId: businessAccess.objectId,
    }));

/**
 * Does the user hold at least one business access (UBA link) ? Whichever credential it
 * is: the codes belong to the backend registry, so nothing here names one, and the
 * obligatory field rules a deployment configures for a linked user apply to all of them.
 *
 * The form edits the links it is about to save, so they are read from the edited user
 * when it carries them, and from the current user payload otherwise.
 */
export const hasUBA = (user) => {
  if (!user) return false;
  return Array.isArray(user.businessAccesses)
    ? user.businessAccesses.length > 0
    : getUserBusinessAccesses(user).length > 0;
};

/** A link the backend can store: a credential, a model and an object. */
export const isBusinessAccessComplete = (businessAccess) =>
  !!businessAccess?.linkType && !!businessAccess?.businessObjectModel && !!businessAccess?.objectId;

export const mapQueriesUserToStore = (u) => {
  // TODO: make this more generic
  u.hasLogin = false;
  // the user types are no longer derived from the roles: a claim admin or an enrolment
  // officer is a user holding the matching credential on a business object, which the
  // business accesses below carry
  u.userTypes = [INTERACTIVE_USER_TYPE];
  u.businessAccesses = mapBusinessAccessesToStore(u);
  if (u.iUser) {
    u.hasLogin = true;
    u.lastName = u.iUser.lastName;
    u.otherNames = u.iUser.otherNames;
    u.email = u.iUser.email;
    u.phoneNumber = u.iUser.phone;
    u.healthFacility = u.iUser.healthFacility;
    u.language = u.iUser.languageId;
    u.roles = u.iUser.roles;
    u.districts = u.iUser.districts.map((d) => d.location);
    u.programs = u.iUser.programSet.edges.map((p) => p.node);
  }
  // the claim admin and enrolment officer records are derived by the backend from the
  // CLAIM_ADMIN / ENROLMENT links: only the personal details of a user without an
  // interactive user are still read from them
  if (u.claimAdmin) {
    u.hasLogin = u.hasLogin || u.claimAdmin.hasLogin;
    u.lastName = u.lastName ?? u.claimAdmin.lastName;
    u.otherNames = u.otherNames ?? u.claimAdmin.otherNames;
    u.email = u.email ?? u.claimAdmin.emailId;
    u.phoneNumber = u.phoneNumber ?? u.claimAdmin.phone;
    u.birthDate = u.birthDate ?? u.claimAdmin.dob;
  }
  if (u.officer) {
    u.hasLogin = u.hasLogin || u.officer.hasLogin;
    u.lastName = u.lastName ?? u.officer.lastName;
    u.otherNames = u.otherNames ?? u.officer.otherNames;
    u.email = u.email ?? u.officer.email;
    u.phoneNumber = u.phoneNumber ?? u.officer.phone;
    u.birthDate = u.birthDate ?? u.officer.dob;
  }
  return u;
};

export const mapUserValuesToInput = (values) => {
  const input = {
    uuid: values.id ? decodeId(values.id) : null,
    username: values.username,
    userTypes: values.userTypes ?? [INTERACTIVE_USER_TYPE],
    lastName: values.lastName,
    otherNames: values.otherNames,
    phone: values.phoneNumber,
    email: values.email,
    password: values.password,
    healthFacilityId: values.healthFacility ? decodeId(values.healthFacility.id) : null,
    // there is no date of birth on the interactive user: it is stored on the claim admin /
    // enrolment officer record the backend derives from the business accesses, so it only
    // persists for a user holding one of those links
    birthDate: values.birthDate,
    districts: values.districts.map((d) => decodeId(d.id)),
    language: values.language,
    roles: values.roles.map((r) => decodeId(r.id)),
    programs: values.programs.map((p) => decodeId(p.id)),
    // the whole set of links: the ones left out are closed by the backend, which then
    // derives the claim admin and enrolment officer records from them
    businessAccesses: (values.businessAccesses ?? []).filter(isBusinessAccessComplete).map((businessAccess) => ({
      linkType: businessAccess.linkType,
      businessObjectModel: businessAccess.businessObjectModel,
      objectId: String(businessAccess.objectId),
    })),
  };
  return input;
};

export const fetchSubstitutionEOs = (dispatch, mm, officerUuid, searchString, villages) => {
  dispatch(
    fetchSubstitutionEnrolmentOfficers(mm, {
      officerUuid,
      first: searchString ? undefined : 15,
      villagesUuids: villages?.map((village) => village.uuid),
      str: searchString,
    }),
  );
};
