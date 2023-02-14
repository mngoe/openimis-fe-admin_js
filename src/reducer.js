import {
  parseData,
  pageInfo,
  formatServerError,
  formatGraphQLError,
  dispatchMutationResp,
  dispatchMutationErr,
  dispatchMutationReq,
} from "@openimis/fe-core";

import { getUserTypes, mapQueriesUserToStore } from "./utils";

function reducer(
  state = {
    enrolmentOfficers: {
      items: [],
      isFetching: false,
      pageInfo: {
        totalCount: 0,
      },
      error: null,
    },

    usersSummaries: {
      items: [],
      isFetching: false,
      isFetched: false,
      fetched: null,
      pageInfo: {
        totalCount: 0,
      },
      error: null,
    },

    fetchingUser: false,
    fetchedUser: false,
    errorUser: null,
    user: null,
    submittingMutation: false,
    mutation: {},
    reg_dst: [],
    obligatory_user_fields: {},
    obligatory_eo_fields: {}
  },
  action,
) {
  switch (action.type) {
    case "ADMIN_ENROLMENT_OFFICERS_REQ":
      return {
        ...state,
        enrolmentOfficers: {
          ...state.enrolmentOfficers,
          isFetching: true,
        },
      };
    case "ADMIN_ENROLMENT_OFFICERS_RESP":
      return {
        ...state,
        enrolmentOfficers: {
          ...state.enrolmentOfficers,
          isFetching: false,
          pageInfo: pageInfo(action.payload.data.enrolmentOfficers),
          items: parseData(action.payload.data.enrolmentOfficers),
        },
      };
    case "ADMIN_ENROLMENT_OFFICERS_ERR":
      return {
        ...state,
        enrolmentOfficers: {
          ...state.enrolmentOfficers,
          isFetching: false,
          error: formatGraphQLError(action.payload),
        },
      };
    case "ADMIN_USERS_REQ":
      return {
        ...state,
        users: {
          ...state.users,
          isFetching: true,
          fetched: null,
          error: null,
        },
      };
    case "ADMIN_USERS_RESP":
      return {
        ...state,
        users: {
          ...state.users,
          isFetching: false,
          fetched: action.meta,
          items: parseData(action.payload.data.users).map((user) => ({
            ...user,
            userTypes: getUserTypes(user),
          })),
          error: formatGraphQLError(action.payload),
        },
      };
    case "ADMIN_USERS_ERR":
      return {
        ...state,
        users: {
          ...state.users,
          error: formatServerError(action.payload),
          isFetching: false,
          items: [],
        },
      };
    case "ADMIN_USERS_SUMMARIES_REQ":
      return {
        ...state,
        usersSummaries: {
          ...state.usersSummaries,
          isFetching: true,
          isFetched: false,
          error: null,
        },
      };
    case "ADMIN_USERS_SUMMARIES_RESP":
      return {
        ...state,
        usersSummaries: {
          ...state.usersSummaries,
          isFetching: false,
          isFetched: true,
          fetched: action.meta,
          pageInfo: pageInfo(action.payload.data.users),
          items: parseData(action.payload.data.users),
          error: formatGraphQLError(action.payload),
        },
      };
    case "ADMIN_USERS_SUMMARIES_ERR":
      return {
        ...state,
        usersSummaries: {
          ...state.usersSummaries,
          isFetching: false,
          isFetched: true,
          fetched: null,
          items: [],
          error: formatGraphQLError(action.payload),
        },
      };
    case "ADMIN_USER_OVERVIEW_REQ":
      return {
        ...state,
        fetchingUser: true,
        fetchedUser: false,
        errorUser: null,
      };
    case "ADMIN_USER_OVERVIEW_RESP":
      const users = parseData(action.payload.data.users);
      let user = null;
      if (users?.length > 0) {
        [user] = users;
        user = mapQueriesUserToStore(user);
      }
      return {
        ...state,
        fetchingUser: false,
        fetchedUser: true,
        user,
        errorUser: formatGraphQLError(action.payload),
      };
    case "ADMIN_USER_OVERVIEW_ERR":
      return {
        ...state,
        fetchedUser: false,
        errorUser: formatServerError(action.payload),
      };
    case "ADMIN_USER_NEW":
      return {
        ...state,
        usersPageInfo: { totalCount: 0 },
        user: null,
      };
    case "LOCATION_REGION_DISTRICTS_REQ":
      return {
        ...state,
        fetching_reg_dst: true,
        fetched_reg_dst: false,
        reg_dst: [],
        errorL1s: null,
      };
    case "LOCATION_REGION_DISTRICTS_RESP":
      return {
        ...state,
        fetching_reg_dst: false,
        fetfetched_reg_dstchedL1s: true,
        reg_dst: parseData(action.payload.data.locations || action.payload.data.locationsStr),
        errorL1s: formatGraphQLError(action.payload),
      };
    case "LOCATION_REGION_DISTRICTS_ERR":
      return {
        ...state,
        fetching_reg_dst: false,
        errorL1s: formatServerError(action.payload),
      };
    case "LOCATION_REGION_DISTRICTS_CLEAR":
      return {
        ...state,
        reg_dst: []
      };
    case "OBLIGTORY_USER_FIELDS_REQ":
      return {
        ...state,
        fetching_obligatory_user_fields: true,
        fetched_obligatory_user_fields: false,
        obligatory_user_fields: null,
        errorL1s: null,
      };
    case "OBLIGTORY_USER_FIELDS_RESP":
      console.log("USER FILED RESPONSE ", action.payload.data.userObligatoryFields)
      return {
        ...state,
        fetching_obligatory_user_fields: false,
        fetched_obligatory_user_fields: true,
        obligatory_user_fields: action.payload.data.userObligatoryFields,
        errorL1s: formatGraphQLError(action.payload),
      };
    case "OBLIGTORY_USER_FIELDS_ERR":
      return {
        ...state,
        fetching_obligatory_user_fields: false,
        errorL1s: formatServerError(action.payload),
      };
    case "OBLIGTORY_EO_FIELDS_REQ":
      return {
        ...state,
        fetching_obligatory_eo_fields: true,
        fetched_obligatory_eo_fields: false,
        obligatory_eo_fields: null,
        errorL1s: null,
      };
    case "OBLIGTORY_EO_FIELDS_RESP":
      console.log("EO FILED RESPONSE ", action.payload.data.eoObligatoryFields);
      return {
        ...state,
        fetching_obligatory_eo_fields: false,
        fetched_obligatory_eo_fields: true,
        obligatory_eo_fields: action.payload.data.eoObligatoryFields,
        errorL1s: formatGraphQLError(action.payload),
      };
    case "OBLIGTORY_EO_FIELDS_ERR":
      return {
        ...state,
        fetching_obligatory_eo_fields: false,
        errorL1s: formatServerError(action.payload),
      };
    case "ADMIN_USER_MUTATION_REQ":
      return dispatchMutationReq(state, action);
    case "ADMIN_USER_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "ADMIN_USER_UPDATE_RESP":
      return dispatchMutationResp(state, "updateUser", action);
    case "ADMIN_USER_DELETE_RESP":
      return dispatchMutationResp(state, "deleteUser", action);
    case "ADMIN_USER_CREATE_RESP":
      return dispatchMutationResp(state, "createUser", action);
    default:
      return state;
  }
}

export default reducer;
