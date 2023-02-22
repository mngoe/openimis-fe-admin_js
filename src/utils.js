import { CLAIM_ADMIN_USER_TYPE, INTERACTIVE_USER_TYPE, ENROLMENT_OFFICER_USER_TYPE } from "./constants";
import { decodeId } from "@openimis/fe-core";

export const getUserTypes = (user) => {
  // We force from now on all users to be interactive
  const userTypes = [INTERACTIVE_USER_TYPE];
  if (user.officer?.id) {
    userTypes.push(ENROLMENT_OFFICER_USER_TYPE);
  }
  if (user.claimAdmin?.id) {
    userTypes.push(CLAIM_ADMIN_USER_TYPE);
  }
  return userTypes;
};

export const mapQueriesUserToStore = (u) => {
  // TODO: make this more generic
  u.hasLogin = false;
  u.userTypes = getUserTypes(u);
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
  if (u.claimAdmin) {
    u.hasLogin = u.hasLogin || u.claimAdmin.hasLogin;
    u.lastName = u.claimAdmin.lastName;
    u.otherNames = u.claimAdmin.otherNames;
    u.email = u.email ?? u.claimAdmin.emailId;
    u.phoneNumber = u.claimAdmin.phone;
    u.birthDate = u.claimAdmin.dob;
    u.healthFacility = u.claimAdmin.healthFacility;
  }
  if (u.officer) {
    u.hasLogin = u.hasLogin || u.officer.hasLogin;
    u.lastName = u.officer.lastName;
    u.otherNames = u.officer.otherNames;
    u.email = u.email ?? u.officer.email;
    u.phoneNumber = u.officer.phone;
    u.birthDate = u.officer.dob;
    u.address = u.officer.address;
    u.substitutionOfficer = u.officer.substitutionOfficer;
    // substitutionOfficer is user.officer so it cannot be retrieved using the UserPicker
    u.worksTo = u.officer.worksTo;
    u.location = u.officer.location;
    u.officerVillages = u.officer.officerVillages.map((x) => x.location);
  }
  return u;
};

export const mapUserValuesToInput = (values) => {
  const input = {
    uuid: values.id ? decodeId(values.id) : null,
    username: values.username,
    userTypes: values.userTypes,
    lastName: values.lastName,
    otherNames: values.otherNames,
    phone: values.phoneNumber,
    email: values.email,
    password: values.password,
    healthFacilityId: values.healthFacility ? decodeId(values.healthFacility.id) : null,
    districts: values.districts.map((d) => decodeId(d.id)),
    locationId: values.location ? decodeId(values.location.id) : null,
    language: values.language,
    roles: values.roles.map((r) => decodeId(r.id)),
    programs: values.programs.map((p) => decodeId(p.id)),
    birthDate: values.birthDate,
    address: values.address,
    substitutionOfficerId: values.substitutionOfficer?.id ? decodeId(values.substitutionOfficer.id) : null,
    worksTo: values.worksTo,
    villageIds: values.officerVillages?.map((location) => decodeId(location.id)),
  };
  return input;
};

export const toggleUserType = (user, type) => {
  if (!user.userTypes) {
    // eslint-disable-next-line no-param-reassign
    user.userTypes = [];
  }

  if (user.userTypes.includes(type)) {
    // eslint-disable-next-line no-param-reassign
    user.userTypes = user.userTypes.filter((x) => x !== type);
  } else {
    user.userTypes.push(type);
  }

  return user;
};
