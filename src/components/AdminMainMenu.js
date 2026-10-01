import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import {
  LocationCity,
  Healing,
  HealingOutlined,
  LocalHospital,
  LocalPharmacy,
  LocalPharmacyOutlined,
  Person,
  People,
  PinDrop,
  Tune,
  FormatAlignLeft,
  AccountBox
} from "@material-ui/icons";
import { formatMessage, hasPermsAnywhere, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
import {
  RIGHT_PRODUCTS,
  RIGHT_HEALTHFACILITIES,
  RIGHT_PRICELISTMS,
  RIGHT_PRICELISTMI,
  RIGHT_MEDICALSERVICES,
  RIGHT_MEDICALITEMS,
  // RIGHT_ENROLMENTOFFICER,
  // RIGHT_CLAIMADMINISTRATOR,
 RIGHT_USER_EDIT,
  RIGHT_USERS,
  RIGHT_PROGRAMS,
  RIGHT_LOCATIONS,
} from "../constants";

const ADMIN_MAIN_MENU_CONTRIBUTION_KEY = "admin.MainMenu";
const ADMIN_VOUCHER_MAIN_MENU_CONTRIBUTION_KEY = "admin.voucher.MainMenu";

class AdminMainMenu extends Component {
  constructor(props) {
    super(props);
    this.isWorker = props.modulesManager.getConf("fe-core", "isWorker", false);
  }

  /**
   * A menu entry is a navigation level gate: a right the user only holds on the business
   * objects they are linked to (RoleRight.uba) still has to open its page, which is then
   * responsible for checking each action against the object at hand.
   */
  mayReach = (right) => hasPermsAnywhere(right, { rights: this.props.rights });

  render() {
    const { rights } = this.props;
    const entries = [];

    if (this.isWorker) {
      if (this.mayReach(RIGHT_USERS)) {
        entries.push({
          text: formatMessage(this.props.intl, "admin", "menu.users"),
          icon: <Person />,
          route: "/admin/users",
        });
      }

      entries.push(
        ...this.props.modulesManager
          .getContribs(ADMIN_VOUCHER_MAIN_MENU_CONTRIBUTION_KEY)
          .filter((c) => !c.filter || c.filter(rights)),
      );

      if (!entries.length) return null;

      return (
        <MainMenuContribution
          {...this.props}
          header={formatMessage(this.props.intl, "admin", "mainMenu")}
          icon={<LocationCity />}
          entries={entries}
        />
      );
    }

    if (this.mayReach(RIGHT_PRODUCTS)) {
      entries.push({
        text: formatMessage(this.props.intl, "admin", "menu.products"),
        icon: <Tune />,
        route: "/admin/products",
      });
    }
    if (this.mayReach(RIGHT_HEALTHFACILITIES)) {
      entries.push({
        text: formatMessage(this.props.intl, "admin", "menu.healthFacilities"),
        icon: <LocalHospital />,
        route: "/location/healthFacilities",
      });
    }
    if (this.mayReach(RIGHT_PROGRAMS)) {
      entries.push({
        text: formatMessage(this.props.intl, "admin", "menu.programs"),
        icon: <FormatAlignLeft />,
        route: "/program/programs",
        withDivider: true,
      });
    }
    if (this.mayReach(RIGHT_PRICELISTMS)) {
      entries.push({
        text: formatMessage(this.props.intl, "admin", "menu.medicalServicesPrices"),
        icon: <HealingOutlined />,
        route: "/medical/pricelists/services",
      });
    }
    if (this.mayReach(RIGHT_PRICELISTMI)) {
      entries.push({
        text: formatMessage(this.props.intl, "admin", "menu.medicalItemsPrices"),
        icon: <LocalPharmacyOutlined />,
        route: "/medical/pricelists/items",
        withDivider: true,
      });
    }
    if (this.mayReach(RIGHT_MEDICALSERVICES)) {
      entries.push({
        text: formatMessage(this.props.intl, "admin", "menu.medicalServices"),
        icon: <Healing />,
        route: "/medical/medicalServices",
      });
    }
    if (this.mayReach(RIGHT_MEDICALITEMS)) {
      entries.push({
        text: formatMessage(this.props.intl, "admin", "menu.medicalItems"),
        icon: <LocalPharmacy />,
        route: "/medical/medicalItems",
        withDivider: true,
      });
    }
    if (this.mayReach(RIGHT_USERS)) {
      entries.push({
        text: formatMessage(this.props.intl, "admin", "menu.users"),
        icon: <Person />,
        route: "/admin/users",
      });
    }
    if (this.mayReach(RIGHT_LOCATIONS)) {
      entries.push({
        text: formatMessage(this.props.intl, "admin", "menu.locations"),
        icon: <PinDrop />,
        route: "/location/locations",
      });
    }

    if (this.mayReach(RIGHT_USERS)) {
      entries.push({
        text: formatMessage(this.props.intl, "core", "roleManagement.label"),
        icon: <AccountBox />,
        route: "/roles",
      });
    }

    // entries.push(
    //   ...this.props.modulesManager
    //     .getContribs(ADMIN_MAIN_MENU_CONTRIBUTION_KEY)
    //     .filter((c) => !c.filter || c.filter(rights)),
    // );

    if (!entries.length) return null;
    return (
      <MainMenuContribution
        {...this.props}
        header={formatMessage(this.props.intl, "admin", "mainMenu")}
        icon={<LocationCity />}
        entries={entries}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(injectIntl(connect(mapStateToProps)(AdminMainMenu)));
