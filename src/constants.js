export const RIGHT_PRODUCTS = 121001;
export const RIGHT_HEALTHFACILITIES = 121101;
export const RIGHT_PRICELISTMS = 121201;
export const RIGHT_PRICELISTMI = 121301;
export const RIGHT_MEDICALSERVICES = 121401;
export const RIGHT_MEDICALITEMS = 122101;
export const RIGHT_ENROLMENTOFFICER = 121501;
export const RIGHT_CLAIMADMINISTRATOR = 121601;
export const RIGHT_PAYERS = 121801;
export const RIGHT_LOCATIONS = 121901;

export const RIGHT_USERS = 121701;
export const RIGHT_USER_SEARCH = 121701;
export const RIGHT_USER_ADD = 121702;
export const RIGHT_USER_EDIT = 121703;
export const RIGHT_USER_DELETE = 121704;

export const RIGHT_PROGRAMS = 121701;
export const RIGHT_PROGRAM_DELETE = 121701;
export const RIGHT_PROGRAM_ADD = 121702;

export const INTERACTIVE_USER_TYPE = "INTERACTIVE";

// Nothing about the User Business Access credentials is declared here: the codes, their
// labels and the '<app_label>.<model>' they may be used on come from the backend registry
// (`useUbaLinkTypes` in @openimis/fe-core, the `ubaLinkTypes` query), and which picker
// selects an object of a given type from the business object registry of the core module.

export const ENROLMENT_OFFICER_USER_TYPE = "OFFICER";
export const CLAIM_ADMIN_USER_TYPE = "CLAIM_ADMIN";
export const MODULE_NAME = "user";

export const DEFAULT = {
  RENDER_LAST_NAME_FIRST: true,
};

// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
export const EMAIL_REGEX_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const USER_TYPES = (rights) => {
  const baseTypes = [INTERACTIVE_USER_TYPE];
  if (rights.includes(RIGHT_ENROLMENTOFFICER)) {
    baseTypes.push(ENROLMENT_OFFICER_USER_TYPE);
    if (rights.includes(RIGHT_CLAIMADMINISTRATOR)) {
      baseTypes.push(CLAIM_ADMIN_USER_TYPE);
    }
  }
  return baseTypes;
};
