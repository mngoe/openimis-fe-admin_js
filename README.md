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

## Business accesses (UBA) on the user page

The user form no longer has a *Claim Administrator* and an *Enrolment Officer* section.
Both are replaced by **Business accesses** (`components/UserBusinessAccessesPanel.js`): the
list of `{ credential, business object }` links a user holds, `businessAccesses` on the
user mutation.

- a **credential** (`linkType`) is a code from the backend registry, queried through
  `ubaLinkTypes`, not a role. The module owning the model registers it, so `CLAIM_ADMIN`
  (on `location.healthfacility`) and `ENROLMENT` (on `location.location`) are declared by
  the **location** module - core only keeps the codes, so that a module can name a
  credential without depending on location. Other modules register theirs the same way.
- `ubaLinkTypes` also returns `params`: what the declaring module said about the credential
  beyond its models, notably how it sits in the location tree. The panel does not need it,
  the backend row filter does. A client may read it, but must not re-implement the scoping
  it describes - that is enforced server side, in `Model.get_queryset`.
- the panel has no *object type* column: the credential implies the type, and the object
  itself is picked - and, for a saved link, named - by `BusinessObjectPicker` from the
  business object registry of the core module. So a module adding a credential on its own
  model only has to register that model's picker and projection there, nothing changes
  here. A type nobody registered falls back to entering the object identifier.
- linking a health facility or villages **no longer adds the standard claim admin or
  enrolment officer role** to the user. Rights keep coming from the roles alone, the ones
  flagged as UBA rights applying only where the user holds a link (see `docs/rights.md` in
  the core module).
- the panel sends the whole set: the links left out are closed by the backend, which then
  derives the `ClaimAdmin` and `OfficerVillage` records from the links.
- the obligatory field rules a deployment configures for an enrolment officer now follow
  `hasUBA(user)` in `utils.js` - does the user hold at least one link, whichever the
  credential - instead of a lookup on the system roles. No credential code is named here:
  they belong to the backend registry.
- the date of birth moved to the master panel as an optional field. There is no date of
  birth on the interactive user: it is stored on the claim admin / enrolment officer
  record the backend derives from the links, so it only persists for a user holding one of
  those credentials.
- the main menu entries go through `hasPermsAnywhere`: a right the user only holds on the
  objects they are linked to still has to open its page.
