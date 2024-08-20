import AdminMainMenu from "./components/AdminMainMenu";
import UsersPage from "./pages/UsersPage";
import UserPage from "./pages/UserPage";
import messagesEn from "./translations/en.json";
import UserPicker from "./components/pickers/UserPicker";
import EnrolmentOfficerPicker from "./components/pickers/EnrolmentOfficerPicker";
import SubstitutionEnrolmentOfficerPicker from "./components/pickers/SubstitutionEnrolmentOfficerPicker";
import UserRolesPicker from "./components/pickers/UserRolesPicker";
import UserTypesPicker from "./components/pickers/UserTypesPicker";
import PaymentPointManagerPicker from "./components/pickers/PaymentPointManagerPicker";
import reducer from "./reducer";
import { USER_PICKER_PROJECTION } from "./actions";

const ROUTE_ADMIN_USERS = "admin/users";
const ROUTE_ADMIN_USER_OVERVIEW = "admin/users/overview";
const ROUTE_ADMIN_USER_NEW = "admin/users/new";

const DEFAULT_CONFIG = {
  translations: [{ key: "en", messages: messagesEn }],
  reducers: [{ key: "admin", reducer }],
  "core.Router": [
    { path: ROUTE_ADMIN_USERS, component: UsersPage },
    { path: ROUTE_ADMIN_USER_NEW, component: UserPage },
    {
      path: `${ROUTE_ADMIN_USER_OVERVIEW}/:user_id`,
      component: UserPage,
    },
  ],
  "core.MainMenu": [AdminMainMenu],
  refs: [
    { key: "admin.UserPicker", ref: UserPicker },
    { key: "admin.EnrolmentOfficerPicker", ref: EnrolmentOfficerPicker },
    { key: "admin.SubstitutionEnrolmentOfficerPicker", ref: SubstitutionEnrolmentOfficerPicker },
    { key: "admin.UserRolesPicker", ref: UserRolesPicker },
    { key: "admin.UserTypesPicker", ref: UserTypesPicker },
    {
      key: "admin.UserPicker.projection",
      ref: USER_PICKER_PROJECTION,
    },
    { key: "admin.users", ref: ROUTE_ADMIN_USERS },
    { key: "admin.userOverview", ref: ROUTE_ADMIN_USER_OVERVIEW },
    { key: "admin.userNew", ref: ROUTE_ADMIN_USER_NEW },
    { key: "admin.PaymentPointManagerPicker", ref: PaymentPointManagerPicker },
  ],
  "invoice.SubjectAndThirdpartyPicker": [
    {
      type: "user",
      picker: UserPicker,
      pickerProjection: USER_PICKER_PROJECTION,
    },
  ],
};

export const AdminModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
