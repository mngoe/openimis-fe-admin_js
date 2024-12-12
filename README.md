# openIMIS Frontend Administration reference module
This repository holds the files of the openIMIS Frontend Administration reference module.
It is dedicated to be deployed as a module of [openimis-fe_js](https://github.com/openimis/openimis-fe_js).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/openimis/openimis-fe-admin_js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/openimis/openimis-fe-admin_js/alerts/)

## Main Menu Contributions
* **Administration** (admin.mainMenu translation key) main menu entry

  **Products** (admin.menu.products translation key) main menu entry

  **Health Facilities** (admin.menu.healthFacilities translation key) main menu entry

  **Medical Services Price List** (admin.menu.medicalServicesPrices translation key) main menu entry

  **Medical Items Price List** (admin.menu.medicalItemsPrices translation key) main menu entry

  **Medical Services** (admin.menu.medicalServices translation key) main menu entry

  **Medical Items** (admin.menu.medicalItems translation key) main menu entry

  **Users** (admin.menu.users translation key) main menu entry

  **Users Profiles** (admin.menu.usersProfiles translation key) main menu entry

  **Enrollment Officers** (admin.menu.enrollmentOfficers translation key) main menu entry

  **Claim Administrators** (admin.menu.claimAdministrators translation key) main menu entry

  **Payers** (admin.menu.payers translation key) main menu entry

  **Locations** (admin.menu.locations translation key) main menu entry

## Other Contributions
* `core.Router`: registering all `admin/*` routes to corresponding proxy pages in client-side router

## Proxy Pages
* `FindProduct.aspx`
* `FindHealthFacility.aspx`
* `FindPriceListMS.aspx`
* `FindPriceListMI.aspx`
* `FindMedicalService.aspx`
* `FindMedicalItem.aspx`
* `FindUser.aspx`
* `FindProfile.aspx`
* `FindOfficer.aspx`
* `FindClaimAdministrator.aspx`
* `FindPayer.aspx`
* `Locations.aspx`

## Available Contribution Points
* `admin.MainMenu`: ability to add entries within the main menu entry

## Published Components
None

## Dispatched Redux Actions
None

## Other Modules Listened Redux Actions 
None

## Other Modules Redux State Bindings
* `state.core.user`, to access user info (rights,...)

## Configurations Options
- `passwordGeneratorOptions`, array with possible configuration options, default:{ length: 10, isNumberRequired: true,
      isLowerCaseRequired: true, isUpperCaseRequired: true, isSpecialSymbolRequired: true  }
